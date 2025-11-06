import supabase from './main.js';

const resetPasswordForm = document.getElementById('reset-password-form');
const messageDiv = document.getElementById('message');

resetPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const formButton = resetPasswordForm.querySelector('button');

    formButton.disabled = true;

    // (RF01.3) Função do Supabase para ATUALIZAR a senha
    const { data, error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        console.error('Erro ao atualizar senha:', error);
        messageDiv.style.color = 'red';
        messageDiv.textContent = `Erro: ${error.message}`;
    } else {
        console.log('Senha atualizada:', data.user);
        messageDiv.style.color = 'green';
        messageDiv.textContent = 'Senha atualizada com sucesso! Você já pode fazer login.';
    }
    
    formButton.disabled = false;
});