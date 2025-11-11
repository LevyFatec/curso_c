import supabase from './main.js';
import user from './auth-guard.js';

const exerciseTitle = document.getElementById('exercise-title');
const statementText = document.getElementById('statement-text');
const codeArea = document.getElementById('code-submission-area');
const submitButton = document.getElementById('submit-exercise-button');
const submitMessage = document.getElementById('submit-message');
const logoutButton = document.getElementById('logout-button');

const urlParams = new URLSearchParams(window.location.search);
const exerciseId = urlParams.get('id');

if(logoutButton) { 
    logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/html/login.html';
    });
}

async function loadExercise() {
    if (!exerciseId) {
        exerciseTitle.textContent = "Erro";
        statementText.innerHTML = "Nenhum ID de exercício fornecido."; 
        return;
    }

    let { data: exercise, error } = await supabase
        .from('exercises')
        .select('title, statement')
        .eq('exercise_id', exerciseId)
        .single(); 

    if (error || !exercise) {
        console.error('Erro ao buscar exercício:', error);
        exerciseTitle.textContent = "Exercício não encontrado";
        statementText.innerHTML = "Não foi possível carregar o enunciado."; 
    } else {
        exerciseTitle.textContent = exercise.title;
        statementText.innerHTML = exercise.statement; 
    }
}

async function submitSolution() {
    if (!user || !exerciseId) return;

    const userCode = codeArea.value;

    if (userCode.trim().length < 10) {
        submitMessage.style.color = 'red';
        submitMessage.textContent = 'Por favor, insira um código válido.';
        return;
    }

    submitButton.disabled = true;
    submitMessage.style.color = 'blue';
    submitMessage.textContent = 'Enviando...';

    const { data, error } = await supabase
        .from('submissions')
        .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            code: userCode 
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
        submitButton.disabled = false;
    }
}

loadExercise();

if(submitButton) {
    submitButton.addEventListener('click', submitSolution);
}