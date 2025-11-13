//import { query } from '../database.js';
const { query } = require('../database');
// Funções do controller

const path = require('path');

exports.abrirCrudPagamento = (req, res) => {
  console.log('pagamentoController - Rota /abrirCrudPagamento - abrir o crudPagamento');
  res.sendFile(path.join(__dirname, '../../frontend/pagamento/pagamento.html'));
}

exports.listarPagamentos = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pagamento ORDER BY idpagamento');
    // console.log('Resultado do SELECT:', result.rows);//verifica se está retornando algo
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.criarPagamento = async (req, res) => {
  //  console.log('Criando pagamento com dados:', req.body);
  try {
    const { idpagamento, pedidoidpedido, datapagamento, valortotalpagamento} = req.body;

    // Validação básica
if (!pedidoidpedido) {
  return res.status(400).json({
    error: 'O campo pedidoidpedido é obrigatório'
  });
}

if (!datapagamento) {
  return res.status(400).json({
    error: 'O campo datapagamento é obrigatório'
  });
}

if (!valortotalpagamento) {
  return res.status(400).json({
    error: 'O campo valortotalpagamento é obrigatório'
  });
}

    const result = await query(
      'INSERT INTO pagamento (idpagamento, pedidoidpedido, datapagamento, valortotalpagamento) VALUES ($1, $2, $3, $4) RETURNING *',
      [idpagamento, pedidoidpedido, datapagamento, valortotalpagamento]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);

   

    // Verifica se é erro de violação de constraint NOT NULL
    if (error.code === '23502') {
      return res.status(400).json({
        error: 'Dados obrigatórios não fornecidos'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.obterPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID deve ser um número válido' });
    }

    const result = await query(
      'SELECT * FROM pagamento WHERE idpagamento = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter pagamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.atualizarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { pedidoidpedido, datapagamento, valortotalpagamento } = req.body;

   
    // Verifica se a pagamento existe
    const existingPersonResult = await query(
      'SELECT * FROM pagamento WHERE idpagamento = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Constrói a query de atualização dinamicamente para campos não nulos
    const currentPerson = existingPersonResult.rows[0];
    const updatedFields = {
      pedidoidpedido: pedidoidpedido !== undefined ? pedidoidpedido : currentPerson.pedidoidpedido,  
      datapagamento: datapagamento !== undefined ? datapagamento : currentPerson.datapagamento,
      valortotalpagamento: valortotalpagamento !== undefined ? valortotalpagamento : currentPerson.valortotalpagamento,
  }

  const updateResult = await query(
    'UPDATE pagamento SET pedidoidpedido = $1, datapagamento = $2, valortotalpagamento = $3 WHERE idpagamento = $4 RETURNING *',
    [updatedFields.pedidoidpedido, updatedFields.datapagamento, updatedFields.valortotalpagamento, id]
  );
  

    res.json(updateResult.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);

    
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

exports.deletarPagamento = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    // Verifica se a pagamento existe
    const existingPersonResult = await query(
      'SELECT * FROM pagamento WHERE idpagamento = $1',
      [id]
    );

    if (existingPersonResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Deleta a pagamento (as constraints CASCADE cuidarão das dependências)
    await query(
      'DELETE FROM pagamento WHERE idpagamento = $1',
      [id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar pagamento:', error);

    // Verifica se é erro de violação de foreign key (dependências)
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Não é possível deletar pagamento com dependências associadas'
      });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}



