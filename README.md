# 📚 C-Learn: Plataforma Interativa de Aprendizado em C
<h4 align="center">Status do Projeto: Concluído e Hospedado</h4>

## 🎯 Sobre o Projeto
O C-Learn é uma plataforma web interativa desenvolvida como projeto final, com o objetivo de oferecer um curso robusto e aprofundado sobre a linguagem C, desde os fundamentos até a implementação de Estruturas de Dados avançadas.

A aplicação simula um ambiente E-Learning moderno, com gerenciamento de progresso e um módulo de submissão de exercícios.

---

## ✨ Funcionalidades Principais (RFs Cumpridos)

O projeto atende a todos os requisitos funcionais estabelecidos, destacando-se:

* **Autenticação:** Cadastro, Login, Logout e Recuperação de Senha, gerenciados de forma segura.
* **Acordeão Multi-Nível:** Apresentação limpa de mais de 100 aulas, com colapso em cascata (Seção -> Módulo -> Aula/Exercício).
* **Progressão e Gamificação:** O usuário marca aulas como concluídas e recebe **pontos instantaneamente** (gerenciado por Triggers no banco de dados).
* **Módulo de Exercícios:** Interface para visualizar enunciados e submeter códigos, salvando a entrega na base de dados para correção.
* **Gerenciamento:** O conteúdo do curso é totalmente gerenciado pelo painel de administração do Supabase.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído usando uma arquitetura *Frontend-as-a-Service* (FaaS), focando a lógica de negócios e o banco de dados no Supabase.

| Categoria | Tecnologia | Uso |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) | Interface do usuário e toda a lógica de manipulação do DOM e requisições. |
| **Estilização** | CSS Puro + Media Queries | Responsividade completa e design limpo. |
| **Frameworks** | Font Awesome | Utilizado para injeção de ícones. |
| **Backend/Banco** | **Supabase** | Backend-as-a-Service, fornecendo Auth e PostgreSQL. |
| **Banco de Dados** | PostgreSQL | Armazenamento de usuários, progresso, estrutura do curso e submissões. |
| **Código C** | Prism.js | Biblioteca para realce de sintaxe (Syntax Highlighting) dos códigos em C. |

---

## 🚀 Como Executar o Projeto (Localmente)

Para rodar este projeto em sua máquina, você precisará apenas de um editor de código (como VS Code) e da sua chave Supabase.

### Pré-requisitos

1.  Um editor de código.
2.  Um servidor local (Ex: a extensão **Live Server** do VS Code).
3.  Um projeto criado no Supabase com os **scripts SQL de inicialização** (tabelas `users`, `lessons`, `exercises`, etc.) rodados.

### Passos para Rodar

1.  **Clone o Repositório:**
    ```bash
    git clone [SEU LINK DO REPOSITÓRIO]
    cd [pasta do projeto]
    ```
2.  **Configurar Chaves:**
    * Abra o arquivo `js/main.js`.
    * Substitua `SUPABASE_URL` e `SUPABASE_KEY` pelas chaves do seu projeto Supabase.

3.  **Iniciar:**
    * Clique com o botão direito no arquivo `html/index.html` ou na **pasta raiz** do projeto.
    * Selecione **"Open with Live Server"**.
    * Você será redirecionado para a página de login/cadastro.

---

## 🔗 Deploy e Acesso Público

O projeto está publicado em:

[[curso c](https://curso-c.vercel.app/)]

---

## 👤 Autoria

| Função | Nome | gitHub |
| :--- | :--- | :--- |
| **Desenvolvedor Principal** | [Levy] | [https://github.com/LevyFatec] |


---
