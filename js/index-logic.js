// Importa o cliente Supabase
import supabase from './main.js';
// Importa o 'user' que o nosso guardião verificou
import user from './auth-guard.js';

// --- ELEMENTOS DO HTML ---
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');
const courseListDiv = document.getElementById('course-list');

// --- INICIALIZAÇÃO DA PÁGINA (Login e Logout) ---
if (userEmailSpan && user) {
    userEmailSpan.textContent = user.email;
}
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

// --- LÓGICA DO CURSO "ACORDEÃO" ---

/**
 * 3. (NOVO) Renderiza as subseções, aulas e exercícios DENTRO da seção clicada
 */
function renderSubsections(subsections, userProgress, container) {
    container.innerHTML = ''; // Limpa o "Carregando..."
    if (!subsections || subsections.length === 0) {
        container.innerHTML = '<p>Nenhum conteúdo encontrado para esta seção.</p>';
        return;
    }

    // Cria um Set (lista rápida) com os IDs das aulas concluídas
    const completedSet = new Set(userProgress.map(item => item.lesson_id));

    subsections.forEach(subsection => {
        const subsectionDiv = document.createElement('div');
        subsectionDiv.className = 'course-subsection';
        subsectionDiv.innerHTML = `<h4>${subsection.title}</h4>`;
        
        // 1. (CORRIGIDO) Renderiza as AULAS
        if (subsection.lessons && subsection.lessons.length > 0) {
            const lessonList = document.createElement('ul');
            lessonList.className = 'lesson-list';
            subsection.lessons.forEach(lesson => {
                const lessonItem = document.createElement('li');
                const isCompleted = completedSet.has(lesson.lesson_id);
                const checkMark = isCompleted ? '<span class="checkmark"> ✓</span>' : '';
                // (CORRIGIDO) Garante que o link da aula está aqui
                lessonItem.innerHTML = `<a href="lesson.html?id=${lesson.lesson_id}">${lesson.title}</a>${checkMark}`;
                if (isCompleted) lessonItem.classList.add('lesson-completed');
                lessonList.appendChild(lessonItem);
            });
            subsectionDiv.appendChild(lessonList);
        }

        // 2. (CORRIGIDO) Renderiza os EXERCÍCIOS
        if (subsection.exercises && subsection.exercises.length > 0) {
            const exerciseList = document.createElement('ul');
            exerciseList.className = 'exercise-list';
            subsection.exercises.forEach(exercise => {
                const exerciseItem = document.createElement('li');
                // (CORRIGIDO) Garante que o link do exercício está aqui
                exerciseItem.innerHTML = `💻 <a href="exercise.html?id=${exercise.exercise_id}">${exercise.title}</a>`;
                exerciseList.appendChild(exerciseItem);
            });
            subsectionDiv.appendChild(exerciseList);
        }

        container.appendChild(subsectionDiv);
    });
}

/**
 * 2. (NOVO) Busca o conteúdo de UMA seção quando ela é clicada
 */
async function handleSectionClick(section, sectionDiv) {
    // Encontra o container de conteúdo "filho" desta seção
    const contentContainer = sectionDiv.querySelector('.subsection-content');
    
    // Verifica se os dados já foram carregados
    const isLoaded = contentContainer.dataset.loaded === 'true';

    if (!isLoaded) {
        // Se não foi carregado:
        contentContainer.innerHTML = '<p>Carregando...</p>';
        contentContainer.style.display = 'block'; // Mostra o "Carregando..."
        contentContainer.dataset.loaded = 'true'; // Marca como carregado (para não buscar de novo)

        try {
            // Busca o progresso do usuário
            const progressPromise = supabase
                .from('user_progress')
                .select('lesson_id')
                .eq('user_id', user.id);

            // Busca as subseções (com aulas e exercícios aninhados) APENAS desta seção
            const subsectionsPromise = supabase
                .from('subsections')
                .select(`
                    title,
                    lessons (lesson_id, title),
                    exercises (exercise_id, title)
                `)
                .eq('section_id', section.section_id)
                .order('order', { ascending: true })
                .order('order', { foreignTable: 'lessons', ascending: true });

            // Espera as duas buscas terminarem
            const [progressResult, subsectionsResult] = await Promise.all([
                progressPromise,
                subsectionsPromise
            ]);

            const { data: userProgress, error: progressError } = progressResult;
            const { data: subsections, error: subsectionsError } = subsectionsResult;

            if (progressError || subsectionsError) throw progressError || subsectionsError;

            // Renderiza o conteúdo dentro do container
            renderSubsections(subsections, userProgress, contentContainer);

        } catch (error) {
            console.error('Erro ao buscar subseções:', error);
            contentContainer.innerHTML = '<p style="color: red;">Erro ao carregar conteúdo.</p>';
            contentContainer.dataset.loaded = 'false'; // Permite tentar de novo
        }

    } else {
        // Se já foi carregado: apenas esconde ou mostra (efeito acordeão)
        const isVisible = contentContainer.style.display === 'block';
        contentContainer.style.display = isVisible ? 'none' : 'block';
    }
}

/**
 * 1. (NOVO) Renderiza apenas as Seções principais (Básico, Intermediário...)
 */
function renderSections(sections) {
    courseListDiv.innerHTML = ''; // Limpa o "Carregando..."
    if (!sections || sections.length === 0) {
        courseListDiv.innerHTML = '<p>Nenhum curso encontrado.</p>';
        return;
    }

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'course-section';

        // 1. O Cabeçalho (Clicável)
        const header = document.createElement('h3');
        header.textContent = section.title;
        header.style.cursor = 'pointer'; // Indica que é clicável
        sectionDiv.appendChild(header);
        
        // 2. A Descrição
        const description = document.createElement('p');
        description.textContent = section.description;
        sectionDiv.appendChild(description);

        // 3. O Container "escondido" para o conteúdo (subseções)
        const contentContainer = document.createElement('div');
        contentContainer.className = 'subsection-content';
        contentContainer.style.display = 'none'; // Começa escondido
        sectionDiv.appendChild(contentContainer);

        // 4. (NOVO) Adiciona o evento de clique ao cabeçalho
        header.addEventListener('click', () => handleSectionClick(section, sectionDiv));

        courseListDiv.appendChild(sectionDiv);
    });
}

/**
 * 0. (NOVO) Função principal que INICIA a página
 */
async function loadPage() {
    if (!courseListDiv) return;
    courseListDiv.innerHTML = '<p>Carregando estrutura do curso...</p>';

    // Busca APENAS as seções
    let { data: sections, error } = await supabase
        .from('sections')
        .select('section_id, title, description')
        .order('order', { ascending: true });

    if (error) {
        console.error("Erro ao buscar seções:", error);
        courseListDiv.innerHTML = `<p style="color: red;">Erro ao carregar o curso.</p>`;
        return;
    }

    // Renderiza apenas as seções
    renderSections(sections);
}

// --- CHAMA A FUNÇÃO PRINCIPAL ---
loadPage();