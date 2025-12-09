const db = require('../database');
const { enviarEmailRecuperacao } = require('../config/emailConfig');

// ======================================
// REGISTRO DE NOVO USUÁRIO
// ======================================
exports.registro = async (req, res) => {
  const {
    name, email, password, cpf, birthdate,
    cidade, estado, rua, numero, cep, complemento, bairro
  } = req.body;

  console.log('🔍 Tentativa de registro:', { email, cpf });

  // Validações básicas
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  if (!cpf || cpf.length !== 11) {
    return res.status(400).json({ error: 'CPF deve ter 11 dígitos.' });
  }

  if (password.length > 20) {
    return res.status(400).json({ error: 'Senha deve ter no máximo 20 caracteres.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido.' });
  }

  // Data de nascimento padrão se não fornecida
  const dataNascimento = birthdate || '2000-01-01';

  try {
    // Verificar se CPF ou email já existem
    const checkUser = await db.query(
      'SELECT cpfPessoa, emailPessoa FROM Pessoa WHERE cpfPessoa = $1 OR emailPessoa = $2',
      [cpf, email]
    );

    if (checkUser.rows.length > 0) {
      if (checkUser.rows[0].cpfpessoa === cpf) {
        return res.status(400).json({ error: 'CPF já cadastrado.' });
      }
      if (checkUser.rows[0].emailpessoa === email) {
        return res.status(400).json({ error: 'E-mail já cadastrado.' });
      }
    }

    // Inserir pessoa
    const resultPessoa = await db.query(
      `INSERT INTO Pessoa (cpfPessoa, nomePessoa, dataNascimentoPessoa, emailPessoa, senhaPessoa)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING cpfPessoa, nomePessoa, emailPessoa`,
      [cpf, name, dataNascimento, email, password]
    );

    const user = resultPessoa.rows[0];

    // Inserir cliente (renda padrão 0)
    await db.query(
      'INSERT INTO Cliente (PessoaCpfPessoa, rendaCliente) VALUES ($1, $2)',
      [cpf, 0]
    );

    console.log('✅ Usuário registrado:', user.emailpessoa);

    res.json({
      message: 'Usuário registrado com sucesso.',
      user: {
        cpf: user.cpfpessoa,
        nome: user.nomepessoa,
        email: user.emailpessoa,
        id: user.cpfpessoa
      },
      logged: true
    });

  } catch (err) {
    console.error('❌ Erro no registro:', err);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
};

// ======================================
// LOGIN
// ======================================
exports.login = async (req, res) => {
  const { email_usuario, senha_usuario } = req.body;

  console.log('🔍 Tentativa de login:', email_usuario);

  if (!email_usuario || !senha_usuario) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // Buscar pessoa e verificar se é funcionário
    const resultPessoa = await db.query(
      `SELECT p.cpfPessoa, p.nomePessoa, p.emailPessoa, p.senhaPessoa,
              f.PessoaCpfPessoa as is_funcionario, c.nomeCargo
       FROM Pessoa p
       LEFT JOIN Funcionario f ON p.cpfPessoa = f.PessoaCpfPessoa
       LEFT JOIN Cargo c ON f.CargoIdCargo = c.idCargo
       WHERE p.emailPessoa = $1`,
      [email_usuario]
    );

    if (resultPessoa.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const user = resultPessoa.rows[0];

    // Verificar senha (texto plano - não recomendado em produção)
    if (user.senhapessoa !== senha_usuario) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    console.log('✅ Login bem-sucedido:', user.emailpessoa);

    res.json({
      message: 'Login efetuado com sucesso.',
      user: {
        cpf: user.cpfpessoa,
        id: user.cpfpessoa,
        nome: user.nomepessoa,
        email: user.emailpessoa,
        is_funcionario: !!user.is_funcionario,
        cargo: user.nomecargo || null,
        token: 'session-token-' + user.cpfpessoa
      },
      logged: true
    });

  } catch (err) {
    console.error('❌ Erro no login:', err);
    res.status(500).json({ error: 'Erro ao efetuar login.' });
  }
};

// ======================================
// VERIFICAR SE ESTÁ LOGADO
// ======================================
exports.verificarLogin = async (req, res) => {
  const cpf = req.cookies.usuarioCpf;

  console.log('🔍 Verificando login:', { cpf });

  if (!cpf) {
    return res.json({ logged: false });
  }

  try {
    // Verificar se o usuário ainda existe no banco
    const result = await db.query(
      `SELECT p.cpfPessoa, p.nomePessoa, p.emailPessoa,
              f.PessoaCpfPessoa as is_funcionario, c.nomeCargo
       FROM Pessoa p
       LEFT JOIN Funcionario f ON p.cpfPessoa = f.PessoaCpfPessoa
       LEFT JOIN Cargo c ON f.CargoIdCargo = c.idCargo
       WHERE p.cpfPessoa = $1`,
      [cpf]
    );

    if (result.rows.length === 0) {
      return res.json({ logged: false });
    }

    const user = result.rows[0];

    res.json({
      logged: true,
      cpf: user.cpfpessoa,
      nome: user.nomepessoa,
      email: user.emailpessoa,
      is_funcionario: !!user.is_funcionario,
      cargo: user.nomecargo || null
    });

  } catch (err) {
    console.error('❌ Erro ao verificar login:', err);
    res.status(500).json({ error: 'Erro ao verificar sessão.' });
  }
};

// ======================================
// LOGOUT
// ======================================
exports.logout = (req, res) => {
  console.log('\n👋 [LOGOUT] Iniciando processo de logout...');
  
  const cookieOptions = {
    sameSite: 'None',
    secure: true,
    httpOnly: true,
    path: '/',
  };
  
  const cookiesParaLimpar = [
    'usuarioLogado',
    'usuarioCpf',
    'token',
    'userId',
    'userName',
    'userEmail',
    'userType',
    'userCargo'
  ];
  
  cookiesParaLimpar.forEach(cookieName => {
    res.clearCookie(cookieName, cookieOptions);
    console.log(`   🗑️ Cookie limpo: ${cookieName}`);
  });
  
  console.log('✅ [LOGOUT] Todos os cookies removidos\n');

  res.json({
    status: 'deslogado',
    message: 'Logout realizado com sucesso.',
    logged: false
  });
};

// ======================================
// VERIFICAR EMAIL
// ======================================
exports.verificarEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório' });
  }

  try {
    const result = await db.query(
      'SELECT nomePessoa FROM Pessoa WHERE emailPessoa = $1',
      [email]
    );

    if (result.rows.length > 0) {
      return res.json({
        status: 'existe',
        nome: result.rows[0].nomepessoa
      });
    }

    res.json({ status: 'nao_encontrado' });
  } catch (err) {
    console.error('❌ Erro ao verificar email:', err);
    res.status(500).json({ error: 'Erro ao verificar email.' });
  }
};

