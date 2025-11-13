
// Configuração da API, IP e porta.
const API_BASE_URL = 'http://localhost:3001';
let currentPersonId = null;
let operacao = null;

// Elementos do DOM
const form = document.getElementById('pagamentoForm');
const searchId = document.getElementById('searchId');
const btnBuscar = document.getElementById('btnBuscar');
const btnIncluir = document.getElementById('btnIncluir');
const btnAlterar = document.getElementById('btnAlterar');
const btnExcluir = document.getElementById('btnExcluir');
const btnCancelar = document.getElementById('btnCancelar');
const btnSalvar = document.getElementById('btnSalvar');
const pagamentosTableBody = document.getElementById('pagamentosTableBody');
const messageContainer = document.getElementById('messageContainer');

// Carregar lista de pagamentos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarPagamentos();
});

// Event Listeners
btnBuscar.addEventListener('click', buscarPagamento);
btnIncluir.addEventListener('click', incluirPagamento);
btnAlterar.addEventListener('click', alterarPagamento);
btnExcluir.addEventListener('click', excluirPagamento);
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

// Função para buscar pagamento por ID
async function buscarPagamento() {
    const id = searchId.value.trim();
    if (!id) {
        mostrarMensagem('Digite um ID para buscar', 'warning');
        return;
    }
    bloquearCampos(false);
    //focus no campo searchId
    searchId.focus();
    try {
        const response = await fetch(`${API_BASE_URL}/pagamento/${id}`);

        if (response.ok) {
            const pagamento = await response.json();
            preencherFormulario(pagamento);

            mostrarBotoes(true, false, true, true, false, false);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pagamento encontrado!', 'success');

        } else if (response.status === 404) {
            limparFormulario();
            searchId.value = id;
            mostrarBotoes(true, true, false, false, false, false); //mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
            mostrarMensagem('Pagamento não encontrado. Você pode incluir um novo pagamento.', 'info');
            bloquearCampos(false);//bloqueia a pk e libera os demais campos
            //enviar o foco para o campo de nome
        } else {
            throw new Error('Erro ao buscar pagamento');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao buscar pagamento', 'error');
    }
}

// Função para preencher formulário com dados da pagamento
function preencherFormulario(pagamento) {
    currentPersonId = pagamento.idpagamento;
    searchId.value = pagamento.idpagamento;
    document.getElementById('pedidoidpedido').value = pagamento.pedidoidpedido || '';
    document.getElementById('datapagamento').value = pagamento.datapagamento || '';
    document.getElementById('valortotalpagamento').value = pagamento.valortotalpagamento || ''; 
    
    // Formatação da data para input type="date"
    if (pagamento.datapagamento) {
        const data = new Date(pagamento.datapagamento);
        const dataFormatada = data.toISOString().split('T')[0];
        document.getElementById('datapagamento').value = dataFormatada;
    } else {
        document.getElementById('datapagamento').value = '';
    }
    
}


// Função para incluir pagamento
async function incluirPagamento() {

    mostrarMensagem('Digite os dados!', 'success');
    currentPersonId = searchId.value;
    // console.log('Incluir nova pagamento - currentPersonId: ' + currentPersonId);
    limparFormulario();
    searchId.value = currentPersonId;
    bloquearCampos(true);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    mostrarBotoes(false, false, false, false, true, true); // mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('pedidoidpedido').focus();
    operacao = 'incluir';
    // console.log('fim nova pagamento - currentPersonId: ' + currentPersonId);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Função para alterar pagamento
async function alterarPagamento() {
    mostrarMensagem('Digite os dados!', 'success');
    bloquearCampos(true);
    mostrarBotoes(false, false, false, false, true, true);// mostrarBotoes(btBuscar, btIncluir, btAlterar, btExcluir, btSalvar, btCancelar)
    document.getElementById('pedidoidpedido').focus();
    operacao = 'alterar';
}

// Função para excluir pagamento
async function excluirPagamento() {
    mostrarMensagem('Excluindo pagamento...', 'info');
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
    const pagamento = {
        idpagamento: searchId.value,
        pedidoidpedido: formData.get('pedidoidpedido'),
        datapagamento: formData.get('datapagamento'),
        valortotalpagamento: formData.get('valortotalpagamento'),            
    };
    let response = null;
    try {
        if (operacao === 'incluir') {
            response = await fetch(`${API_BASE_URL}/pagamento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pagamento)
            });
        } else if (operacao === 'alterar') {
            response = await fetch(`${API_BASE_URL}/pagamento/${currentPersonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pagamento)
            });
        } else if (operacao === 'excluir') {
            // console.log('Excluindo pagamento com ID:', currentPersonId);
            response = await fetch(`${API_BASE_URL}/pagamento/${currentPersonId}`, {
                method: 'DELETE'
            });
            console.log('Pagamento excluído' + response.status);
        }
        if (response.ok && (operacao === 'incluir' || operacao === 'alterar')) {
            const novoPagamento = await response.json();
            mostrarMensagem('Operação ' + operacao + ' realizada com sucesso!', 'success');
            limparFormulario();
            carregarPagamentos();

        } else if (operacao !== 'excluir') {
            const error = await response.json();
            mostrarMensagem(error.error || 'Erro ao incluir pagamento', 'error');
        } else {
            mostrarMensagem('Pagamento excluído com sucesso!', 'success');
            limparFormulario();
            carregarPagamentos();
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao incluir ou alterar o pagamento', 'error');
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

// Função para carregar lista de pagamentos
async function carregarPagamentos() {
    try {
        const response = await fetch(`${API_BASE_URL}/pagamento`);
    //    debugger
        if (response.ok) {
            const pagamentos = await response.json();
            renderizarTabelaPagamentos(pagamentos);
        } else {
            throw new Error('Erro ao carregar pagamentos');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao carregar lista de pagamentos', 'error');
    }
}

// Função para renderizar tabela de pagamentos
function renderizarTabelaPagamentos(pagamentos) {
    pagamentosTableBody.innerHTML = '';

    pagamentos.forEach(pagamento => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>
                        <button class="btn-id" onclick="selecionarPagamento(${pagamento.idpagamento})">
                            ${pagamento.idpagamento}
                        </button>
                    </td>
                    <td>${pagamento.pedidoidpedido}</td>
                    <td>${pagamento.datapagamento}</td>
                    <td>${pagamento.valortotalpagamento}</td>
                                 
                `;
        pagamentosTableBody.appendChild(row);
    });
}

// Função para selecionar pagamento da tabela
async function selecionarPagamento(id) {
    searchId.value = id;
    await buscarPagamento();
}
