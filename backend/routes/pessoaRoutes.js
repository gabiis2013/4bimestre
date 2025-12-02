const express = require('express');
const router = express.Router();
const pessoaController = require('./../controllers/pessoaController');

// CRUD de Pessoas

router.get('/abrirCrudPessoa', pessoaController.abrirCrudPessoa);
router.get('/', pessoaController.listarPessoas);
router.post('/', pessoaController.criarPessoa);
router.get('/:cpf', pessoaController.obterPessoa);
router.put('/:cpf', pessoaController.atualizarPessoa);
router.delete('/:cpf', pessoaController.deletarPessoa);

module.exports = router;