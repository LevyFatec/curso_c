// Importa o cliente Supabase que criamos em main.js
import supabase from './main.js';

// Pega os elementos do HTML
const registerForm = document.getElementById('register-form');
const messageDiv = document.getElementById('message');

// Roda esta função quando o usuário clicar em "Cadastrar"
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Função de cadastro do Supabase (RF01.1)
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                // Isso envia o 'username' para o seu TRIGGER!
                username: username 
            }
        }
    });

    if (error) {
        console.error('Erro no cadastro:', error);
        messageDiv.style.color = 'red';
        messageDiv.innerHTML = `Erro: ${error.message}`;
    } else {
        console.log('Usuário cadastrado:', data.user);
        messageDiv.style.color = 'green';
        messageDiv.innerHTML = 'Cadastro realizado! Verifique seu e-mail para confirmar a conta.';
        registerForm.reset();
    }
});