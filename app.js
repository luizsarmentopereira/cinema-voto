// ============================================================
// 🌙 TEMA CLARO / ESCURO
// ============================================================
(function initTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') document.body.classList.add('dark-mode');
})();

document.addEventListener('DOMContentLoaded', () => {
    const btnTema = document.getElementById('theme-toggle');
    if (!btnTema) return;
    btnTema.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const temaAtual = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('tema', temaAtual);
    });
});

// ============================================================
// ⚠️ Credenciais do Supabase
// ============================================================
const supabaseUrl = 'https://ypyhbuoglipxsyazsxoj.supabase.co';
const supabaseKey = 'sb_publishable_ufcIVBj-f_fHQqnecaxEfw_50Cslvyx';

// ============================================================
// ESTADO GLOBAL
// ============================================================
let candidatosData = [];
let eleitorAtual = { nome: '', email: '' };
const ordemCargos = ["Personagem Feminino", "Personagem Masculino", "Melhor Pet"];
let etapaAtual = 0;
let carregando = true;

// Escolhas por categoria: { 1: "Nome1", 2: "Nome2", 3: "Nome3" }
const escolhas = {
    personagem_feminino:  { 1: null, 2: null, 3: null },
    personagem_masculino: { 1: null, 2: null, 3: null },
    melhor_pet:           { 1: null, 2: null, 3: null }
};

// ============================================================
// ÍCONES DO MODAL
// ============================================================
const ICONES_MODAL = {
    aviso: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    confirmacao: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    erro: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
};

const modalEl = document.getElementById('modal-custom');
const modalIconWrapper = document.getElementById('modal-icon-wrapper');
const modalIcon = document.getElementById('modal-icon');
const modalTitulo = document.getElementById('modal-titulo');
const modalMensagem = document.getElementById('modal-mensagem');
const modalBotoes = document.getElementById('modal-botoes');
let modalResolver = null;

function abrirModal({ tipo = 'aviso', titulo, mensagem, botoes }) {
    return new Promise(resolve => {
        modalResolver = resolve;
        modalIconWrapper.className = 'modal-icon-wrapper tipo-' + tipo;
        modalIcon.innerHTML = ICONES_MODAL[tipo] || ICONES_MODAL.aviso;
        modalTitulo.innerText = titulo;
        modalMensagem.innerHTML = mensagem;

        modalBotoes.innerHTML = '';
        botoes.forEach(btn => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn-' + (btn.estilo || 'primary');
            b.innerHTML = btn.texto;
            b.addEventListener('click', () => fecharModal(btn.valor));
            modalBotoes.appendChild(b);
        });

        modalEl.style.display = 'flex';

        const escHandler = (e) => {
            if (e.key === 'Escape') { fecharModal(null); document.removeEventListener('keydown', escHandler); }
        };
        document.addEventListener('keydown', escHandler);
    });
}

function fecharModal(valor) {
    modalEl.style.display = 'none';
    if (modalResolver) { modalResolver(valor); modalResolver = null; }
}

function modalAviso(titulo, mensagem) {
    return abrirModal({
        tipo: 'aviso', titulo, mensagem,
        botoes: [{ texto: 'Entendi', valor: true, estilo: 'primary' }]
    });
}

// ============================================================
// BUSCA CANDIDATOS
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
// INICIALIZAÇÃO
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
        await modalAviso('Erro ao carregar', 'Não foi possível carregar os candidatos.<br>Verifique a conexão e recarregue a página.');
        btnLogin.innerHTML = "Erro ao carregar";
    }
}

function getFotoCandidato(nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    return cand ? cand.foto : 'https://via.placeholder.com/90';
}

function chaveCategoria(cargo) {
    return cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
}

// ============================================================
// LOGIN
// ============================================================
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (carregando) {
        await modalAviso('Aguarde', 'Os candidatos ainda estão sendo carregados. Tente novamente em alguns segundos.');
        return;
    }

    const nomeDigitado = document.getElementById('nome-login').value.trim();
    const emailDigitado = document.getElementById('email-login').value.trim().toLowerCase();

    if (!emailDigitado.includes('@')) {
        await modalAviso('E-mail inválido', 'Por favor, insira um e-mail válido.');
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
        await modalAviso('Erro de conexão', 'Não foi possível conectar ao servidor.<br>Tente novamente em instantes.');
    } finally {
        btnLogin.innerHTML = htmlOriginal;
        btnLogin.disabled = false;
    }
});

