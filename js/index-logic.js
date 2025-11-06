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

// 3. (NOVO) Função para carregar a estrutura do curso (RF02)
async function loadCourseStructure() {
    if (!courseListDiv) return; // Se não houver onde colocar, pare

    console.log("Carregando estrutura do curso...");

    // A MÁGICA DO SUPABASE:
    // Buscamos 'sections' e, com '*, ...', pedimos para ele trazer
    // 'subsections' aninhadas, e 'lessons' aninhadas dentro delas.
    // Tudo em UMA ÚNICA CHAMADA!
    let { data: sections, error } = await supabase
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
        .order('order', { ascending: true }) // Ordena as seções
        .order('order', { foreignTable: 'subsections', ascending: true }) // Ordena as subseções
        .order('order', { foreignTable: 'subsections.lessons', ascending: true }); // Ordena as aulas

    if (error) {
        console.error("Erro ao buscar estrutura do curso:", error);
        courseListDiv.innerHTML = `<p style="color: red;">Erro ao carregar o curso.</p>`;
        return;
    }

    if (sections && sections.length > 0) {
        console.log("Estrutura recebida:", sections);
        // Limpa a mensagem "Carregando..."
        courseListDiv.innerHTML = ''; 

        // 4. (NOVO) Renderiza a estrutura em HTML
        sections.forEach(section => {
            // Cria a div da Seção
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'course-section';
            sectionDiv.innerHTML = `<h3>${section.title}</h3><p>${section.description}</p>`;
            
            // Adiciona Subseções
            section.subsections.forEach(subsection => {
                const subsectionDiv = document.createElement('div');
                subsectionDiv.className = 'course-subsection';
                subsectionDiv.innerHTML = `<h4>${subsection.title}</h4>`;
                
                // Adiciona Aulas (RF02.3)
                const lessonList = document.createElement('ul');
                subsection.lessons.forEach(lesson => {
                    const lessonItem = document.createElement('li');
                    // IMPORTANTE: Criamos o link para a página da aula (que faremos a seguir)
                    lessonItem.innerHTML = `<a href="lesson.html?id=${lesson.lesson_id}">${lesson.title}</a>`;
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

// 5. (NOVO) Chama a função para carregar o curso assim que a página abrir
loadCourseStructure();