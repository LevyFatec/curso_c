// Importa o cliente Supabase que criamos em main.js
import supabase from './main.js';

// Pega os elementos do HTML
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

// Roda esta função quando o usuário clicar em "Entrar"
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Pega os valores dos campos
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Função de login do Supabase (RF01.2)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        // Se houver um erro (ex: senha errada)
        console.error('Erro no login:', error);
        messageDiv.style.color = 'red';
        messageDiv.innerHTML = `Erro: ${error.message}`;
    } else {
        // Se o login for um sucesso
        console.log('Login bem-sucedido!', data.user);
        messageDiv.style.color = 'green';
        messageDiv.innerHTML = 'Login realizado com sucesso! Redirecionando...';
        
        // Redireciona o usuário para a página principal após 1 segundo
        setTimeout(() => {
            // IMPORTANTE: redireciona para a página principal (que deve estar na pasta html/)
            window.location.href = 'index.html'; 
        }, 1000);
    }
});