// ============================================================
// RENDERIZAR CANDIDATOS
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
        const key = chaveCategoria(cargo);
        html += `<div class="etapa-votacao" id="etapa-${index}" style="display: ${index === 0 ? 'block' : 'none'};">`;
        html += `
            <div class="cargo-header">
                <h2>${cargo} Destaque</h2>
                <p>Clique nos seus <strong>3 favoritos</strong>. O primeiro clique será o 1º lugar, depois 2º e 3º.</p>
            </div>
            <div class="instrucao-escolha" data-cat="${key}">
                <span>Classificados:</span>
                <span class="contador" id="contador-${key}">0 / 3</span>
            </div>
        `;
        if (agrupado[cargo]) {
            for (const serie in agrupado[cargo]) {
                html += `<h3>${serie}</h3><div class="grid-candidatos">`;
                agrupado[cargo][serie].forEach(cand => {
                    html += `
                        <div class="candidato-item" data-nome="${cand.nome}" data-cat="${key}">
                            <div class="badge-pos"></div>
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}" loading="lazy">
                                <p>${cand.nome}</p>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            }
        }
        html += `</div>`;
    });
    container.innerHTML = html;

    // Registra o clique em cada card (o candidato-item é o alvo para pegar cliques
    // tanto no card quanto na badge)
    document.querySelectorAll('.candidato-item').forEach(item => {
        item.addEventListener('click', () => {
            toggleCandidato(item.dataset.cat, item.dataset.nome);
        });
    });

    atualizarInterfaceNavegacao();
}

// ============================================================
// 🎯 TOGGLE DE CANDIDATO
// Se não está selecionado → adiciona na próxima vaga (1, 2 ou 3)
// Se já está selecionado → remove e reorganiza as posições
// ============================================================
function toggleCandidato(catKey, nomeCand) {
    const slots = escolhas[catKey];
    const posAtual = [1, 2, 3].find(p => slots[p] === nomeCand);

    if (posAtual) {
        // REMOVER: limpa a posição e reorganiza (2º vira 1º, 3º vira 2º)
        slots[posAtual] = null;
        reorganizarSlots(catKey);
    } else {
        // ADICIONAR: pega a próxima vaga livre
        const proximaVaga = [1, 2, 3].find(p => slots[p] === null);
        if (!proximaVaga) {
            modalAviso(
                'Limite atingido',
                `Você já escolheu <strong>3 candidatos</strong> nesta categoria.<br><br>Clique em um deles para removê-lo antes de escolher outro.`
            );
            return;
        }
        slots[proximaVaga] = nomeCand;
    }

    atualizarBadges();
    atualizarContador();
}

// Reorganiza as posições, movendo os selecionados para as primeiras vagas
function reorganizarSlots(catKey) {
    const slots = escolhas[catKey];
    const selecionados = [1, 2, 3].map(p => slots[p]).filter(n => n !== null);
    for (let i = 0; i < 3; i++) {
        slots[i + 1] = selecionados[i] || null;
    }
}

// ============================================================
// ATUALIZA BADGES E ESTADOS VISUAIS DOS CARDS
// ============================================================
function atualizarBadges() {
    document.querySelectorAll('.badge-pos').forEach(el => el.innerHTML = '');
    document.querySelectorAll('.card-candidato').forEach(el => el.classList.remove('tem-posicao'));

    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);
        const slots = escolhas[catKey];

        for (const pos of [1, 2, 3]) {
            const nome = slots[pos];
            if (!nome) continue;

            const item = document.querySelector(`.candidato-item[data-cat="${catKey}"][data-nome="${CSS.escape(nome)}"]`);
            if (!item) continue;

            const card = item.querySelector('.card-candidato');
            const badgeContainer = item.querySelector('.badge-pos');
            card.classList.add('tem-posicao');

            const badge = document.createElement('span');
            badge.className = 'badge-item pos-' + pos;
            badge.innerText = pos + 'º';
            badgeContainer.appendChild(badge);
        }
    });
}

// ============================================================
// ATUALIZA CONTADOR DE CADA CATEGORIA
// ============================================================
function atualizarContador() {
    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);
        const slots = escolhas[catKey];
        const preenchidos = [1, 2, 3].filter(p => slots[p] !== null).length;

        const contador = document.getElementById(`contador-${catKey}`);
        if (contador) contador.innerText = `${preenchidos} / 3`;

        const aviso = document.querySelector(`.instrucao-escolha[data-cat="${catKey}"]`);
        if (aviso) aviso.classList.toggle('completo', preenchidos === 3);
    });
}

// ============================================================
// NAVEGAÇÃO
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

document.getElementById('btn-proximo').addEventListener('click', async () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const catKey = chaveCategoria(cargoAtual);
    const slots = escolhas[catKey];
    const preenchidos = [1, 2, 3].filter(p => slots[p] !== null).length;

    if (preenchidos < 3) {
        await modalAviso(
            'Complete as 3 posições',
            `Na categoria <strong>${cargoAtual}</strong> você escolheu apenas ${preenchidos} de 3.<br><br>Escolha mais ${3 - preenchidos} candidato(s) antes de avançar.`
        );
        return;
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

document.getElementById('btn-revisar').addEventListener('click', async () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const catKey = chaveCategoria(cargoAtual);
    const slots = escolhas[catKey];
    const preenchidos = [1, 2, 3].filter(p => slots[p] !== null).length;

    if (preenchidos < 3) {
        await modalAviso(
            'Complete as 3 posições',
            `Na categoria <strong>${cargoAtual}</strong> você escolheu apenas ${preenchidos} de 3.<br><br>Complete antes de revisar.`
        );
        return;
    }

    preencherListaResumo();
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
        nome_completo: eleitorAtual.nome,
        email: eleitorAtual.email
    };

    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);
        const slots = escolhas[catKey];
        votosParaEnvio[`${catKey}_1`] = slots[1];
        votosParaEnvio[`${catKey}_2`] = slots[2];
        votosParaEnvio[`${catKey}_3`] = slots[3];
    });

    const htmlOriginal = this.innerHTML;
    this.innerHTML = "Enviando...";
    this.disabled = true;
    document.getElementById('btn-voltar-edicao').style.display = 'none';

    try {
        const resposta = await fetch(`${supabaseUrl}/rest/v1/votos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Prefer': 'return=minimal' },
            body: JSON.stringify(votosParaEnvio)
        });

        if (resposta.ok) {
            this.style.display = 'none';
            document.getElementById('header-resumo').innerHTML = `<h2>Comprovante de Votação</h2><p>Votos enviados por <strong>${eleitorAtual.email}</strong>.</p>`;
            document.getElementById('mensagem-sucesso').style.display = 'block';
        } else {
            await modalAviso('Voto já registado', 'Este e-mail já consta na base de dados.<br>Você não pode votar novamente.');
            this.innerHTML = htmlOriginal;
            this.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'flex';
        }
    } catch (erro) {
        await modalAviso('Erro de comunicação', 'Não foi possível enviar os seus votos.<br>Tente novamente em instantes.');
        this.innerHTML = htmlOriginal;
        this.disabled = false;
        document.getElementById('btn-voltar-edicao').style.display = 'flex';
    }
});

// ============================================================
// RESUMO
// ============================================================
function preencherListaResumo(votosDB) {
    const lista = document.getElementById('lista-resumo');
    lista.innerHTML = '';

    const dados = votosDB || null;

    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);

        let slots;
        if (dados) {
            slots = {
                1: dados[`${catKey}_1`],
                2: dados[`${catKey}_2`],
                3: dados[`${catKey}_3`]
            };
        } else {
            slots = escolhas[catKey];
        }

        let html = `
            <div class="resumo-categoria">
                <h3 class="resumo-cat-titulo">${cargo}</h3>
                <div class="resumo-linha">
        `;

        for (const pos of [1, 2, 3]) {
            const nome = slots[pos];
            const foto = nome ? getFotoCandidato(nome) : 'https://via.placeholder.com/90';
            const classePos = pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : 'pos-3';

            html += `
                <div class="resumo-card posicao-${classePos}">
                    <span class="cargo-label posicao-label">${pos}º lugar</span>
                    <img src="${foto}" alt="${nome || 'Não escolhido'}">
                    <span class="nome-label">${nome || '—'}</span>
                </div>
            `;
        }

        html += `</div></div>`;
        lista.innerHTML += html;
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