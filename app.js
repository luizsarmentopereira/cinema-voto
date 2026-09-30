// ⚠️ Credenciais do Supabase
const supabaseUrl = 'https://ypyhbuoglipxsyazsxoj.supabase.co';
const supabaseKey = 'sb_publishable_ufcIVBj-f_fHQqnecaxEfw_50Cslvyx';

// ============================================================
// ESTADO GLOBAL — Preenchido dinamicamente do banco
// ============================================================
let candidatosData = [];
let eleitorAtual = { nome: '', email: '' };
const ordemCargos = ["Personagem Feminino", "Personagem Masculino", "Melhor Pet"];
let etapaAtual = 0;
let carregando = true;

// ============================================================
// BUSCA CANDIDATOS DO SUPABASE
// ============================================================
async function carregarCandidatos() {
    const url = `${supabaseUrl}/rest/v1/candidatos?select=*&ativo=eq.true&order=serie.asc,nome.asc`;
    const resposta = await fetch(url, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    if (!resposta.ok) throw new Error("Falha ao buscar candidatos");
    return await resposta.json();
}

// ============================================================
// INICIALIZAÇÃO — Busca candidatos antes de liberar login
// ============================================================
async function inicializar() {
    const btnLogin = document.getElementById('btn-login');
    const htmlOriginal = btnLogin.innerHTML;
    btnLogin.innerHTML = "Carregando candidatos...";
    btnLogin.disabled = true;

    try {
        candidatosData = await carregarCandidatos();
        if (!candidatosData.length) throw new Error("Nenhum candidato cadastrado");
        renderizarCandidatos();
        carregando = false;
        btnLogin.innerHTML = htmlOriginal;
        btnLogin.disabled = false;
    } catch (erro) {
        console.error('Erro ao carregar candidatos:', erro);
        alert("Não foi possível carregar os candidatos. Verifique a conexão e recarregue a página.");
        btnLogin.innerHTML = "Erro ao carregar";
    }
}

// ============================================================
// Função auxiliar — busca foto pelo nome
// ============================================================
function getFotoCandidato(nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    return cand ? cand.foto : 'https://via.placeholder.com/90';
}

// ============================================================
// LOGIN E VALIDAÇÃO
// ============================================================
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (carregando) { alert("Aguarde o carregamento dos candidatos."); return; }

    const nomeDigitado = document.getElementById('nome-login').value.trim();
    const emailDigitado = document.getElementById('email-login').value.trim().toLowerCase();

    if (!emailDigitado.includes('@')) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    const btnLogin = document.getElementById('btn-login');
    const htmlOriginal = btnLogin.innerHTML;
    btnLogin.innerHTML = "Verificando...";
    btnLogin.disabled = true;

    try {
        const url = `${supabaseUrl}/rest/v1/votos?email=eq.${encodeURIComponent(emailDigitado)}&select=*`;
        const resposta = await fetch(url, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        
        const dados = await resposta.json();

        if (dados && dados.length > 0) {
            mostrarEcraRecibo(dados[0]);
        } else {
            eleitorAtual.nome = nomeDigitado;
            eleitorAtual.email = emailDigitado;
            
            document.querySelectorAll('.nome-exibicao').forEach(el => el.innerText = nomeDigitado);
            
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('votacao-section').style.display = 'block';
        }
    } catch (erro) {
        alert("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
        btnLogin.innerHTML = htmlOriginal;
        btnLogin.disabled = false;
    }
});

// ============================================================
// RENDERIZAR CARTÕES DE VOTAÇÃO
// ============================================================
function renderizarCandidatos() {
    const container = document.getElementById('secoes-votacao');
    const agrupado = candidatosData.reduce((acc, candidato) => {
        if (!acc[candidato.cargo]) acc[candidato.cargo] = {};
        if (!acc[candidato.cargo][candidato.serie]) acc[candidato.cargo][candidato.serie] = [];
        acc[candidato.cargo][candidato.serie].push(candidato);
        return acc;
    }, {});

    let html = '';
    ordemCargos.forEach((cargo, index) => {
        html += `<div class="etapa-votacao" id="etapa-${index}" style="display: ${index === 0 ? 'block' : 'none'};">`;
        html += `
            <div class="cargo-header">
                <h2>${cargo} Destaque</h2>
                <p>Selecione <strong>apenas 1 candidato</strong> desta categoria.</p>
            </div>
        `;
        if (agrupado[cargo]) {
            for (const serie in agrupado[cargo]) {
                html += `<h3>${serie}</h3><div class="grid-candidatos">`;
                agrupado[cargo][serie].forEach(cand => {
                    const nameAttr = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                    html += `
                        <label>
                            <input type="radio" name="${nameAttr}" value="${cand.nome}">
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}" loading="lazy">
                                <p>${cand.nome}</p>
                            </div>
                        </label>
                    `;
                });
                html += `</div>`;
            }
        }
        html += `</div>`;
    });
    container.innerHTML = html;
    atualizarInterfaceNavegacao();
}

// ============================================================
// CONTROLE DA BARRA E BOTÕES
// ============================================================
function atualizarInterfaceNavegacao() {
    const progresso = ((etapaAtual + 1) / ordemCargos.length) * 100;
    document.getElementById('progresso-barra').style.width = `${progresso}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${ordemCargos.length}: ${ordemCargos[etapaAtual]}`;

    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'flex';
    
    if (etapaAtual === ordemCargos.length - 1) {
        document.getElementById('btn-proximo').style.display = 'none';
        document.getElementById('btn-revisar').style.display = 'flex';
    } else {
        document.getElementById('btn-proximo').style.display = 'flex';
        document.getElementById('btn-revisar').style.display = 'none';
    }
}

document.getElementById('btn-proximo').addEventListener('click', () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (!document.querySelector(`input[name="${nameAttr}"]:checked`)) {
        alert(`Selecione quem receberá o seu voto para ${cargoAtual} antes de avançar.`); return;
    }
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual++;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0); 
});