// ======================================
// ATUALIZAR SENHA
// ======================================
exports.atualizarSenha = async (req, res) => {
  const cpf = req.cookies.usuarioCpf;
  const { senha_atual, nova_senha } = req.body;

  if (!cpf) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  if (!senha_atual || !nova_senha) {
    return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias.' });
  }

  if (nova_senha.length > 20) {
    return res.status(400).json({ error: 'Nova senha deve ter no máximo 20 caracteres.' });
  }

  try {
    // Verificar senha atual
    const checkPassword = await db.query(
      'SELECT senhaPessoa FROM Pessoa WHERE cpfPessoa = $1',
      [cpf]
    );

    if (checkPassword.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (checkPassword.rows[0].senhapessoa !== senha_atual) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    // Atualizar senha
    await db.query(
      'UPDATE Pessoa SET senhaPessoa = $1 WHERE cpfPessoa = $2',
      [nova_senha, cpf]
    );

    console.log('✅ Senha atualizada para CPF:', cpf);

    res.json({ message: 'Senha atualizada com sucesso.' });

  } catch (err) {
    console.error('❌ Erro ao atualizar senha:', err);
    res.status(500).json({ error: 'Erro ao atualizar senha.' });
  }
};

// ======================================
// RECUPERAÇÃO DE SENHA
// ======================================

const codigosRecuperacao = new Map();

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.solicitarRecuperacao = async (req, res) => {
  const { email } = req.body;

  console.log('\n📧 [RECUPERAÇÃO] Solicitação para:', email);

  if (!email) {
    return res.status(400).json({ 
      success: false,
      error: 'Email é obrigatório' 
    });
  }

  try {
    const result = await db.query(
      'SELECT cpfPessoa, nomePessoa, emailPessoa FROM Pessoa WHERE emailPessoa = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Email não encontrado:', email);
      return res.status(404).json({ 
        success: false,
        error: 'Email não cadastrado no sistema' 
      });
    }

    const user = result.rows[0];
    const codigo = gerarCodigo();
    
    codigosRecuperacao.set(email, {
      codigo: codigo,
      timestamp: Date.now(),
      tentativas: 0
    });

    console.log('✅ Código gerado:', codigo);
    console.log('⏰ Válido por 10 minutos');

    console.log('📨 Enviando email para:', email);
    
    const emailResult = await enviarEmailRecuperacao(
      user.emailpessoa,
      user.nomepessoa,
      codigo
    );

    if (emailResult.success) {
      console.log('✅ Email enviado com sucesso!');
      
      setTimeout(() => {
        if (codigosRecuperacao.has(email)) {
          codigosRecuperacao.delete(email);
          console.log('🗑️ Código expirado removido para:', email);
        }
      }, 10 * 60 * 1000);

      res.json({
        success: true,
        message: 'Código enviado para o email cadastrado'
      });
    } else {
      console.error('❌ Falha ao enviar email:', emailResult.error);
      console.log('⚠️ MODO FALLBACK - Código disponível no console');
      console.log('\n╔════════════════════════════════════╗');
      console.log('📨 CÓDIGO DE RECUPERAÇÃO (FALLBACK)');
      console.log('╠════════════════════════════════════╣');
      console.log('Para:', user.nomepessoa, `<${email}>`);
      console.log('Código:', codigo);
      console.log('╚════════════════════════════════════╝\n');
      
      res.json({
        success: true,
        message: 'Erro ao enviar email, mas o código está disponível. Verifique o console do servidor.',
        warning: 'Email não enviado - verifique a configuração SMTP'
      });
    }

  } catch (err) {
    console.error('❌ Erro ao solicitar recuperação:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar solicitação' 
    });
  }
};

