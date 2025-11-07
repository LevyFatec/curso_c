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
 * 3. (MODIFICADO) Renderiza as subseções, aulas E exercícios aninhados
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
        
        // 1. Renderiza as AULAS
        if (subsection.lessons && subsection.lessons.length > 0) {
            const lessonList = document.createElement('ul');
            lessonList.className = 'lesson-list';
            
            subsection.lessons.forEach(lesson => {
                const lessonItem = document.createElement('li');
                lessonItem.className = 'lesson-item-container'; // Classe para o <li> principal
                
                const isCompleted = completedSet.has(lesson.lesson_id);
                const checkMark = isCompleted ? '<span class="checkmark"> ✓</span>' : '';
                
                // Link da Aula (agora com ícone)
                lessonItem.innerHTML = `<i class="fa-solid fa-book-open"></i> <a href="lesson.html?id=${lesson.lesson_id}">${lesson.title}</a>${checkMark}`;
                if (isCompleted) lessonItem.classList.add('lesson-completed');
                lessonList.appendChild(lessonItem);

                // 2. (NOVO) Renderiza os EXERCÍCIOS DESTA AULA
                if (lesson.exercises && lesson.exercises.length > 0) {
                    const exerciseList = document.createElement('ul');
                    exerciseList.className = 'exercise-list-nested'; // Nova classe para CSS
                    
                    lesson.exercises.forEach(exercise => {
                        const exerciseItem = document.createElement('li');
                        // Link do Exercício (agora com ícone)
                        exerciseItem.innerHTML = `<i class="fa-solid fa-laptop-code"></i> <a href="exercise.html?id=${exercise.exercise_id}">${exercise.title}</a>`;
                        exerciseList.appendChild(exerciseItem);
                    });
                    
                    // Adiciona a lista de exercícios aninhada dentro do <li> da aula
                    lessonItem.appendChild(exerciseList); 
                }
            });
            subsectionDiv.appendChild(lessonList);
        }

        // (O loop de exercícios antigo que estava aqui foi REMOVIDO)

        container.appendChild(subsectionDiv);
    });
}


/**
 * 2. (MODIFICADO) Busca o conteúdo (com exercícios aninhados)
 */
async function handleSectionClick(section, sectionDiv) {
    const contentContainer = sectionDiv.querySelector('.subsection-content');
    const isLoaded = contentContainer.dataset.loaded === 'true';

    if (!isLoaded) {
        contentContainer.innerHTML = '<p>Carregando...</p>';
        contentContainer.style.display = 'block'; 
        contentContainer.dataset.loaded = 'true'; 

        try {
            // Busca o progresso (sem mudança)
            const progressPromise = supabase
                .from('user_progress')
                .select('lesson_id')
                .eq('user_id', user.id);

            // (A MUDANÇA ESTÁ AQUI)
            // Busca as subseções, com aulas, COM EXERCÍCIOS aninhados DENTRO das aulas
            const subsectionsPromise = supabase
                .from('subsections')
                .select(`
                    title,
                    lessons (
                        lesson_id,
                        title,
                        exercises ( 
                            exercise_id,
                            title
                        )
                    )
                `)
                .eq('section_id', section.section_id)
                .order('order', { ascending: true })
                .order('order', { foreignTable: 'lessons', ascending: true });
            // (Não precisamos mais ordenar 'exercises' aqui)

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
            contentContainer.dataset.loaded = 'false'; 
        }

    } else {
        const isVisible = contentContainer.style.display === 'block';
        contentContainer.style.display = isVisible ? 'none' : 'block';
    }
}

/**
 * 1. (Sem Mudança) Renderiza apenas as Seções principais
 */
function renderSections(sections) {
    courseListDiv.innerHTML = ''; 
    if (!sections || sections.length === 0) {
        courseListDiv.innerHTML = '<p>Nenhum curso encontrado.</p>';
        return;
    }

    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'course-section';

        const header = document.createElement('h3');
        header.textContent = section.title;
        header.style.cursor = 'pointer'; 
        sectionDiv.appendChild(header);
        
        const description = document.createElement('p');
        description.textContent = section.description;
        sectionDiv.appendChild(description);

        const contentContainer = document.createElement('div');
        contentContainer.className = 'subsection-content';
        contentContainer.style.display = 'none'; 
        sectionDiv.appendChild(contentContainer);

        header.addEventListener('click', () => handleSectionClick(section, sectionDiv));

        courseListDiv.appendChild(sectionDiv);
    });
}

/**
 * 0. (Sem Mudança) Função principal que INICIA a página
 */
async function loadPage() {
    if (!courseListDiv) return;
    courseListDiv.innerHTML = '<p>Carregando estrutura do curso...</p>';

    let { data: sections, error } = await supabase
        .from('sections')
        .select('section_id, title, description')
        .order('order', { ascending: true });

    if (error) {
        console.error("Erro ao buscar seções:", error);
        courseListDiv.innerHTML = `<p style="color: red;">Erro ao carregar o curso.</p>`;
        return;
    }

    renderSections(sections);
}

// --- CHAMA A FUNÇÃO PRINCIPAL ---
loadPage();