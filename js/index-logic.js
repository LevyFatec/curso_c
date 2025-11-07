// Importa o cliente Supabase
import supabase from './main.js';
// Importa o 'user' que o nosso guardião verificou
import user from './auth-guard.js';

// --- ELEMENTOS DO HTML ---
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');
const courseListDiv = document.getElementById('course-list');

// --- INICIALIZAÇÃO DA PÁGINA (Login e Logout) ---
// Note que o user só existe se o auth-guard passou!
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
 * Esta função cria o Nível 2 (Módulo) e Nível 3 (Aulas/Exercícios)
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
        
        // ===============================================
        // NÍVEL 2: MÓDULOS (O novo elemento clicável)
        // ===============================================
        
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'course-module';

        // 1. Título do Módulo (O elemento clicável)
        const moduleHeader = document.createElement('h4');
        moduleHeader.className = 'module-header'; // Para estilização
        // Ícone de seta para indicar que está colapsado (chevron-right)
        moduleHeader.innerHTML = `<i class="fa-solid fa-chevron-right"></i> ${subsection.title}`;
        moduleDiv.appendChild(moduleHeader);
        
        // 2. Container das Aulas (ESCONDIDO por padrão)
        const lessonContainer = document.createElement('div');
        lessonContainer.className = 'lesson-list-container';
        lessonContainer.style.display = 'none'; // Aulas ESCONDIDAS!
        
        
        // ===============================================
        // NÍVEL 3: AULAS E EXERCÍCIOS
        // ===============================================
        
        if (subsection.lessons && subsection.lessons.length > 0) {
            const lessonList = document.createElement('ul');
            lessonList.className = 'lesson-list';
            
            subsection.lessons.forEach(lesson => {
                const lessonItem = document.createElement('li');
                
                // Div que contém o link e o ícone de toggle (para ser o alvo do clique)
                const lessonLinkDiv = document.createElement('div');
                lessonLinkDiv.className = 'lesson-link-item';
                
                const isCompleted = completedSet.has(lesson.lesson_id);
                // Ícone de checkmark (se concluído) ou de livro
                const checkMark = isCompleted 
                    ? `<span class="checkmark"><i class="fa-solid fa-check"></i></span>` 
                    : `<i class="fa-solid fa-book-open"></i>`;
                
                // O link principal (para ir para a página da aula)
                const mainLink = `<a href="lesson.html?id=${lesson.lesson_id}">${lesson.title}</a>`;
                
                lessonLinkDiv.innerHTML = `${checkMark} ${mainLink}`;
                
                if (isCompleted) lessonLinkDiv.classList.add('lesson-completed');
                lessonItem.appendChild(lessonLinkDiv);


                // ----------------------------------------
                // LÓGICA DO TOGGLE DOS EXERCÍCIOS
                // ----------------------------------------
                if (lesson.exercises && lesson.exercises.length > 0) {
                    
                    // Ícone de toggle para abrir/fechar exercícios
                    const exerciseToggle = document.createElement('span');
                    exerciseToggle.className = 'exercise-toggle-icon';
                    exerciseToggle.innerHTML = `<i class="fa-solid fa-angle-down"></i>`; // Seta para baixo
                    lessonLinkDiv.appendChild(exerciseToggle); // Adiciona ícone ao lado do título da aula

                    const exerciseList = document.createElement('ul');
                    exerciseList.className = 'exercise-list-nested'; 
                    exerciseList.style.display = 'none'; // Exercícios ESCONDIDOS!
                    
                    lesson.exercises.forEach(exercise => {
                        const exerciseItem = document.createElement('li');
                        exerciseItem.innerHTML = `<i class="fa-solid fa-laptop-code"></i> <a href="exercise.html?id=${exercise.exercise_id}">${exercise.title}</a>`;
                        exerciseList.appendChild(exerciseItem);
                    });
                    
                    lessonItem.appendChild(exerciseList); 

                    // LÓGICA DE CLIQUE DA AULA (Toggle dos exercícios)
                    exerciseToggle.addEventListener('click', () => {
                        if (exerciseList.style.display === 'block') {
                            exerciseList.style.display = 'none';
                            exerciseToggle.querySelector('i').className = 'fa-solid fa-angle-down';
                        } else {
                            exerciseList.style.display = 'block';
                            exerciseToggle.querySelector('i').className = 'fa-solid fa-angle-up';
                        }
                    });
                }
                
                lessonList.appendChild(lessonItem);
            });
            lessonContainer.appendChild(lessonList);
        }
        
        moduleDiv.appendChild(lessonContainer);
        container.appendChild(moduleDiv);


        // LÓGICA DE CLIQUE DO MÓDULO (Toggle das Aulas)
        moduleHeader.addEventListener('click', () => {
            if (lessonContainer.style.display === 'block') {
                lessonContainer.style.display = 'none';
                moduleHeader.querySelector('i').className = 'fa-solid fa-chevron-right';
            } else {
                lessonContainer.style.display = 'block';
                moduleHeader.querySelector('i').className = 'fa-solid fa-chevron-down';
            }
        });
        
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

            // (A MUDANÇA ESTÁ AQUI: a query do Supabase para buscar tudo aninhado)
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
        // Toggle da Seção Principal
        const isVisible = contentContainer.style.display === 'block';
        contentContainer.style.display = isVisible ? 'none' : 'block';
    }
}

/**
 * 1. (Função Original) Renderiza apenas as Seções principais
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
        contentContainer.style.display = 'none'; // Conteúdo de aulas/módulos ESCONDIDO!
        sectionDiv.appendChild(contentContainer);

        // O clique no H3 (Seção) aciona o carregamento/toggle do conteúdo (Aulas/Módulos)
        header.addEventListener('click', () => handleSectionClick(section, sectionDiv));

        courseListDiv.appendChild(sectionDiv);
    });
}

/**
 * 0. (Função Original) Função principal que INICIA a página
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