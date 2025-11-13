const express = require('express');
const router = express.Router();
const formadepagamentoController = require('./../controllers/formadepagamentoController');

// CRUD de FormaDePagamento

router.get('/abrirCrudFormaDePagamento', formadepagamentoController.abrirCrudFormaDePagamento);
router.get('/', formadepagamentoController.listarFormaDePagamentos);
router.post('/', formadepagamentoController.criarFormaDePagamento);
router.get('/:id', formadepagamentoController.obterFormaDePagamento);
router.put('/:id', formadepagamentoController.atualizarFormaDePagamento);
router.delete('/:id', formadepagamentoController.deletarFormaDePagamento);

module.exports = router;