exports.verificarCodigo = async (req, res) => {
  const { email, code } = req.body;

  console.log('\n🔍 [VERIFICAÇÃO] Email:', email, '| Código:', code);

  if (!email || !code) {
    return res.status(400).json({ 
      success: false,
      error: 'Email e código são obrigatórios' 
    });
  }

  try {
    const codigoData = codigosRecuperacao.get(email);

    if (!codigoData) {
      console.log('❌ Nenhum código encontrado para:', email);
      return res.status(404).json({ 
        success: false,
        error: 'Código não encontrado ou expirado. Solicite um novo código.' 
      });
    }

    const tempoDecorrido = Date.now() - codigoData.timestamp;
    
    if (tempoDecorrido > 10 * 60 * 1000) {
      codigosRecuperacao.delete(email);
      console.log('❌ Código expirado para:', email);
      return res.status(400).json({ 
        success: false,
        error: 'Código expirado. Solicite um novo código.' 
      });
    }

    if (codigoData.tentativas >= 5) {
      codigosRecuperacao.delete(email);
      console.log('❌ Muitas tentativas para:', email);
      return res.status(429).json({ 
        success: false,
        error: 'Muitas tentativas. Solicite um novo código.' 
      });
    }

    if (codigoData.codigo !== code) {
      codigoData.tentativas++;
      const tentativasRestantes = 5 - codigoData.tentativas;
      console.log(`❌ Código incorreto (Tentativa ${codigoData.tentativas}/5)`);
      return res.status(400).json({ 
        success: false,
        error: `Código incorreto. ${tentativasRestantes} tentativa(s) restante(s).` 
      });
    }

    console.log('✅ Código verificado com sucesso!');

    res.json({
      success: true,
      message: 'Código verificado com sucesso'
    });

  } catch (err) {
    console.error('❌ Erro ao verificar código:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao verificar código' 
    });
  }
};

exports.redefinirSenha = async (req, res) => {
  const { email, code, nova_senha } = req.body;

  console.log('\n🔑 [REDEFINIR] Alterando senha para:', email);

  if (!email || !code || !nova_senha) {
    return res.status(400).json({ 
      success: false,
      error: 'Email, código e nova senha são obrigatórios' 
    });
  }

  if (nova_senha.length < 6 || nova_senha.length > 20) {
    return res.status(400).json({ 
      success: false,
      error: 'A senha deve ter entre 6 e 20 caracteres' 
    });
  }

  try {
    const codigoData = codigosRecuperacao.get(email);

    if (!codigoData || codigoData.codigo !== code) {
      console.log('❌ Código inválido ao redefinir senha');
      return res.status(400).json({ 
        success: false,
        error: 'Código inválido ou expirado' 
      });
    }

    const checkUser = await db.query(
      'SELECT cpfPessoa, nomePessoa FROM Pessoa WHERE emailPessoa = $1',
      [email]
    );

    if (checkUser.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return res.status(404).json({ 
        success: false,
        error: 'Usuário não encontrado' 
      });
    }

    const user = checkUser.rows[0];

    await db.query(
      'UPDATE Pessoa SET senhaPessoa = $1 WHERE emailPessoa = $2',
      [nova_senha, email]
    );

    codigosRecuperacao.delete(email);

    console.log('✅ Senha redefinida com sucesso para:', user.nomepessoa);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (err) {
    console.error('❌ Erro ao redefinir senha:', err);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao redefinir senha' 
    });
  }
};