import supabase from './main.js';
import user from './auth-guard.js';

const lessonTitle = document.getElementById('lesson-title');
const contentContainer = document.getElementById('lesson-content-container');
const completeButton = document.getElementById('complete-lesson-button');
const completeMessage = document.getElementById('complete-message');
const logoutButton = document.getElementById('logout-button');

const urlParams = new URLSearchParams(window.location.search);
const lessonId = urlParams.get('id');

logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/html/login.html';
});

function renderLessonContent(contentItems) {
    contentContainer.innerHTML = ''; 

    contentItems.forEach(item => {
        if (item.type === 'text') {
            const p = document.createElement('p');
            p.innerHTML = item.content; 
            contentContainer.appendChild(p);
        }
        else if (item.type === 'subtitle') {
            const h3 = document.createElement('h3'); 
            h3.className = 'lesson-subtitle'; 
            h3.innerHTML = item.content; 
            contentContainer.appendChild(h3);
        }
        else if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.content;
            img.alt = "Imagem da aula";
            img.style.maxWidth = '100%'; 
            contentContainer.appendChild(img);
        }
        else if (item.type === 'video') {
            const iframe = document.createElement('iframe');
            iframe.src = item.content;
            iframe.width = "560";
            iframe.height = "315";
            iframe.allowFullscreen = true;
            iframe.style.maxWidth = '100%';
            iframe.style.aspectRatio = '16 / 9'; 
            contentContainer.appendChild(iframe);
        }
        else if (item.type === 'code') {
            const codeWrapper = document.createElement('div');
            codeWrapper.className = 'code-wrapper';
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-c'; 
            code.textContent = item.content; 
            pre.appendChild(code);
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Copiar';
            copyButton.className = 'copy-button';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(item.content)
                    .then(() => {
                        copyButton.textContent = 'Copiado!';
                        setTimeout(() => copyButton.textContent = 'Copiar', 2000);
                    })
                    .catch(err => console.error('Erro ao copiar:', err));
            };
            codeWrapper.appendChild(copyButton);
            codeWrapper.appendChild(pre);
            contentContainer.appendChild(codeWrapper);
        }
    });
    
    Prism.highlightAll();
}

async function completeLesson() {
    if (!user || !lessonId) return;

    completeButton.disabled = true;
    completeMessage.textContent = 'Salvando...';

    const { data, error } = await supabase
        .from('user_progress')
        .insert({ 
            user_id: user.id, 
            lesson_id: lessonId 
        });

    if (error) {
        if (error.code === '23505') { 
            console.log("Aula já estava marcada como concluída.");
            completeMessage.textContent = 'Aula já concluída!';
        } else {
            console.error('Erro ao salvar progresso:', error);
            completeMessage.textContent = 'Erro ao salvar.';
        }
    } else {
        console.log('Progresso salvo:', data);
        completeMessage.textContent = 'Aula concluída com sucesso!';
    }
}

async function loadLesson() {
    if (!lessonId) {
        lessonTitle.textContent = "Erro";
        contentContainer.innerHTML = "<p style='color: red;'>Nenhum ID de aula fornecido.</p>";
        return;
    }

    let { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('title')
        .eq('lesson_id', lessonId)
        .single(); 

    if (lessonError || !lesson) {
        console.error('Erro ao buscar aula:', lessonError);
        lessonTitle.textContent = "Aula não encontrada";
        return;
    }
    
    lessonTitle.textContent = lesson.title;

    let { data: content, error: contentError } = await supabase
        .from('lesson_content')
        .select('type, content')
        .eq('lesson_id', lessonId)
        .order('order', { ascending: true }); 

    if (contentError) {
        console.error('Erro ao buscar conteúdo:', contentError);
        contentContainer.innerHTML = "<p style='color: red;'>Erro ao carregar conteúdo da aula.</p>";
        return;
    }

    renderLessonContent(content);

    completeButton.addEventListener('click', completeLesson);
}

loadLesson();