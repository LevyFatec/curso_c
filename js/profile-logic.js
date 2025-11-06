// Importa o cliente Supabase
import supabase from './main.js';
// Importa o 'user' que o nosso guardião já verificou
import user from './auth-guard.js';

// Pega os elementos do HTML
const loadingMessage = document.getElementById('loading-message');
const profileDetailsDiv = document.getElementById('profile-details');
const profileEmailSpan = document.getElementById('profile-email');
const profileUsernameSpan = document.getElementById('profile-username');
const profilePointsSpan = document.getElementById('profile-points');

// Reutiliza a lógica de Logout (RF01.4)
// (Poderíamos otimizar isso no futuro, mas por enquanto funciona)
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// --- Função principal: Carregar dados do Perfil ---
async function loadProfileData() {
    // 1. Verificamos se o guardião nos deu um usuário
    if (!user) {
        console.error("Erro: Usuário não encontrado pelo guardião.");
        loadingMessage.innerText = "Erro ao carregar perfil. Tente fazer login novamente.";
        return;
    }

    // 2. O email já temos (vem do 'user' da autenticação)
    profileEmailSpan.textContent = user.email;

    // 3. Agora, buscamos os dados da nossa tabela 'profiles' (RF01.5)
    // Usamos o 'user.id' para encontrar o perfil correspondente
    console.log("Buscando perfil para o ID:", user.id);
    
    let { data: profile, error } = await supabase
        .from('profiles') // O nome da sua tabela
        .select('username, total_points') // O que queremos buscar
        .eq('id', user.id) // Onde o 'id' é igual ao ID do usuário logado
        .single(); // Esperamos apenas UM resultado

    if (error) {
        console.error("Erro ao buscar perfil:", error);
        loadingMessage.innerText = `Erro ao buscar dados do perfil: ${error.message}`;
    } else if (profile) {
        // 4. Sucesso! Preenchemos o HTML
        console.log("Perfil encontrado:", profile);
        profileUsernameSpan.textContent = profile.username;
        profilePointsSpan.textContent = profile.total_points;
        
        // Esconde a mensagem de "Carregando" e mostra os detalhes
        loadingMessage.style.display = 'none';
        profileDetailsDiv.style.display = 'block';
    } else {
        console.warn("Nenhum perfil encontrado para este usuário.");
        loadingMessage.innerText = "Parece que seu perfil não foi criado corretamente.";
    }
}

// Roda a função assim que a página carrega
loadProfileData();