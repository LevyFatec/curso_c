// Importa o cliente Supabase
import supabase from './main.js';
// Importa o 'user' que o nosso guardião já verificou
import user from './auth-guard.js';

// --- ELEMENTOS DO HTML ---
const exerciseTitle = document.getElementById('exercise-title');
const statementText = document.getElementById('statement-text');
const codeArea = document.getElementById('code-submission-area');
const submitButton = document.getElementById('submit-exercise-button');
const submitMessage = document.getElementById('submit-message');
const logoutButton = document.getElementById('logout-button');

// --- PEGAR O ID DO EXERCÍCIO PELA URL ---
const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id');

// --- LÓGICA DE LOGOUT (Reutilizada) ---
logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// --- FUNÇÃO PARA CARREGAR O EXERCÍCIO (RF05.2) ---
async function loadExercise() {
    if (!exerciseId) {
        exerciseTitle.textContent = "Erro";
        statementText.textContent = "Nenhum ID de exercício fornecido.";
        return;
    }

    let { data: exercise, error } = await supabase
        .from('exercises')
        .select('title, statement')
        .eq('exercise_id', exerciseId)
        .single(); // Esperamos só 1 resultado

    if (error || !exercise) {
        console.error('Erro ao buscar exercício:', error);
        exerciseTitle.textContent = "Exercício não encontrado";
        statementText.textContent = "Não foi possível carregar o enunciado.";
    } else {
        // Preenche o HTML com os dados
        exerciseTitle.textContent = exercise.title;
        statementText.textContent = exercise.statement;
    }
}

// --- FUNÇÃO PARA ENTREGAR A SOLUÇÃO (RF05.4 / RF05.5 Simplificado) ---
async function submitSolution() {
    if (!user || !exerciseId) return;

    const userCode = codeArea.value;

    // Validação simples
    if (userCode.trim().length < 10) {
        submitMessage.style.color = 'red';
        submitMessage.textContent = 'Por favor, insira um código válido.';
        return;
    }

    submitButton.disabled = true;
    submitMessage.style.color = 'blue';
    submitMessage.textContent = 'Enviando...';

    // Salva na tabela 'submissions'
    const { data, error } = await supabase
        .from('submissions')
        .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            code: userCode // Salva o código que o usuário digitou
        });

    if (error) {
        console.error('Erro ao salvar entrega:', error);
        submitMessage.style.color = 'red';
        submitMessage.textContent = 'Erro ao enviar. Tente novamente.';
        submitButton.disabled = false;
    } else {
        console.log('Entrega salva:', data);
        submitMessage.style.color = 'green';
        submitMessage.textContent = 'Exercício entregue com sucesso!';
        // Não desabilita o botão, caso o usuário queira enviar de novo
        submitButton.disabled = false;
    }
}

// --- INICIALIZAÇÃO ---
// 1. Carrega o enunciado do exercício
loadExercise();

// 2. Adiciona o evento de clique ao botão de "Entregar"
submitButton.addEventListener('click', submitSolution);