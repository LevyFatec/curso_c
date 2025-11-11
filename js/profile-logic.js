import supabase from './main.js';
import user from './auth-guard.js';

const loadingMessage = document.getElementById('loading-message');
const profileDetailsDiv = document.getElementById('profile-details');
const profileEmailSpan = document.getElementById('profile-email');
const profileUsernameSpan = document.getElementById('profile-username');
const profilePointsSpan = document.getElementById('profile-points');

const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/html/login.html';
});

async function loadProfileData() {
    if (!user) {
        console.error("Erro: Usuário não encontrado pelo guardião.");
        loadingMessage.innerText = "Erro ao carregar perfil. Tente fazer login novamente.";
        return;
    }

    profileEmailSpan.textContent = user.email;

    console.log("Buscando perfil para o ID:", user.id);
    
    let { data: profile, error } = await supabase
        .from('profiles') 
        .select('username, total_points') 
        .eq('id', user.id) 
        .single(); 

    if (error) {
        console.error("Erro ao buscar perfil:", error);
        loadingMessage.innerText = `Erro ao buscar dados do perfil: ${error.message}`;
    } else if (profile) {
        console.log("Perfil encontrado:", profile);
        profileUsernameSpan.textContent = profile.username;
        profilePointsSpan.textContent = profile.total_points;
        
        loadingMessage.style.display = 'none';
        profileDetailsDiv.style.display = 'block';
    } else {
        console.warn("Nenhum perfil encontrado para este usuário.");
        loadingMessage.innerText = "Parece que seu perfil não foi criado corretamente.";
    }
}

loadProfileData();