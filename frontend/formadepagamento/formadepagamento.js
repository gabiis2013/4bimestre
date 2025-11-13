
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('formadepagamentoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const formadepagamentosTableBody = document.getElementById('formadepagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de formadepagamentos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarFormaDePagamentos();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarFormaDePagamento);
btnIncluir.addEventListener('click', incluirFormaDePagamento);
btnAlterar.addEventListener('click', alterarFormaDePagamento);
btnExcluir.addEventListener('click', excluirFormaDePagamento);
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

// Função para buscar formadepagamento por ID
async function buscarFormaDePagamento() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    //focus no campo searchId
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/formadepagamento/${id}`);

        if (response.ok) {
            const formadepagamento = await response.json();
            preencherFormulario(formadepagamento);

            mostrarBotoes(true, false, true, true, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('FormaDePagamento encontrado!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); //mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('FormaDePagamento não encontrada. Você pode incluir um novo formadepagamento.', 'info');
            bloquearCampos(false);//bloqueia a pk e libera os demais campos
            //enviar o foco para o campo de nome
        } else {
            throw new Error('Erro ao buscar formadepagamento');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar formadepagamento', 'error');
    }
}

// Função para preencher formulário com dados da formadepagamento
function preencherFormulario(formadepagamento) {
    currentPersonId = formadepagamento.idformapagamento;
    searchId.value = formadepagamento.idformapagamento;
    document.getElementById('nomeformapagamento').value = formadepagamento.nomeformapagamento || '';  
}


// Função para incluir formadepagamento
async function incluirFormaDePagamento() {

    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    // console.log('Incluir nova formadepagamento - currentPersonId: ' + currentPersonId);
    limparFormulario();
    searchId.value = currentPersonId;
    bloquearCampos(true);

    mostrarBotoes(false, false, false, false, true, true); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('nomeformapagamento').focus();
    operacao = 'incluir';
    // console.log('fim nova formadepagamento - currentPersonId: ' + currentPersonId);
}

// Função para alterar formadepagamento
async function alterarFormaDePagamento() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('nomeformapagamento').focus();
    operacao = 'alterar';
}

// Função para excluir formadepagamento
async function excluirFormaDePagamento() {
    mostrarMensagem('Excluindo formadepagamento...', 'info');
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
    const formadepagamento = {
        idformapagamento: searchId.value,
        nomeformapagamento: formData.get('nomeformapagamento'),            
    };
    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/formadepagamento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formadepagamento)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/formadepagamento/${currentPersonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formadepagamento)
            });
        } else if (operacao === 'excluir') {
            // console.log('Excluindo formadepagamento com ID:', currentPersonId);
            response = await fetch(`${API_BASE_URL}/formadepagamento/${currentPersonId}`, {
                method: 'DELETE'
            });
            console.log('FormaDePagamento excluído' + response.status);
        }
        if (response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            const novoFormaDePagamento = await response.json();
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            carregarFormaDePagamentos();

        } else if (operacao !== 'excluir') {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro ao incluir formadepagamento', 'error');
        } else {
            mostrarMensagem('FormaDePagamento excluído com sucesso!', 'success');
            limparFormulario();
            carregarFormaDePagamentos();
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao incluir ou alterar o formadepagamento', 'error');
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

// Função para carregar lista de formadepagamentos
async function carregarFormaDePagamentos() {
    try {
        const response = await fetch(`${API_BASE_URL}/formadepagamento`);
    //    debugger
        if (response.ok) {
            const formadepagamentos = await response.json();
            renderizarTabelaFormaDePagamentos(formadepagamentos);
        } else {
            throw new Error('Erro ao carregar formadepagamentos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de formadepagamentos', 'error');
    }
}

// Função para renderizar tabela de formadepagamentos
function renderizarTabelaFormaDePagamentos(formadepagamentos) {
    formadepagamentosTableBody.innerHTML = '';

    formadepagamentos.forEach(formadepagamento => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <button class="btn-id" onclick="selecionarFormaDePagamento(${formadepagamento.idformapagamento})">
                            ${formadepagamento.idformapagamento}
                        </button>
                    </td>
                    <td>${formadepagamento.nomeformapagamento}</td>
                                 
                `;
        formadepagamentosTableBody.appendChild(row);
    });
}

// Função para selecionar formadepagamento da tabela
async function selecionarCargo(id) {
    searchId.value = id;
    await buscarCargo();
}
