//import { query } from '../database.js';
const { query } = require('../database');
const path = require('path');

// Abrir tela do CRUD
exports.abrirCrudPessoa = (req, res) => {
  console.log('pessoaController - Rota /abrirCrudPessoa - abrir o crudPessoa');
  res.sendFile(path.join(__dirname, '../../frontend/pessoa/pessoa.html'));
}

// Listar todas as pessoas
exports.listarPessoas = async (req, res) => {
  try {
    const result = await query('SELECT * FROM pessoa ORDER BY cpfpessoa');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Criar pessoa
exports.criarPessoa = async (req, res) => {
  try {
    const { cpfpessoa, nomepessoa, datanascimentopessoa, emailpessoa, senhapessoa } = req.body;

    if (!cpfpessoa || !nomepessoa || !datanascimentopessoa || !emailpessoa || !senhapessoa) {
      return res.status(400).json({ error: 'cpfpessoa, nomepessoa, datanascimentopessoa, emailpessoa e senhapessoa são obrigatórios' });
    }

    const result = await query(
      'INSERT INTO pessoa (cpfpessoa, nomepessoa, datanascimentopessoa, emailpessoa, senhapessoa) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cpfpessoa, nomepessoa, datanascimentopessoa, emailpessoa, senhapessoa]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Obter pessoa por CPF
// Obter pessoa pelo CPF
exports.obterPessoa = async (req, res) => {
  try {
      
   
      const cpfpessoa = req.params.cpf; // antes: id
      console.log("cpfpessoa "+req.params.cpf);
      const result = await query('SELECT * FROM pessoa WHERE cpfpessoa = $1', [cpfpessoa]);

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Pessoa não encontrada' });
      }

      res.json(result.rows[0]);
  } catch (error) {
      console.error('Erro ao obter pessoa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
 
// Atualizar pessoa
exports.atualizarPessoa = async (req, res) => {
  try {
    console.log("Todos os parâmetros atualizar:", JSON.stringify(req.params));
      const cpfpessoa = req.params.cpfpessoa; // antes: id


      const { nomepessoa, emailpessoa, senhapessoa, datanascimentopessoa } = req.body;

      const existingPersonResult = await query('SELECT * FROM pessoa WHERE cpfpessoa = $1', [cpfpessoa]);

      if (existingPersonResult.rows.length === 0) {
          return res.status(404).json({ error: 'Pessoa não encontrada' });
      }

      const currentPerson = existingPersonResult.rows[0];
      const updatedFields = {
          nomepessoa: nomepessoa ?? currentPerson.nomepessoa,
          emailpessoa: emailpessoa ?? currentPerson.emailpessoa,
          senhapessoa: senhapessoa ?? currentPerson.senhapessoa,
          datanascimentopessoa: datanascimentopessoa ?? currentPerson.datanascimentopessoa
      };

      const updateResult = await query(
          'UPDATE pessoa SET nomepessoa = $1, emailpessoa = $2, senhapessoa = $3, datanascimentopessoa = $4 WHERE cpfpessoa = $5 RETURNING *',
          [updatedFields.nomepessoa, emailpessoa, senhapessoa, datanascimentopessoa, cpfpessoa]
      );

      res.json(updateResult.rows[0]);
  } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Deletar pessoa
exports.deletarPessoa = async (req, res) => {
  try {
      const cpf = req.params.cpf;

      const existingPersonResult = await query('SELECT * FROM pessoa WHERE cpfpessoa = $1', [cpf]);

      if (existingPersonResult.rows.length === 0) {
          return res.status(404).json({ error: 'Pessoa não encontrada' });
      }

      await query('DELETE FROM pessoa WHERE cpfpessoa = $1', [cpf]);
      res.status(204).send();
  } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
  }
}