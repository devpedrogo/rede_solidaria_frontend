# 🎨 Rede Solidária — Frontend Web

Interface web moderna, responsiva e performática desenvolvida em **React + TypeScript** para a plataforma **Rede Solidária**. O sistema permite a gestão visual de doadores, beneficiários, projetos e doações, integrado a uma API RESTful em Spring Boot.

🚀 **Aplicação em Produção:** https://rede-solidaria-frontend.vercel.app/

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** React 18+ (com Vite)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS 4
- **Roteamento:** React Router DOM
- **Requisições HTTP:** Axios
- **Notificações:** React Hot Toast / Sonner
- **Ícones:** Lucide React
- **Hospedagem / Deploy:** Vercel

---

## 🚀 Funcionalidades Principais

- 🔑 **Autenticação & Controle de Sessão:** Login seguro com persistência e envio automático do Token JWT via interceptors do Axios.
- ⚡ **Warm-Up de Servidor (Cold Start Handling):** Sistema inteligente na tela de login que realiza chamadas em segundo plano ao backend para despertar a API (caso esteja em modo de hibernação no Render) com feedback visual para o usuário.
- 📊 **Dashboard Interativo:** Visualização centralizada de métricas, doações e cadastros do sistema.
- 👥 **Gestão Completa (CRUD):** Interfaces intuitivas para gerenciamento de doadores, beneficiários e solicitações de ajuda.
- 📱 **Design Responsivo:** Layout otimizado para dispositivos móveis, tablets e desktops.

---

## ⚙️ Variáveis de Ambiente

Para conectar o frontend à API correta (local ou produção), crie um arquivo .env na raiz do projeto:

VITE_API_URL=https://sua-api-no-render.onrender.com

*Se a variável não for informada, o cliente HTTP utilizará o endereço de desenvolvimento local por padrão (http://localhost:8080).*

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- Gerenciador de pacotes **npm** ou **yarn**

### Passos:

1. **Clonar o repositório:**
   git clone https://github.com/seu-usuario/rede-solidaria-frontend.git
   cd rede-solidaria-frontend

2. **Instalar as dependências:**
   npm install

3. **Configurar as variáveis de ambiente:**
   Crie o arquivo .env baseado no exemplo acima com a URL da sua API.

4. **Iniciar o servidor de desenvolvimento:**
   npm run dev

5. Acesse http://localhost:5173 no seu navegador.

---

## 📦 Build e Deploy

Para gerar os arquivos estáticos de produção e testar o build localmente:

# Gerar build otimizado:
npm run build

# Visualizar a versão de produção localmente:
npm run preview

A hospedagem está configurada para deploy automático na **Vercel** a cada novo commit efetuado na branch principal (main/master).

---

## 📜 Licença

Este projeto é de uso acadêmico e para portfólio de desenvolvimento de software.