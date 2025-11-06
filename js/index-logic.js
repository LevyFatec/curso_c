// Importa o cliente Supabase
import supabase from './main.js';
// Importa o 'user' que o nosso guardião verificou
import user from './auth-guard.js';

// --- ELEMENTOS DO HTML ---
const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');
const courseListDiv = document.getElementById('course-list');

// --- INICIALIZAÇÃO DA PÁGINA ---
// 1. Exibe o e-mail (se o elemento existir)
if (userEmailSpan && user) {
    userEmailSpan.textContent = user.email;
}

// 2. Adiciona a função de Logout (RF01.4)
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });
}

// 3. (NOVO) Função para RENDERIZAR a estrutura do curso
// Esta função agora recebe o progresso do usuário como argumento
function renderCourseStructure(sections, userProgress) {
    if (!courseListDiv) return;

    // Cria um Set (lista rápida) com os IDs das aulas concluídas
    // Ex: completedSet = { 1, 2, 5 }
    const completedSet = new Set(userProgress.map(item => item.lesson_id));

    if (sections && sections.length > 0) {
        // Limpa a mensagem "Carregando..."
        courseListDiv.innerHTML = ''; 

        sections.forEach(section => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'course-section';
            sectionDiv.innerHTML = `<h3>${section.title}</h3><p>${section.description}</p>`;
            
            section.subsections.forEach(subsection => {
                const subsectionDiv = document.createElement('div');
                subsectionDiv.className = 'course-subsection';
                subsectionDiv.innerHTML = `<h4>${subsection.title}</h4>`;
                
                const lessonList = document.createElement('ul');
                subsection.lessons.forEach(lesson => {
                    const lessonItem = document.createElement('li');
                    
                    // (NOVO) Verifica se a aula está no Set de concluídas
                    const isCompleted = completedSet.has(lesson.lesson_id);
                    
                    // (NOVO) Adiciona o "check" se estiver concluída (RF04.4)
                    const checkMark = isCompleted ? '<span class="checkmark"> ✓</span>' : '';
                    
                    lessonItem.innerHTML = `<a href="lesson.html?id=${lesson.lesson_id}">${lesson.title}</a>${checkMark}`;
                    
                    // (NOVO) Adiciona uma classe para estilização
                    if (isCompleted) {
                        lessonItem.classList.add('lesson-completed');
                    }

                    lessonList.appendChild(lessonItem);
                });
                
                subsectionDiv.appendChild(lessonList);
                sectionDiv.appendChild(subsectionDiv);
            });
            
            courseListDiv.appendChild(sectionDiv);
        });
    } else {
        courseListDiv.innerHTML = '<p>Nenhum conteúdo de curso encontrado.</p>';
    }
}


// 4. (NOVO) Função para CARREGAR tudo (Estrutura e Progresso)
async function loadCourseData() {
    if (!user) return; // Se não houver usuário, pare
    
    console.log("Carregando dados do curso e progresso do usuário...");

    try {
        // Vamos buscar duas coisas ao mesmo tempo
        const coursePromise = supabase
            .from('sections')
            .select(`
                title,
                description,
                subsections (
                    title,
                    lessons (
                        lesson_id,
                        title
                    )
                )
            `)
            .order('order', { ascending: true })
            .order('order', { foreignTable: 'subsections', ascending: true })
            .order('order', { foreignTable: 'subsections.lessons', ascending: true });

        const progressPromise = supabase
            .from('user_progress')
            .select('lesson_id') // Só precisamos do ID
            .eq('user_id', user.id); // Apenas do usuário logado

        // Espera as duas promessas terminarem
        const [courseResult, progressResult] = await Promise.all([
            coursePromise,
            progressPromise
        ]);

        const { data: sections, error: courseError } = courseResult;
        const { data: userProgress, error: progressError } = progressResult;

        if (courseError) throw courseError;
        if (progressError) throw progressError;

        console.log("Estrutura do curso:", sections);
        console.log("Progresso do usuário:", userProgress);

        // 5. (NOVO) Chama a função de renderizar, passando os dois resultados
        renderCourseStructure(sections, userProgress);

    } catch (error) {
        console.error("Erro ao carregar dados do curso:", error);
        if (courseListDiv) {
            courseListDiv.innerHTML = `<p style="color: red;">Erro ao carregar o curso.</p>`;
        }
    }
}

// 6. (NOVO) Chama a função principal para carregar os dados
loadCourseData();