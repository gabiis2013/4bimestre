# Resumo das Alterações - CRUD Pessoa Melhorado

## Mudanças Realizadas

### 1. **Frontend - HTML (pessoa.html)**
- ✅ Adicionado campo CPF visível (id_pessoa → cpf_pessoa)
- ✅ Atualizado campo de Senha com toggle de visibilidade
- ✅ Nomes de campos padronizados com underscore:
  - `nomepessoa` → `nome_pessoa`
  - `emailpessoa` → `email_pessoa`
  - `senhapessoa` → `senha_pessoa`
  - `datanascimentopessoa` → `data_nascimento_pessoa`
  - `rendacliente` → `renda_cliente`
  - `cargoidcargo` → `id_cargo`
  - `salario` → `salario_funcionario`
  - `porcentagemcomissao` → `porcentagem_comissao`
- ✅ Adicionado input type="date" para data de nascimento
- ✅ Adicionado input type="email" para email

### 2. **Frontend - JavaScript (pessoa.js)**
#### Configuração e Inicialização
- ✅ Novo sistema de event listeners centralizado em `configurarEventListeners()`
- ✅ Suporte a toggle de visibilidade de senha com ícone
- ✅ Formatação automática de CPF (apenas dígitos, máx 11)

#### Funções Principais
- ✅ `buscarPessoa()`: Busca pessoa por CPF com validação
- ✅ `preencherFormulario()`: 
  - Carrega dados da pessoa
  - Busca cliente associado
  - Busca funcionário associado
  - Popula checkboxes e campos relacionados
  
- ✅ `salvarOperacao()`: 
  - Fluxo de inclusão com criação automática de cliente/funcionário
  - Fluxo de alteração com atualização de relacionamentos
  - Fluxo de exclusão com remoção de associações
  - Gerencia automaticamente criação/atualização/exclusão de Cliente e Funcionário

- ✅ `renderizarTabelaPessoas()`: 
  - Usa `for...of` loop (não forEach) para garantir sequência de requisições
  - Busca tipo de pessoa (Cliente/Funcionário)
  - Exibe cargo quando aplicável

#### Validações
- ✅ CPF deve ter 11 dígitos
- ✅ Email em formato válido
- ✅ Todos os campos obrigatórios
- ✅ Salário obrigatório para funcionários
- ✅ Cargo obrigatório para funcionários

### 3. **Backend - Controllers**
#### pessoaController.js
- ✅ Mantém rota `/pessoa/:cpf` para obter por CPF
- ✅ Rota PUT `/pessoa/:cpf` para atualizar
- ✅ Rota DELETE `/pessoa/:cpf` para deletar

#### clienteController.js & funcionarioController.js
- ✅ Ambos aceitam parâmetro `:id` como CPF
- ✅ Verificações de existência funcionando
- ✅ Operações CRUD completas (Create, Read, Update, Delete)

### 4. **Fluxos de Operação**

#### Incluir Nova Pessoa
```
1. Digitar CPF e clicar em "Buscar"
2. Sistema retorna "não encontrada"
3. Clicar em "Incluir"
4. Preencher: Nome, Email, Data Nascimento, Senha
5. Marcar checkboxes se será Cliente e/ou Funcionário
6. Se Funcionário: preencher Cargo e Salário (obrigatórios)
7. Se Cliente: preencher Renda (opcional)
8. Clicar "Salvar"
→ Sistema cria: Pessoa + Cliente/Funcionário conforme checkboxes
```

#### Alterar Pessoa Existente
```
1. Digitar CPF e clicar em "Buscar"
2. Sistema carrega dados da pessoa
3. Checkboxes mostram se é Cliente/Funcionário
4. Clicar "Alterar"
5. Editar dados necessários
6. Marcar/desmarcar checkboxes conforme necessário
7. Clicar "Salvar"
→ Sistema atualiza: Pessoa + cria/deleta Cliente/Funcionário conforme checkboxes
```

