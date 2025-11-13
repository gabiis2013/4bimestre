const express = require('express');
const router = express.Router();
const pessoaController = require('./../controllers/pessoaController');

// CRUD de Pessoas

router.get('/abrirCrudPessoa', pessoaController.abrirCrudPessoa);
router.get('/', pessoaController.listarPessoas);
router.post('/', pessoaController.criarPessoa);
router.get('/:cpfPessoa', pessoaController.obterPessoa);
router.put('/:cpfPessoa', pessoaController.atualizarPessoa);
router.delete('/:cpfPessoa', pessoaController.deletarPessoa);

module.exports = router;