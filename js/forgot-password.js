import supabase from './main.js';

const forgotPasswordForm = document.getElementById('forgot-password-form');
const messageDiv = document.getElementById('message');

forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const formButton = forgotPasswordForm.querySelector('button');

    formButton.disabled = true;
    messageDiv.textContent = 'Enviando...';

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/html/reset-password.html',
    });

    if (error) {
        console.error('Erro:', error);
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro: ${error.message}`;
    } else {
        console.log('Link enviado:', data);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Link de recuperação enviado! Verifique seu e-mail.';
    }
    
    formButton.disabled = false;
});