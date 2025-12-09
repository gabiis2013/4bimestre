const API_URL = 'http://localhost:3001'; // AJUSTE ESTA PORTA SE NECESSÁRIO

// Função auxiliar para atualizar o status na interface
function updateStatus(elementId, message, isSuccess = true) {
    const statusElement = document.getElementById(elementId);
    statusElement.innerHTML = message;
    statusElement.className = `status-message ${isSuccess ? 'status-success' : 'status-error'}`;
}

// ----------------------------------------------------------------------
// Lógica para Upload Local
// ----------------------------------------------------------------------
document.getElementById('localUploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    updateStatus('localStatus', 'Enviando...', true);

    const formData = new FormData();
    formData.append('imageSource', 'local');
    formData.append('produtoId', document.getElementById('produtoIdLocal').value);
    
    const imageFile = document.getElementById('imageFile').files[0];
    if (!imageFile) {
        updateStatus('localStatus', 'Selecione um arquivo de imagem.', false);
        return;
    }
    formData.append('imageFile', imageFile);

    try {
        const response = await fetch(`${API_URL}/upload-image`, {
            method: 'POST',
            body: formData 
        });

        const data = await response.json();

        if (response.ok) {
            updateStatus('localStatus', 
                `✅ **Sucesso!** Imagem salva como **${data.filename}** (Tamanho: ${Math.round(data.size / 1024)} KB).`, 
                true
            );
            console.log('Resposta de Sucesso:', data);
        } else {
            updateStatus('localStatus', 
                `❌ **Erro:** ${data.message || response.statusText}. Detalhes: ${data.error || 'N/A'}`, 
                false
            );
            console.error('Resposta de Erro:', data);
        }

    } catch (error) {
        updateStatus('localStatus', `❌ Erro de conexão: ${error.message}`, false);
        console.error('Erro de Fetch:', error);
    }
});


// ----------------------------------------------------------------------
// Lógica para Download/Upload por URL
// ----------------------------------------------------------------------
document.getElementById('urlUploadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    updateStatus('urlStatus', 'Baixando e enviando...', true);

    const payload = {
        imageSource: 'url',
        produtoId: document.getElementById('produtoIdUrl').value,
        imageUrl: document.getElementById('imageUrl').value
    };

    try {
        const response = await fetch(`${API_URL}/upload-image`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            updateStatus('urlStatus', 
                `✅ **Sucesso!** Imagem salva como **${data.filename}** (Tamanho: ${Math.round(data.size / 1024)} KB).`, 
                true
            );
            console.log('Resposta de Sucesso:', data);
        } else {
            updateStatus('urlStatus', 
                `❌ **Erro:** ${data.message || response.statusText}. Detalhes: ${data.error || 'N/A'}`, 
                false
            );
            console.error('Resposta de Erro:', data);
        }

    } catch (error) {
        updateStatus('urlStatus', `❌ Erro de conexão: ${error.message}`, false);
        console.error('Erro de Fetch:', error);
    }
});


// ----------------------------------------------------------------------
// Lógica para Buscar e Visualizar Imagem
// ----------------------------------------------------------------------
document.getElementById('buscarImagemBtn').addEventListener('click', function() {
    const produtoId = document.getElementById('produtoIdBuscar').value;
    const imgElement = document.getElementById('imagemProduto');
    
    // Verifique se o ID é válido
    if (!produtoId) {
        updateStatus('buscaStatus', 'Por favor, insira um ID de Produto para buscar.', false);
        imgElement.style.display = 'none';
        return;
    }
    
    // Construindo a URL para a nova rota de visualização
    const imagePath = `${API_URL}/view-image/${produtoId}`;
    
    updateStatus('buscaStatus', `Tentando carregar imagem do ID ${produtoId}...`, true);
    imgElement.style.display = 'none';
    imgElement.src = ''; // Limpa a imagem anterior

    // Define o novo SRC. O navegador tentará carregar usando a rota GET
    imgElement.src = imagePath;
    
    // Adiciona ouvintes para o resultado do carregamento no navegador
    imgElement.onload = function() {
        imgElement.style.display = 'block';
        updateStatus('buscaStatus', `✅ **Imagem ${produtoId}.png** carregada com sucesso.`, true);
    };

    imgElement.onerror = function() {
        imgElement.style.display = 'none';
        updateStatus('buscaStatus', `❌ Erro 404. Imagem para o ID ${produtoId} não encontrada.`, false);
        imgElement.src = ''; // Garante que não mostra um ícone de quebrado
    };
});