# 🎬 Premiação Melhores das Séries 2026

> Sistema de votação online para eleger os melhores personagens e pets das séries mais amadas da TV. Com painel administrativo de apuração em tempo real, auditoria de votos e design premium inspirado em premiações cinematográficas.

![Status](https://img.shields.io/badge/status-ativo-success)
![Versão](https://img.shields.io/badge/versão-2.0.0-blue)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)
![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)

---

## 📖 Sobre o Projeto

O **Melhores das Séries** é uma aplicação web de votação que permite ao público escolher, em três categorias, os seus **3 favoritos** classificados em **1º, 2º e 3º lugar**.

Cada voto é ponderado: o 1º lugar vale **3 pontos**, o 2º vale **2 pontos** e o 3º vale **1 ponto** — garantindo que a escolha principal do eleitor tenha mais peso na apuração final.

O projeto é dividido em duas partes:

- **`index.html`** — interface pública de votação (o eleitor)
- **`admin.html`** — painel restrito da comissão organizadora (apuração)

---

## ✨ Funcionalidades

### 🗳️ Para o Eleitor

- Login simplificado com **nome + e-mail** (voto único por e-mail)
- Votação em **3 categorias**: Personagem Feminino, Personagem Masculino e Melhor Pet
- Escolha de **3 favoritos** por categoria, classificados em 1º, 2º e 3º lugar
- **Dois modos de votação**:
  - 🔹 **Passo a passo** — uma categoria por vez, com barra de progresso
  - ⚡ **Tudo de uma vez** — todas as categorias em uma única tela (progresso global X/9)
- **🔍 Busca de candidatos** por nome ou por série, com destaque para escolhas já feitas
- **👁️ Preview detalhado** de cada candidato — modal com foto grande, série, categoria e botão "Escolher/Remover"
- **💾 Progresso salvo automaticamente** no navegador (localStorage) — retoma de onde parou se fechar a página
- **Validação completa** antes de avançar (todas as 3 posições obrigatórias por categoria)
- **Comprovante de votação** com resumo visual das escolhas
- **🎉 Animação de confete** ao confirmar o voto (canvas-confetti)
- **📸 Comprovante compartilhável**:
  - Baixar como PNG (via html2canvas)
  - Compartilhar direto em redes sociais / WhatsApp (Web Share API)
- **Bloqueio automático de voto duplicado** (mesmo e-mail não vota 2x)
- **Tema claro e escuro** com persistência em `localStorage`
- **Design responsivo** (mobile-first)
- **Logos das séries** carregadas dinamicamente como PNG

### 🔐 Para o Administrador

- Login restrito por **e-mail + senha**
- Troca obrigatória de senha no primeiro acesso
- **Ranking em tempo real** por categoria, **com foto do candidato** ao lado do nome
- **Pontuação ponderada** (1º=3pts · 2º=2pts · 3º=1pt)
- **Gráficos comparativos** por série (Chart.js)
- Métricas: série mais votada e série menos votada
- **Registo completo de eleitores** com data e hora
- **Anulação de votos** com liberação do eleitor para votar de novo
- **Logs de auditoria** imutáveis (quem anulou, quando e por quê)
- Botão de **atualização manual** dos resultados

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Banco de Dados | [Supabase](https://supabase.com/) (PostgreSQL + REST API) |
| Gráficos | [Chart.js](https://www.chartjs.org/) |
| Animação | [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Geração de Imagem | [html2canvas](https://html2canvas.hertzen.com/) |
| Fontes | Cinzel + Inter (Google Fonts) |
| Hospedagem | GitHub Pages / Vercel / Netlify (qualquer estático) |

---

## 📁 Estrutura do Projeto

```
📦 cinema-voto
├── 📄 index.html          → Interface pública de votação
├── 📄 admin.html          → Painel de apuração (acesso restrito)
├── 📄 app.js              → Lógica completa do eleitor
├── 📄 style.css           → Estilos globais (tema claro + escuro)
├── 📄 README.md           → Este arquivo
├── 📄 LICENSE             → Licença MIT
└── 📁 logos/              → Logos das séries (PNG)
    ├── Brooklyn_nine-nine_logo.png
    ├── Friends-Logo.png
    ├── game_of_Thrones_logo.png
    ├── Stranger-Things-Logo.png
    └── The-Office-Logo.png
```

> 💡 **Nota sobre organização**: o `index.html` + `app.js` estão bem separados. O `admin.html` ainda mantém HTML + JS juntos (inline) — uma refatoração futura pode separá-los em `admin.html` + `admin.js`.

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

### Tabela `candidatos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial (PK) | ID único |
| `nome` | text | Nome do candidato |
| `cargo` | text | Categoria (Personagem Feminino, etc.) |
| `serie` | text | Série de origem |
| `foto` | text (URL) | URL da imagem do candidato |
| `ativo` | boolean | Se aparece na votação |

### Tabela `votos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial (PK) | ID do voto |
| `nome_completo` | text | Nome do eleitor |
| `email` | text (unique) | E-mail do eleitor (1 voto por e-mail) |
| `personagem_feminino_1` | text | 1º lugar — Personagem Feminino |
| `personagem_feminino_2` | text | 2º lugar — Personagem Feminino |
| `personagem_feminino_3` | text | 3º lugar — Personagem Feminino |
| `personagem_masculino_1` | text | 1º lugar — Personagem Masculino |
| `personagem_masculino_2` | text | 2º lugar — Personagem Masculino |
| `personagem_masculino_3` | text | 3º lugar — Personagem Masculino |
| `melhor_pet_1` | text | 1º lugar — Melhor Pet |
| `melhor_pet_2` | text | 2º lugar — Melhor Pet |
| `melhor_pet_3` | text | 3º lugar — Melhor Pet |
| `created_at` | timestamp | Data e hora do voto |

### Tabela `admin_users`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial (PK) | ID único |
| `nome` | text | Nome do administrador |
| `email` | text (unique) | E-mail de acesso ao painel |
| `senha` | text | Senha (⚠️ ver *Melhorias Futuras*) |

### Tabela `audit_logs`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | serial (PK) | ID do log |
| `admin_email` | text | Quem executou a ação |
| `eleitor_email` | text | Eleitor afetado |
| `detalhes` | text | Descrição da ação |
| `created_at` | timestamp | Data e hora da ação |

---

## 🚀 Como Rodar Localmente

### 1. Clonar o repositório

```bash
git clone https://github.com/luizsarmentopereira/cinema-voto.git
cd cinema-voto
```

### 2. Abrir o projeto

Como é um projeto **100% estático**, basta abrir o `index.html` no navegador.  
Ou, para servir localmente com hot-reload:

```bash
# Opção A — Python (já vem instalado no macOS/Linux)
python3 -m http.server 8000

# Opção B — Node.js
npx serve

# Opção C — VS Code
# Extensão "Live Server" → botão direito em index.html → Open with Live Server
```

Depois acesse: **http://localhost:8000**

### 3. Configurar o Supabase

No topo do `app.js` e do `admin.html`, atualize as credenciais:

```javascript
const supabaseUrl = 'https://SEU-PROJETO.supabase.co';
const supabaseKey = 'SUA_CHAVE_PUBLICA';
```

---

## 🧪 Como Testar

### Fluxo do Eleitor

1. Abrir `index.html`
2. Informar nome completo + e-mail válido
3. Escolher modo **Passo a passo** ou **Tudo de uma vez**
4. Votar nas 3 categorias (1º, 2º e 3º lugar em cada)
   - Testar a **busca** digitando "office" ou o nome de um candidato
   - Clicar no **👁** de um card para ver o preview
5. Revisar o resumo
6. Confirmar e ver a **animação de confete** 🎉
7. Baixar ou compartilhar o **comprovante PNG**
8. **Testar voto duplicado**: repetir login com o mesmo e-mail → sistema bloqueia
9. **Testar persistência**: fechar o navegador no meio da votação, reabrir e logar com o mesmo e-mail → progresso é restaurado

### Fluxo do Administrador

1. Abrir `admin.html`
2. Fazer login com credenciais de admin
3. **Alterar senha** no primeiro acesso (se for a senha padrão `admin2026`)
4. Conferir **ranking com fotos**, métricas, eleitores e logs
5. **Anular um voto** de teste → conferir se aparece no log

---

## 🎨 Design

O projeto utiliza um **tema cinematográfico premium** inspirado em cerimônias de premiação:

- **Paleta clara**: Marfim, Ouro Antigo e Vinho
- **Paleta escura**: Aubergine profundo, Ouro brilhante e Platina
- **Tipografia**: `Cinzel` (títulos) + `Inter` (corpo)
- **Efeitos**: grão de filme, medalhas com brilho metálico, badges 3D para 1º/2º/3º
- **Dark mode reformulado**: fundo em 4 camadas de gradiente, botões com cores corretas, inputs com glow dourado, cartões com elevação real

---

## 🔒 Segurança

- ✅ Login de admin com e-mail + senha
- ✅ Troca obrigatória de senha no primeiro acesso (detecção da senha padrão `admin2026`)
- ✅ Validação de voto único por e-mail
- ✅ Logs de auditoria imutáveis para todas as anulações
- ⚠️ **As senhas dos admins estão armazenadas em texto puro** — veja *Melhorias Futuras*

---

## 🔮 Melhorias Futuras

- [ ] **Hash de senhas** com bcrypt via Edge Function do Supabase
- [ ] **Autenticação** com Supabase Auth (e-mail + magic link)
- [ ] **CAPTCHA** (Cloudflare Turnstile) para evitar votos automatizados
- [ ] **Confirmação por e-mail** antes de registrar o voto
- [ ] **Exportar votos** para CSV/Excel no painel admin
- [ ] **Página pública de resultados** ao vivo (`/resultados`)
- [ ] **Busca nas tabelas do admin** (eleitores e logs)
- [ ] **Ver comprovante completo** de um eleitor clicando no nome, no painel admin
- [ ] **Gráfico temporal** de votos por hora/dia
- [ ] **Suporte a múltiplas edições** (2026, 2027, ...)
- [ ] **Modo kiosk** para votação presencial em eventos (fullscreen + auto-logout)
- [ ] **Separar `admin.html` em `admin.html` + `admin.js`** (refatoração)

### ✅ Concluídas

- [x] Busca de candidatos por nome e série
- [x] Progresso do eleitor salvo em `localStorage`
- [x] Animação de confete ao confirmar o voto
- [x] Comprovante compartilhável em PNG (html2canvas + Web Share API)
- [x] Preview detalhado do candidato (modal)
- [x] Modo "Tudo de uma vez" (votação em tela única)
- [x] Logos das séries carregadas dinamicamente
- [x] Ranking admin com foto dos candidatos
- [x] Dark mode reformulado (4 camadas de gradiente + glow dourado)

---

## 🌐 Deploy

### GitHub Pages (grátis) — **deploy atual**

1. Settings → Pages → Source: `main` branch → `/root`
2. Acesso em: **https://luizsarmentopereira.github.io/cinema-voto/**

### Vercel / Netlify (grátis)

1. Conectar o repositório
2. Build command: *(vazio)*
3. Output directory: `/` (raiz)
4. Deploy 🚀

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um **fork** do projeto
2. Crie uma **branch** com a sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Faça **commit** seguindo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(ux): adiciona barra de busca de candidatos"
   ```
4. Faça **push** para a sua branch:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request** 🎉

---

## 📜 Licença

Este projeto está sob a licença **MIT**.  
Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👤 Autor

Desenvolvido por **Luiz Sarmento Pereira** para a **Premiação Melhores das Séries 2026**.

- **GitHub**: [@luizsarmentopereira](https://github.com/luizsarmentopereira)

---

<p align="center">
  Feito com 🎬 e ☕ para celebrar as melhores séries da TV
</p>