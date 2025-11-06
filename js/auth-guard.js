// Importa o cliente Supabase
import supabase from './main.js';

// Função para verificar a sessão do usuário
async function checkUserSession() {
    // Pega a sessão atual
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Erro ao pegar a sessão:", error);
        return;
    }

    if (!session) {
        // Ninguém logado!
        console.log("Nenhum usuário logado. Redirecionando para login.");
        // Chuta o usuário de volta para a página de login
        // (Assume que login.html está na mesma pasta que a página atual)
        window.location.href = 'login.html';
    } else {
        // Usuário está logado
        console.log("Usuário logado:", session.user.email);
        // Você pode retornar o usuário se precisar dele em outras páginas
        return session.user;
    }
}

// Roda a verificação imediatamente
const user = await checkUserSession();

// Exporta o usuário logado para que outras páginas possam usá-lo
export default user;