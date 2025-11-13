
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('funcionarioForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const funcionariosTableBody = document.getElementById('funcionariosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de funcionarios ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarFuncionarios();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarFuncionario);
btnIncluir.addEventListener('click', incluirFuncionario);
btnAlterar.addEventListener('click', alterarFuncionario);
btnExcluir.addEventListener('click', excluirFuncionario);
btnCancelar.addEventListener('click', cancelarOperacao);
btnSalvar.addEventListener('click', salvarOperacao);

mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
bloquearCampos(false);//libera pk e bloqueia os demais campos

// Função para mostrar mensagens
function mostrarMensagem(texto, tipo = 'info') {
    messageContainer.innerHTML = `<div class="message ${tipo}">${texto}</div>`;
    setTimeout(() => {
        messageContainer.innerHTML = '';
    }, 3000);
}

function bloquearCampos(bloquearPrimeiro) {
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach((input, index) => {
        if (index === 0) {
            // Primeiro elemento - bloqueia se bloquearPrimeiro for true, libera se for false
            input.disabled = bloquearPrimeiro;
        } else {
            // Demais elementos - faz o oposto do primeiro
            input.disabled = !bloquearPrimeiro;
        }
    });
}

// Função para limpar formulário
function limparFormulario() {
    form.reset();
}


function mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar) {
    btnBuscar.style.display = btBuscar ? 'inline-block' : 'none';
    btnIncluir.style.display = btIncluir ? 'inline-block' : 'none';
    btnAlterar.style.display = btAlterar ? 'inline-block' : 'none';
    btnExcluir.style.display = btExcluir ? 'inline-block' : 'none';
    btnSalvar.style.display = btSalvar ? 'inline-block' : 'none';
    btnCancelar.style.display = btCancelar ? 'inline-block' : 'none';
}

// Função para formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para converter data para formato ISO
function converterDataParaISO(dataString) {
    if (!dataString) return null;
    return new Date(dataString).toISOString();
}

// Função para buscar funcionario por ID
async function buscarFuncionario() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    //focus no campo searchId
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/funcionario/${id}`);

        if (response.ok) {
            const funcionario = await response.json();
            preencherFormulario(funcionario);

            mostrarBotoes(true, false, true, true, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Funcionario encontrado!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); //mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Funcionario não encontrada. Você pode incluir um novo funcionario.', 'info');
            bloquearCampos(false);//bloqueia a pk e libera os demais campos
            //enviar o foco para o campo de nome
        } else {
            throw new Error('Erro ao buscar funcionario');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar funcionario', 'error');
    }
}

// Função para preencher formulário com dados da funcionario
function preencherFormulario(funcionario) {
    currentPersonId = funcionario.pessoacpfpessoa;
    searchId.value = funcionario.pessoacpfpessoa;
    document.getElementById('cargoidcargo').value = funcionario.cargoidcargo || '';
    document.getElementById('salario').value = funcionario.salario || '';
    document.getElementById('porcentagemcomissao').value = funcionario.porcentagemcomissao || '';  
}


// Função para incluir funcionario
async function incluirFuncionario() {

    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    // console.log('Incluir nova funcionario - currentPersonId: ' + currentPersonId);
    limparFormulario();
    searchId.value = currentPersonId;
    bloquearCampos(true);

    mostrarBotoes(false, false, false, false, true, true); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('cargoidcargo').focus();
    operacao = 'incluir';
    // console.log('fim nova funcionario - currentPersonId: ' + currentPersonId);
}

// Função para alterar funcionario
async function alterarFuncionario() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('cargoidcargo').focus();
    operacao = 'alterar';
}

// Função para excluir funcionario
async function excluirFuncionario() {
    mostrarMensagem('Excluindo funcionario...', 'info');
    currentPersonId = searchId.value;
    //bloquear searchId
    searchId.disabled = true;
    bloquearCampos(false); // libera os demais campos
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)           
    operacao = 'excluir';
}

async function salvarOperacao() {
    console.log('Operação:', operacao + ' - currentPersonId: ' + currentPersonId + ' - searchId: ' + searchId.value);

    const formData = new FormData(form);
    const funcionario = {
        pessoacpfpessoa: searchId.value,
        cargoidcargo: formData.get('cargoidcargo'),
        salario: formData.get('salario'),
        porcentagemcomissao: formData.get('porcentagemcomissao'),
                   
    };
    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/funcionario`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(funcionario)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/funcionario/${currentPersonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(funcionario)
            });
        } else if (operacao === 'excluir') {
            // console.log('Excluindo funcionario com ID:', currentPersonId);
            response = await fetch(`${API_BASE_URL}/funcionario/${currentPersonId}`, {
                method: 'DELETE'
            });
            console.log('Funcionario excluído' + response.status);
        }
        if (response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            const novoFuncionario = await response.json();
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            carregarFuncionarios();

        } else if (operacao !== 'excluir') {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro ao incluir funcionario', 'error');
        } else {
            mostrarMensagem('Funcionario excluído com sucesso!', 'success');
            limparFormulario();
            carregarFuncionarios();
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao incluir ou alterar o funcionario', 'error');
    }

    mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false);//libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
}

// Função para cancelar operação
function cancelarOperacao() {
    limparFormulario();
    mostrarBotoes(true, false, false, false, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    bloquearCampos(false);//libera pk e bloqueia os demais campos
    document.getElementById('searchId').focus();
    mostrarMensagem('Operação cancelada', 'info');
}

// Função para carregar lista de funcionarios
async function carregarFuncionarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/funcionario`);
    //    debugger
        if (response.ok) {
            const funcionarios = await response.json();
            renderizarTabelaFuncionarios(funcionarios);
        } else {
            throw new Error('Erro ao carregar funcionarios');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de funcionarios', 'error');
    }
}

// Função para renderizar tabela de funcionarios
function renderizarTabelaFuncionarios(funcionarios) {
    funcionariosTableBody.innerHTML = '';

    funcionarios.forEach(funcionario => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <button class="btn-id" onclick="selecionarFuncionario(${funcionario.pessoacpfpessoa})">
                            ${funcionario.pessoacpfpessoa}
                        </button>
                    </td>
                    <td>${funcionario.cargoidcargo}</td>
                    <td>${funcionario.salario}</td>
                    <td>${funcionario.porcentagemcomissao}</td>
                                 
                `;
        funcionariosTableBody.appendChild(row);
    });
}

// Função para selecionar funcionario da tabela
async function selecionarFuncionario(id) {
    searchId.value = id;
    await buscarFuncionario();
}
