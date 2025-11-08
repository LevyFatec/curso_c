import supabase from './main.js';

const registerForm = document.getElementById('register-form');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
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