document.getElementById('btn-anterior').addEventListener('click', () => {
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual--;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0);
});

document.getElementById('btn-revisar').addEventListener('click', () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
    if (!document.querySelector(`input[name="${nameAttr}"]:checked`)) {
        alert("Selecione a sua última opção antes de revisar os votos."); return;
    }
    
    const votos = {
        personagem_feminino:  document.querySelector('input[name="personagem_feminino"]:checked').value,
        personagem_masculino: document.querySelector('input[name="personagem_masculino"]:checked').value,
        melhor_pet:           document.querySelector('input[name="melhor_pet"]:checked').value
    };

    preencherListaResumo(votos);
    
    document.getElementById('votacao-section').style.display = 'none';
    document.getElementById('resumo-section').style.display = 'block';
    window.scrollTo(0, 0);
});

document.getElementById('btn-voltar-edicao').addEventListener('click', () => {
    document.getElementById('resumo-section').style.display = 'none';
    document.getElementById('votacao-section').style.display = 'block';
});

// ============================================================
// ENVIO FINAL
// ============================================================
document.getElementById('btn-confirmar-final').addEventListener('click', async function() {
    const votosParaEnvio = {
        personagem_feminino:  document.querySelector('input[name="personagem_feminino"]:checked').value,
        personagem_masculino: document.querySelector('input[name="personagem_masculino"]:checked').value,
        melhor_pet:           document.querySelector('input[name="melhor_pet"]:checked').value
    };

    const htmlOriginal = this.innerHTML;
    this.innerHTML = "Enviando...";
    this.disabled = true;
    document.getElementById('btn-voltar-edicao').style.display = 'none';

    try {
        const resposta = await fetch(`${supabaseUrl}/rest/v1/votos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
                nome_completo: eleitorAtual.nome,
                email: eleitorAtual.email,
                ...votosParaEnvio
            })
        });

        if (resposta.ok) {
            this.style.display = 'none';
            document.getElementById('header-resumo').innerHTML = `<h2>Comprovante de Votação</h2><p>Votos enviados por <strong>${eleitorAtual.email}</strong>.</p>`;
            document.getElementById('mensagem-sucesso').style.display = 'block';
        } else {
            alert("Erro: O seu E-mail já consta na base de dados.");
            this.innerHTML = htmlOriginal;
            this.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'flex';
        }
    } catch (erro) {
        alert("Erro de comunicação com o servidor.");
        this.innerHTML = htmlOriginal;
        this.disabled = false;
        document.getElementById('btn-voltar-edicao').style.display = 'flex';
    }
});

// ============================================================
// PREENCHER RESUMO
// ============================================================
function preencherListaResumo(votosDB) {
    const lista = document.getElementById('lista-resumo');
    lista.innerHTML = '';

    ordemCargos.forEach(cargo => {
        const key = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
        const nomeVotado = votosDB[key];
        const foto = getFotoCandidato(nomeVotado);

        lista.innerHTML += `
            <div class="resumo-card">
                <span class="cargo-label">${cargo}</span>
                <img src="${foto}" alt="${nomeVotado}">
                <span class="nome-label">${nomeVotado}</span>
            </div>
        `;
    });
}

// ============================================================
// MOSTRAR RECIBO PARA QUEM JÁ VOTOU
// ============================================================
function mostrarEcraRecibo(dadosDB) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('resumo-section').style.display = 'block';
    
    document.getElementById('header-resumo').innerHTML = `
        <h2 style="color: #1a7f37;">Voto Já Registrado!</h2>
        <p>Identificamos que <strong>${dadosDB.nome_completo}</strong> (${dadosDB.email}) já participou da votação. Abaixo estão as suas escolhas:</p>
    `;
    
    document.getElementById('botoes-resumo').style.display = 'none';
    document.getElementById('mensagem-sucesso').style.display = 'none';

    preencherListaResumo(dadosDB);
}

// ============================================================
// 🚀 Start
// ============================================================
inicializar();