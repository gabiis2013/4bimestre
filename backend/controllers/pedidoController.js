//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudPedido = (req, res) => {
  console.log('pedidoController - Rota /abrirCrudPedido - abrir o crudPedido');
  res.sendFile(path.join(__dirname, '../../frontend/pedido/pedido.html'));
}

exports.listarPedidos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pedido ORDER BY idpedido');
    // console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.criarPedido = async (req, res) => {
  //  console.log('Criando pedido com dados:', req.body);
  try {
    const { idpedido, datadopedido, clientepessoacpfpessoa, funcionariopessoacpfpessoa} = req.body;

    // Validação básica
if (!datadopedido) {
  return res.status(400).json({
    error: 'O campo datadopedido é obrigatório'
  });
}
if (!clientepessoacpfpessoa) {
  return res.status(400).json({
    error: 'O campo clientepessoacpfpessoa é obrigatório'
  });
}
if (!funcionariopessoacpfpessoa) {
  return res.status(400).json({
    error: 'O campo funcionariopessoacpfpessoa é obrigatório'
  });
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const result = await query(
      'INSERT INTO pedido (idpedido, datadopedido, clientepessoacpfpessoa, funcionariopessoacpfpessoa) VALUES ($1, $2, $3, $4) RETURNING *',
      [idpedido, datadopedido, clientepessoacpfpessoa, funcionariopessoacpfpessoa]
    );

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);

   

    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM pedido WHERE idpedido = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.atualizarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { datadopedido } = req.body;
    const { clientepessoacpfpessoa } = req.body;
    const { funcionariopessoacpfpessoa } = req.body;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
   
    // Verifica se a pedido existe
    const existingPersonResult = await query(
      'SELECT * FROM pedido WHERE idpedido = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrada' });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      datadopedido: datadopedido !== undefined ? datadopedido : currentPerson.datadopedido,
      clientepessoacpfpessoa: clientepessoacpfpessoa !== undefined ? clientepessoacpfpessoa : currentPerson.clientepessoacpfpessoa,
      funcionariopessoacpfpessoa: funcionariopessoacpfpessoa !== undefined ? funcionariopessoacpfpessoa : currentPerson.funcionariopessoacpfpessoa
    };
     
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Atualiza a pedido
    const updateResult = await query(
      'UPDATE pedido SET datadopedido = $1, clientepessoacpfpessoa = $2, funcionariopessoacpfpessoa = $3 WHERE idpedido = $4 RETURNING *',
      [updatedFields.datadopedido, clientepessoacpfpessoa, funcionariopessoacpfpessoa, id]
    );

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);

    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPedido = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a pedido existe
    const existingPersonResult = await query(
      'SELECT * FROM pedido WHERE idpedido = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrada' });
    }

    // Deleta a pedido (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM pedido WHERE idpedido = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pedido com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}



