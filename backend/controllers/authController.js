const db = require('../database');

// ======================================
// REGISTRO DE NOVO USUÁRIO
// ======================================
exports.registro = async (req, res) => {
  const { name, email, password, cpf, birthdate } = req.body;

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

    // Definir cookies
    res.cookie('usuarioLogado', user.nomepessoa, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('usuarioCpf', user.cpfpessoa, {
      sameSite: 'None',
      secure: true,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

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
// ROTAS DE RECUPERAÇÃO DE SENHA (IMPLEMENTAÇÕES INICIAIS)
// ======================================

exports.solicitarRecuperacao = (req, res) => {
  const { email } = req.body;
  console.log('🚧 [STUB] Solicitação de recuperação recebida para:', email);
  // Lógica futura: 
  // 1. Verificar se o email existe.
  // 2. Gerar um código único.
  // 3. Salvar o código e o timestamp no banco de dados (tabela de tokens/recuperação).
  // 4. Enviar o código por email.
  res.json({
    success: true,
    message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.'
    // Para DEV, você pode retornar o código aqui: codigo_dev: '123456' 
  }); 
};

exports.verificarCodigo = (req, res) => {
  const { email, code } = req.body;
  console.log('🚧 [STUB] Verificação de código recebida para:', { email, code });
  // Lógica futura: 
  // 1. Buscar o código no banco de dados para o email.
  // 2. Verificar se o código corresponde e se não está expirado.
  res.json({
    success: true,
    message: 'Código verificado com sucesso.'
  });
};

exports.redefinirSenha = async (req, res) => {
  const { email, code, nova_senha } = req.body;

  if (nova_senha.length > 20) {
    return res.status(400).json({ error: 'Nova senha deve ter no máximo 20 caracteres.' });
  }
  
  console.log('🚧 [STUB] Redefinição de senha recebida para:', email);
  // Lógica futura: 
  // 1. Verificar o código e o email (novamente).
  // 2. Se válido, atualizar a senha (senhaPessoa) para o novo valor.
  // 3. Invalidar/deletar o token de recuperação.
  
  // Por enquanto, apenas simula o sucesso:
  res.json({
    success: true,
    message: 'Senha redefinida com sucesso.'
  });
};