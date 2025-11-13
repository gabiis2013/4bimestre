//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudCliente = (req, res) => {
  console.log('clienteController - Rota /abrirCrudCliente - abrir o crudCliente');
  res.sendFile(path.join(__dirname, '../../frontend/cliente/cliente.html'));
}

exports.listarClientes = async (req, res) => {
  try {
    const result = await query('SELECT * FROM cliente ORDER BY pessoacpfpessoa');
    // console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarCliente = async (req, res) => {
  //  console.log('Criando cliente com dados:', req.body);
  try {
    const { pessoacpfpessoa, rendacliente} = req.body;

    // Validação básica
if (!rendacliente) {
  return res.status(400).json({
    error: 'O campo rendacliente é obrigatório'
  });
}

    const result = await query(
      'INSERT INTO cliente (pessoacpfpessoa, rendacliente) VALUES ($1, $2) RETURNING *',
      [pessoacpfpessoa, rendacliente]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);

   

    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM cliente WHERE pessoacpfpessoa = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rendacliente } = req.body;

   
    // Verifica se a cliente existe
    const existingPersonResult = await query(
      'SELECT * FROM cliente WHERE pessoacpfpessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrada' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      rendacliente: rendacliente !== undefined ? rendacliente : currentPerson.rendacliente    
    };
  
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Atualiza a cliente
    const updateResult = await query(
      'UPDATE cliente SET rendacliente = $1 WHERE pessoacpfpessoa = $2 RETURNING *',
      [updatedFields.rendacliente, id]
    );

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);

    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarCliente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a cliente existe
    const existingPersonResult = await query(
      'SELECT * FROM cliente WHERE pessoacpfpessoa = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrada' });
    }

    // Deleta a cliente (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM cliente WHERE pessoacpfpessoa = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar cliente com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}



