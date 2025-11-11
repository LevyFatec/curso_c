import supabase from './main.js';

const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error('Erro no login:', error);
        messageDiv.style.color = 'red';
        messageDiv.innerHTML = `Erro: ${error.message}`;
    } else {
        console.log('Login bem-sucedido!', data.user);
        messageDiv.style.color = 'green';
        messageDiv.innerHTML = 'Login realizado com sucesso! Redirecionando...';
        
        setTimeout(() => {
            window.location.href = '/index.html'; 
        }, 1000);
    }
});