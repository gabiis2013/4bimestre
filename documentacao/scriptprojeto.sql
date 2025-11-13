-- ============================================
-- CRIAÇÃO DO BANCO DE DADOS (opcional)
-- ============================================
-- CREATE DATABASE sistema_vendas;
-- \c sistema_vendas;

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

CREATE TABLE Cargo (
    idCargo SERIAL PRIMARY KEY,
    nomeCargo VARCHAR(45) NOT NULL
);

CREATE TABLE Pessoa (
    cpfPessoa CHAR(11) PRIMARY KEY,
    nomePessoa VARCHAR(60) NOT NULL,
    dataNascimentoPessoa DATE NOT NULL,
    emailPessoa VARCHAR(100) UNIQUE NOT NULL,
    senhaPessoa VARCHAR(255) NOT NULL
);

CREATE TABLE Cliente (
    PessoaCpfPessoa CHAR(11) PRIMARY KEY REFERENCES Pessoa(cpfPessoa),
    rendaCliente DOUBLE PRECISION
);

CREATE TABLE Funcionario (
    PessoaCpfPessoa CHAR(11) PRIMARY KEY REFERENCES Pessoa(cpfPessoa),
    salario DOUBLE PRECISION,
    CargoIdCargo INT REFERENCES Cargo(idCargo),
    porcentagemComissao DOUBLE PRECISION
);

CREATE TABLE Produto (
    idProduto SERIAL PRIMARY KEY,
    nomeProduto VARCHAR(45) NOT NULL,
    quantidadeEmEstoque INT NOT NULL,
    precoUnitario DOUBLE PRECISION NOT NULL
);

CREATE TABLE Pedido (
    idPedido SERIAL PRIMARY KEY,
    dataDoPedido DATE NOT NULL,
    ClientePessoaCpfPessoa CHAR(11) REFERENCES Cliente(PessoaCpfPessoa),
    FuncionarioPessoaCpfPessoa CHAR(11) REFERENCES Funcionario(PessoaCpfPessoa)
);

CREATE TABLE Pagamento (
    idPagamento SERIAL PRIMARY KEY,
    PedidoIdPedido INT REFERENCES Pedido(idPedido),
    dataPagamento TIMESTAMP NOT NULL,
    valorTotalPagamento DOUBLE PRECISION
);

CREATE TABLE FormaDePagamento (
    idFormaPagamento SERIAL PRIMARY KEY,
    nomeFormaPagamento VARCHAR(100) NOT NULL
);

-- ============================================
-- TABELAS RELACIONAIS
-- ============================================

CREATE TABLE PedidoHasProduto (
    ProdutoIdProduto INT REFERENCES Produto(idProduto),
    PedidoIdPedido INT REFERENCES Pedido(idPedido),
    quantidade INT NOT NULL,
    precoUnitario DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (ProdutoIdProduto, PedidoIdPedido)
);

CREATE TABLE PagamentoHasFormaPagamento (
    PagamentoIdPedido INT REFERENCES Pagamento(idPagamento),
    FormaPagamentoIdFormaPagamento INT REFERENCES FormaDePagamento(idFormaPagamento),
    valorPago DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (PagamentoIdPedido, FormaPagamentoIdFormaPagamento)
);

-- ============================================
-- POPULAÇÃO DAS TABELAS
-- ============================================

-- Cargo
INSERT INTO Cargo (nomeCargo) VALUES
('Vendedor'),
('Gerente'),
('Atendente'),
('Supervisor'),
('Caixa'),
('Auxiliar'),
('Estoquista'),
('Entregador'),
('Assistente'),
('Diretor');

-- Pessoa
INSERT INTO Pessoa (cpfPessoa, nomePessoa, dataNascimentoPessoa, emailPessoa, senhaPessoa) VALUES
('11111111111','João Silva','1990-01-01','joao.silva@email.com','senha123'),
('22222222222','Maria Souza','1985-05-10','maria.souza@email.com','senha123'),
('33333333333','Carlos Pereira','1992-03-15','carlos.pereira@email.com','senha123'),
('44444444444','Ana Lima','1998-07-20','ana.lima@email.com','senha123'),
('55555555555','Lucas Rocha','1980-09-25','lucas.rocha@email.com','senha123'),
('66666666666','Fernanda Alves','1995-11-30','fernanda.alves@email.com','senha123'),
('77777777777','Rafael Santos','1987-12-12','rafael.santos@email.com','senha123'),
('88888888888','Juliana Costa','1993-02-22','juliana.costa@email.com','senha123'),
('99999999999','Pedro Martins','1999-06-05','pedro.martins@email.com','senha123'),
('10101010101','Clara Mendes','2000-08-18','clara.mendes@email.com','senha123');