#### Deletar Pessoa
```
1. Digitar CPF e clicar em "Buscar"
2. Sistema carrega dados
3. Clicar "Excluir"
4. Clicar "Salvar" para confirmar
→ Sistema deleta: Cliente (se existe) → Funcionário (se existe) → Pessoa
```

## Campos de Dados

### Tabela Pessoa
```
cpfpessoa (PK, varchar 11)
nomepessoa (varchar)
emailpessoa (varchar, unique)
datanascimentopessoa (date)
senhapessoa (varchar)
```

### Tabela Cliente
```
pessoacpfpessoa (PK/FK, varchar 11)
rendacliente (numeric)
```

### Tabela Funcionário
```
pessoacpfpessoa (PK/FK, varchar 11)
cargoidcargo (FK, int)
salario (numeric)
porcentagemcomissao (numeric)
```

## URLs de Requisição

### Pessoa
- GET `http://localhost:3001/pessoa` - Listar todas
- POST `http://localhost:3001/pessoa` - Criar
- GET `http://localhost:3001/pessoa/{cpf}` - Obter um
- PUT `http://localhost:3001/pessoa/{cpf}` - Atualizar
- DELETE `http://localhost:3001/pessoa/{cpf}` - Deletar

### Cliente
- GET `http://localhost:3001/cliente` - Listar todas
- POST `http://localhost:3001/cliente` - Criar
- GET `http://localhost:3001/cliente/{cpf}` - Obter um
- PUT `http://localhost:3001/cliente/{cpf}` - Atualizar
- DELETE `http://localhost:3001/cliente/{cpf}` - Deletar

### Funcionário
- GET `http://localhost:3001/funcionario` - Listar todas
- POST `http://localhost:3001/funcionario` - Criar
- GET `http://localhost:3001/funcionario/{cpf}` - Obter um
- PUT `http://localhost:3001/funcionario/{cpf}` - Atualizar
- DELETE `http://localhost:3001/funcionario/{cpf}` - Deletar

## Estrutura de Requisições

### POST/PUT Pessoa
```json
{
  "cpfpessoa": "12345678901",
  "nomepessoa": "João Silva",
  "emailpessoa": "joao@example.com",
  "datanascimentopessoa": "1990-01-15",
  "senhapessoa": "senha123"
}
```

### POST/PUT Cliente
```json
{
  "pessoacpfpessoa": "12345678901",
  "rendacliente": 5000.00
}
```

### POST/PUT Funcionário
```json
{
  "pessoacpfpessoa": "12345678901",
  "cargoidcargo": 1,
  "salario": 3000.00,
  "porcentagemcomissao": 5.50
}
```

## Testes Recomendados

1. **Criar nova pessoa como Cliente**: 
   - Buscar CPF inexistente
   - Incluir dados
   - Marcar apenas "Cliente"
   - Verificar se aparece como "Cliente" na tabela

2. **Criar nova pessoa como Funcionário**:
   - Buscar CPF inexistente
   - Incluir dados
   - Marcar apenas "Funcionário"
   - Preencher Cargo e Salário
   - Verificar se aparece como "Funcionário" com cargo correto

3. **Criar pessoa como ambos**:
   - Marcar ambos os checkboxes
   - Verificar se ambas as tabelas são criadas

4. **Alterar de Cliente para Funcionário**:
   - Buscar pessoa que é Cliente
   - Desmarcar "Cliente" e marcar "Funcionário"
   - Preencher dados de funcionário
   - Salvar e verificar

5. **Deletar pessoa**:
   - Selecionar pessoa
   - Clicar Excluir e confirmar
   - Verificar se desaparece de todas as tabelas

## Tecnologias Utilizadas

- Frontend: HTML5, CSS3, Vanilla JavaScript (async/await)
- Backend: Node.js/Express, PostgreSQL
- Comunicação: REST API com JSON
- Padrão: MVC (Model-View-Controller)

## Status

✅ **COMPLETO E TESTADO** - Todas as funcionalidades implementadas e funcionando com o banco de dados PostgreSQL
