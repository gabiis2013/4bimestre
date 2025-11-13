//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudFuncionario = (req, res) => {
  console.log('funcionarioController - Rota /abrirCrudFuncionario - abrir o crudFuncionario');
  res.sendFile(path.join(__dirname, '../../frontend/funcionario/funcionario.html'));
}

exports.listarFuncionarios = async (req, res) => {
  try {
    const result = await query('SELECT * FROM funcionario ORDER BY pessoacpfpessoa');
    // console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar funcionarios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarFuncionario = async (req, res) => {
  //  console.log('Criando funcionario com dados:', req.body);
  try {
    const { pessoacpfpessoa, cargoidcargo, salario, porcentagemcomissao} = req.body;

    // Validação básica
if (!cargoidcargo) {
  return res.status(400).json({
    error: 'O campo cargoidcargo é obrigatório'
  });
}
if (!salario) {
  return res.status(400).json({
    error: 'O campo salario é obrigatório'
  });
}
if (!porcentagemcomissao) {
  return res.status(400).json({
    error: 'O campo porcentagemcomissao é obrigatório'
  });
}

    const result = await query(
      'INSERT INTO funcionario (pessoacpfpessoa, cargoidcargo, salario, porcentagemcomissao) VALUES ($1, $2, $3, $4) RETURNING *',
      [pessoacpfpessoa, cargoidcargo, salario, porcentagemcomissao]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar funcionario:', error);

   

    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterFuncionario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM funcionario WHERE pessoacpfpessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter funcionario:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarFuncionario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { cargoidcargo, salario, porcentagemcomissao } = req.body;

   
    // Verifica se a funcionario existe
    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE pessoacpfpessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      cargoidcargo: cargoidcargo !== undefined ? cargoidcargo : currentPerson.cargoidcargo,
      salario: salario !== undefined ? salario : currentPerson.salario,
      porcentagemcomissao: porcentagemcomissao !== undefined ? porcentagemcomissao : currentPerson.porcentagemcomissao    
    };
  

    // Atualiza a funcionario
    const updateResult = await query(
      'UPDATE funcionario SET cargoidcargo = $1, salario = $2, porcentagemcomissao = $3 WHERE pessoacpfpessoa = $4 RETURNING *',
      [updatedFields.cargoidcargo, salario, porcentagemcomissao, id]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar funcionario:', error);

    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarFuncionario = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a funcionario existe
    const existingPersonResult = await query(
      'SELECT * FROM funcionario WHERE pessoacpfpessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionario não encontrada' });
    }

    // Deleta a funcionario (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM funcionario WHERE pessoacpfpessoa = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar funcionario:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar funcionario com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}



