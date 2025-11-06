// Importa o cliente Supabase
import supabase from './main.js';
// Importa o 'user' que o nosso guardião verificou
import user from './auth-guard.js';

// Pega os elementos do HTML
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');

// 1. Exibe o e-mail do usuário na página
if (user) {
    userEmailSpan.textContent = user.email;
}

// 2. Adiciona a função de Logout (RF01.4)
logoutButton.addEventListener('click', async () => {
    console.log("Saindo...");

    // Função de logout do Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Erro ao sair:", error);
    } else {
        // Sucesso! Redireciona para a página de login
        console.log("Logout bem-sucedido. Redirecionando para login.");
        window.location.href = 'login.html';
    }
});