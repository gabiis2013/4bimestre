function handleUserAction(action) {
  if (action === "gerenciar-conta") {
    alert("Redirecionando para a página de Gerenciar Conta...");
    // window.location.href = "/gerenciar-conta";
  } else if (action === "sair") {
    alert("Desconectando...");
    // logout();
  }
}

// A função 'logout' original
function logout() {
  alert("Desconectando...");
  // window.location.href = "/login";
}

const API_BASE_URL = 'http://localhost:3001';
let ehProfessor = false;



//essa função só existe para teste inicial
function nomeUsuario() {
  const combobox = document.getElementById("oUsuario");
  const primeiraOpcao = combobox.options[0];
  primeiraOpcao.text = "Berola da Silva";

 //  usuarioAutorizado();


}

// Chame a função quando a página carregar
window.onload = nomeUsuario;

// Carregar produtos para exibir no Menu Home
async function carregarProdutosHome() {
  const container = document.getElementById('produtosHome');
  if (!container) return;
  try {
    const response = await fetch(API_BASE_URL + '/produto');
    if (!response.ok) return;
    const produtos = await response.json();
    container.innerHTML = '';
    produtos.forEach(produto => {
      const div = document.createElement('div');
      div.className = 'produto-card';
      const img = document.createElement('img');
      img.src = `/imagens/produtos/${produto.idproduto}.png?t=${Date.now()}`;
      img.alt = produto.nomeproduto || 'Produto';
      img.onerror = function() {
        const altPath = `/imagens/${produto.idproduto}.png`;
        if (img.src !== altPath) {
          img.src = altPath;
          return;
        }
        img.src = '/imagens/000.png';
      };
      const name = document.createElement('div');
      name.className = 'produto-nome';
      name.textContent = produto.nomeproduto || '';
      const preco = document.createElement('div');
      preco.className = 'produto-preco';
      preco.textContent = `R$ ${Number(produto.precounitario).toFixed(2)}`;
      div.appendChild(img);
      div.appendChild(name);
      div.appendChild(preco);
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Erro ao carregar produtos no menu:', err);
  }
}

// Carrega produtos ao carregar a página
window.addEventListener('DOMContentLoaded', carregarProdutosHome);

async function usuarioAutorizado() {
  
  const rota = API_BASE_URL + '/login/verificaSeUsuarioEstaLogado';
  alert('Rota: ' + rota);
  
  const res = await fetch(rota, { credentials: 'include' });
  alert(JSON.stringify(data));




  const data = await res.json();
  if (data.status === 'ok') {
    document.getElementById('boasVindas').innerText =
      `${data.nome} - ${data.mnemonicoProfessor ? `Professor: ${data.mnemonicoProfessor}` : ''}`;
    if (data.mnemonicoProfessor) ehProfessor = true;
  } else {
    alert("Você precisa fazer login.");
    window.location.href = "./login/login.html";
  }
}

async function logout2() {
  await fetch('http://localhost:3005/logout', {
    method: 'POST',
    credentials: 'include'
  });
  window.location.href = "http://localhost:3005/inicio";
}

// usuarioAutorizado();