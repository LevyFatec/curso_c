import supabase from './main.js';
import user from './auth-guard.js';

const logoutButton = document.getElementById('logout-button');
const userEmailSpan = document.getElementById('user-email');
const courseListDiv = document.getElementById('course-list');
const totalPointsSpan = document.getElementById('total-points');
const completedLessonsSpan = document.getElementById('completed-lessons');
const currentLevelSpan = document.getElementById('current-level');


if (userEmailSpan && user) {
    userEmailSpan.textContent = user.email;
}
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '/html/login.html';
    });
}

async function loadStats() {
    if (!user) return; 

    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('id', user.id)
            .single();

        const { data: progress, error: progressError } = await supabase
            .from('user_progress')
            .select('lesson_id')
            .eq('user_id', user.id);

        if (profileError || progressError) throw profileError || progressError;

        const TOTAL_LESSONS = 117; 
        const completedCount = progress ? progress.length : 0;
        
        let level = 'Básico';
        if (completedCount > 50) level = 'Intermediário';
        if (completedCount > 100) level = 'Avançado';
        
        if (totalPointsSpan && profile) {
            totalPointsSpan.textContent = profile.total_points;
        }
        if (completedLessonsSpan) {
            completedLessonsSpan.textContent = `${completedCount} / ${TOTAL_LESSONS}`;
        }
        if (currentLevelSpan) {
            currentLevelSpan.textContent = level;
        }

    } catch (error) {
        console.error("Erro ao carregar estatísticas do usuário:", error);
        if (totalPointsSpan) totalPointsSpan.textContent = 'Erro';
    }
}


function renderSubsections(subsections, userProgress, container) {
    container.innerHTML = ''; 
    if (!subsections || subsections.length === 0) {
        container.innerHTML = '<p>Nenhum conteúdo encontrado para esta seção.</p>';
        return;
    }

    const completedSet = new Set(userProgress.map(item => item.lesson_id));

    subsections.forEach(subsection => {
        
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'course-module';

        const moduleHeader = document.createElement('h4');
        moduleHeader.className = 'module-header';
        moduleHeader.innerHTML = `<i class="fa-solid fa-chevron-right"></i> ${subsection.title}`;
        moduleDiv.appendChild(moduleHeader);
        
        const lessonContainer = document.createElement('div');
        lessonContainer.className = 'lesson-list-container';
        lessonContainer.style.display = 'none';
        
        
        if (subsection.lessons && subsection.lessons.length > 0) {
            const lessonList = document.createElement('ul');
            lessonList.className = 'lesson-list';
            
            subsection.lessons.forEach(lesson => {
                const lessonItem = document.createElement('li');
                
                const lessonLinkDiv = document.createElement('div');
                lessonLinkDiv.className = 'lesson-link-item';
                
                const isCompleted = completedSet.has(lesson.lesson_id);
                const checkMark = isCompleted 
                    ? `<span class="checkmark"><i class="fa-solid fa-check"></i></span>` 
                    : `<i class="fa-solid fa-book-open"></i>`;
                
                const mainLink = `<a href="/html/lesson.html?id=${lesson.lesson_id}">${lesson.title}</a>`;
                
                lessonLinkDiv.innerHTML = `${checkMark} ${mainLink}`;
                
                if (isCompleted) lessonLinkDiv.classList.add('lesson-completed');
                lessonItem.appendChild(lessonLinkDiv);


                if (lesson.exercises && lesson.exercises.length > 0) {
                    
                    const exerciseToggle = document.createElement('span');
                    exerciseToggle.className = 'exercise-toggle-icon';
                    exerciseToggle.innerHTML = `<i class="fa-solid fa-angle-down"></i>`; 
                    lessonLinkDiv.appendChild(exerciseToggle); 

                    const exerciseList = document.createElement('ul');
                    exerciseList.className = 'exercise-list-nested'; 
                    exerciseList.style.display = 'none'; 
                    
                    lesson.exercises.forEach(exercise => {
                        const exerciseItem = document.createElement('li');
                        exerciseItem.innerHTML = `<i class="fa-solid fa-laptop-code"></i> <a href="/html/exercise.html?id=${exercise.exercise_id}">${exercise.title}</a>`;
                        exerciseList.appendChild(exerciseItem);
                    });
                    
                    lessonItem.appendChild(exerciseList); 

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


async function handleSectionClick(section, sectionDiv) {
    const contentContainer = sectionDiv.querySelector('.subsection-content');
    const isLoaded = contentContainer.dataset.loaded === 'true';

    if (!isLoaded) {
        contentContainer.innerHTML = '<p>Carregando...</p>';
        contentContainer.style.display = 'block'; 
        contentContainer.dataset.loaded = 'true'; 

        try {
            const progressPromise = supabase
                .from('user_progress')
                .select('lesson_id')
                .eq('user_id', user.id);

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
        header.innerHTML = `<i class="fa-solid fa-chevron-right"></i> ${section.title}`;
        header.style.cursor = 'pointer'; 
        sectionDiv.appendChild(header);
        
        const description = document.createElement('p');
        description.textContent = section.description;
        sectionDiv.appendChild(description);

        const contentContainer = document.createElement('div');
        contentContainer.className = 'subsection-content';
        contentContainer.style.display = 'none'; 
        sectionDiv.appendChild(contentContainer);

        header.addEventListener('click', () => {
    handleSectionClick(section, sectionDiv);
});


        courseListDiv.appendChild(sectionDiv);
    });
}

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

loadPage();
loadStats();