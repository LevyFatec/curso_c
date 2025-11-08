import supabase from './main.js';

async function checkUserSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Erro ao pegar a sessão:", error);
        return;
    }

    if (!session) {
        console.log("Nenhum usuário logado. Redirecionando para login.");
        window.location.href = 'login.html';
    } else {
        console.log("Usuário logado:", session.user.email);
        return session.user;
    }
}

const user = await checkUserSession();

export default user;