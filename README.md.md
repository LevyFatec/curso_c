# C-LEARN - PLATAFORMA DE ENSINO DA LINGUAGEM C
Este projeto foi a criação de uma plataforma de ensino da linguagem c. A plataforma já possui mais de 100 aulas, no formato textual.

O projeto tem como objetivo facilitar o aprendizado de c para estudantes universitários ou pessoas interessadas, além de fornecer uma base sólida de conhecimento para que as pessoas estejam aptas para o mercado de trabalho.

As aulas são organizadas em seção -> módulos -> aulas. 
As seções são compostas por básico, intermediário, avançado e estrutura de dados.

## Status do projeto
O projeto ainda está sendo desenvolvido, mas já se encontra hospedado e pronto para uso em [C-LEARN](https://curso-c.vercel.app)

---

## Funcionalidades
- Autentiação de usuários: o site possui cadastro de usuários, login e recuperação de senha.
- Gamificação: o site apresena pontuação por aula concluída, para que os usuários se engajem nas aulas.
- Exercícios: cada aula possui pelo menos um exercício, para melhor fixação do conhecimento.


## Tecnologias utilizadas
| Categoria    | Tecnologia  | Uso                 |
|--------------|-------------|---------------------|
|   Frontend   |HTML, CSS, JS| Interface do usuário| 
|  Estilização |   CSS puro  | Design              |
|    Backend   | Supabase    | Backend-as-a-Service|
|Banco de dados| PostgreSQL  | Armazenamento de usuários, aulas, progresso, estrutrua do curso, submissoes|
| Deploy       | Vercel      | Hospedar o site     |


## Estrutura do projeto
Abaixo está a estrutura de diretórios e arquivos principais do projeto.
```bash
curso_c/
|
|-- css/
|   |--style.css
|
|-- html/
|   |--exercise.html
|   |--forgot-password.html
|   |--lesson.html
|   |--login.html
|   |--profile.html
|   |--register.html
|   |--reset-password.html
|
|-- js/
|   |--auth-guard.js
|   |--exercise-logic.js
|   |--forgot-password.js
|   |--index-logic.js
|   |--lesson-logic.js
|   |--login.js
|   |--main.js
|   |--profile-logic.js
|   |--register.js
|   |--reset-password.js
|
|-- README.md
|
|-- index.html

```

