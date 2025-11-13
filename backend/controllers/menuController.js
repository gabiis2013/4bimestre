
// menuController.js
const path = require('path');

exports.abrirMenu = (req, res) => {
    console.log('menuController - Rota / - Menu Acessando menu.html');
    res.sendFile(path.join(__dirname, '../../frontend/menu.html'));
};

exports.inicio = (req, res) => {
    res.send('Rota /inicio funcionando');
};

exports.logout = (req, res) => {
  // Implementação da rota logout
  res.send("Rota logout");
};


// let mnemonicoProfessorGlobal = null;
// // Rota de menu (protege via cookie) - checkAuth 
// app.get('/usuarioLogado', (req, res) => {
//     console.log('Acessando rota /usuarioLogado');
//     const nome = req.cookies.usuarioLogado;
//     if (nome) {
//         res.json({ status: 'ok', nome, mnemonicoProfessor: mnemonicoProfessorGlobal });
//     } else {
//         res.json({ status: 'nao_logado' });
//     }
// });


// // Rota de logout
// app.post('/logout', (req, res) => {
//     console.log('Rota de logout acessada');
//     res.clearCookie('usuarioLogado');
//     mnemonicoProfessorGlobal = null;
//     res.json({ status: 'ok', message: 'Usuário deslogado com sucesso' });
// });