-- Cliente
INSERT INTO Cliente VALUES
('11111111111',3500.00),
('22222222222',4200.00),
('33333333333',2800.00),
('44444444444',5000.00),
('55555555555',6000.00),
('66666666666',3200.00),
('77777777777',4500.00),
('88888888888',3800.00),
('99999999999',4100.00),
('10101010101',3700.00);

-- Funcionario
INSERT INTO Funcionario VALUES
('11111111111',2500.00,1,0.05),
('22222222222',3000.00,2,0.10),
('33333333333',2200.00,3,0.03),
('44444444444',2700.00,4,0.04),
('55555555555',2800.00,5,0.05),
('66666666666',2600.00,6,0.02),
('77777777777',3100.00,7,0.06),
('88888888888',2300.00,8,0.03),
('99999999999',2900.00,9,0.07),
('10101010101',3500.00,10,0.12);

-- Produto (Artigos Católicos)
INSERT INTO Produto (nomeProduto, quantidadeEmEstoque, precoUnitario) VALUES
('Terço de Madeira', 50, 15.00),
('Imagem de Nossa Senhora Aparecida', 20, 80.00),
('Crucifixo de Parede', 25, 60.00),
('Bíblia Sagrada', 30, 45.00),
('Vela Religiosa', 100, 5.00),
('Chaveiro de Santo Antônio', 40, 12.00),
('Escapulário', 70, 10.00),
('Quadro do Sagrado Coração de Jesus', 15, 90.00),
('Pulseira Religiosa', 35, 18.00),
('Rosário Luminoso', 28, 25.00);

-- Pedido
INSERT INTO Pedido (dataDoPedido, ClientePessoaCpfPessoa, FuncionarioPessoaCpfPessoa) VALUES
('2025-09-01','11111111111','22222222222'),
('2025-09-02','33333333333','44444444444'),
('2025-09-03','55555555555','66666666666'),
('2025-09-04','77777777777','88888888888'),
('2025-09-05','99999999999','10101010101'),
('2025-09-06','22222222222','33333333333'),
('2025-09-07','44444444444','55555555555'),
('2025-09-08','66666666666','77777777777'),
('2025-09-09','88888888888','99999999999'),
('2025-09-10','10101010101','11111111111');

-- Pagamento
INSERT INTO Pagamento (PedidoIdPedido, dataPagamento, valorTotalPagamento) VALUES
(1,'2025-09-01 10:00:00',150.00),
(2,'2025-09-02 11:00:00',200.00),
(3,'2025-09-03 14:00:00',300.00),
(4,'2025-09-04 16:00:00',400.00),
(5,'2025-09-05 09:00:00',500.00),
(6,'2025-09-06 12:30:00',600.00),
(7,'2025-09-07 15:20:00',700.00),
(8,'2025-09-08 13:10:00',800.00),
(9,'2025-09-09 17:45:00',900.00),
(10,'2025-09-10 08:50:00',1000.00);

-- FormaDePagamento (somente cartão e pix)
INSERT INTO FormaDePagamento (nomeFormaPagamento) VALUES
('Cartão de Crédito'),
('Cartão de Débito'),
('Pix');

-- ============================================
-- POPULAÇÃO DAS RELACIONAIS (5 REGISTROS)
-- ============================================

-- PedidoHasProduto
INSERT INTO PedidoHasProduto VALUES
(1,1,2,15.00),
(2,2,1,80.00),
(3,3,1,60.00),
(4,4,3,45.00),
(5,5,2,5.00);

-- PagamentoHasFormaPagamento (IDs válidos 1 a 3)
INSERT INTO PagamentoHasFormaPagamento VALUES
(1,1,150.00),  -- Cartão de Crédito
(2,2,200.00),  -- Cartão de Débito
(3,3,300.00),  -- Pix
(4,1,400.00),  -- Cartão de Crédito
(5,3,500.00);  -- Pix
