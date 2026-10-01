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
let modoVotacao = 'etapas'; // 'etapas' | 'rapido'

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
// 🆕 PREVIEW MODAL
// ============================================================
let previewCandidatoAtual = null;

function abrirPreview(catKey, nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    if (!cand) return;
    previewCandidatoAtual = { catKey, nome: nomeCand };

    const slots = escolhas[catKey];
    const pos = [1, 2, 3].find(p => slots[p] === nomeCand);

    document.getElementById('preview-foto').src = cand.foto;
    document.getElementById('preview-foto').alt = cand.nome;
    document.getElementById('preview-nome').innerText = cand.nome;
    document.getElementById('preview-serie').innerText = cand.serie;
    document.getElementById('preview-categoria').innerText = cand.cargo;

    const badge = document.getElementById('preview-badge-pos');
    if (pos) {
        badge.innerText = `${pos}º`;
        badge.className = 'preview-badge-pos pos-' + pos + ' visivel';
    } else {
        badge.className = 'preview-badge-pos';
    }

    const btnEscolher = document.getElementById('preview-escolher');
    const txtEscolher = document.getElementById('preview-escolher-texto');
    if (pos) {
        txtEscolher.innerText = `Remover (${pos}º lugar)`;
        btnEscolher.classList.add('btn-remover');
    } else {
        txtEscolher.innerText = 'Escolher este';
        btnEscolher.classList.remove('btn-remover');
    }

    document.getElementById('modal-preview').style.display = 'flex';
}

function fecharPreview() {
    document.getElementById('modal-preview').style.display = 'none';
    previewCandidatoAtual = null;
}

document.getElementById('preview-fechar').addEventListener('click', fecharPreview);
document.getElementById('preview-cancelar').addEventListener('click', fecharPreview);
document.getElementById('modal-preview').addEventListener('click', (e) => {
    if (e.target.id === 'modal-preview') fecharPreview();
});
document.getElementById('preview-escolher').addEventListener('click', () => {
    if (!previewCandidatoAtual) return;
    toggleCandidato(previewCandidatoAtual.catKey, previewCandidatoAtual.nome);
    fecharPreview();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('modal-preview').style.display === 'flex') {
        fecharPreview();
    }
});

// ============================================================
// 💾 PROGRESSO NO LOCALSTORAGE
// ============================================================
function chaveProgresso(email) {
    return `votacao_progresso_${(email || '').toLowerCase()}`;
}

function salvarProgresso() {
    if (!eleitorAtual.email) return;
    try {
        localStorage.setItem(chaveProgresso(eleitorAtual.email), JSON.stringify({
            escolhas,
            modoVotacao,
            etapaAtual,
            salvoEm: Date.now()
        }));
    } catch (e) { console.warn('Não foi possível salvar progresso:', e); }
}

function restaurarProgresso(email) {
    try {
        const raw = localStorage.getItem(chaveProgresso(email));
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data || !data.escolhas) return false;

        ['personagem_feminino', 'personagem_masculino', 'melhor_pet'].forEach(k => {
            if (data.escolhas[k]) {
                [1, 2, 3].forEach(p => {
                    const nome = data.escolhas[k][p];
                    if (nome && candidatosData.some(c => c.nome === nome)) {
                        escolhas[k][p] = nome;
                    }
                });
            }
        });
        if (data.modoVotacao === 'rapido' || data.modoVotacao === 'etapas') {
            modoVotacao = data.modoVotacao;
        }
        if (typeof data.etapaAtual === 'number' && data.etapaAtual >= 0 && data.etapaAtual < ordemCargos.length) {
            etapaAtual = data.etapaAtual;
        }
        return true;
    } catch (e) {
        console.warn('Erro ao restaurar progresso:', e);
        return false;
    }
}

function limparProgresso(email) {
    if (!email) return;
    try { localStorage.removeItem(chaveProgresso(email)); } catch (e) {}
}

function calcularTotalSelecionados() {
    let total = 0;
    ordemCargos.forEach(cargo => {
        const catKey = chaveCategoria(cargo);
        [1, 2, 3].forEach(p => { if (escolhas[catKey][p]) total++; });
    });
    return total;
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

            // 🆕 Restaurar progresso salvo
            const restaurado = restaurarProgresso(emailDigitado);
            if (restaurado) {
                atualizarBadges();
                atualizarContador();
                atualizarInterfaceNavegacao();
                // Pequeno delay para garantir que o DOM já esteja visível
                setTimeout(() => {
                    modalAviso(
                        'Bem-vindo de volta! 👋',
                        'Encontramos escolhas guardadas do seu último acesso.<br>Você pode continuar de onde parou.'
                    );
                }, 300);
            }
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

            <!-- 🔍 Barra de busca -->
            <div class="busca-wrapper">
                <svg class="busca-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.3-4.3"/>
                </svg>
                <input type="text" class="busca-candidato" data-cat="${key}"
                       placeholder="Buscar candidato ou série..." autocomplete="off">
                <button type="button" class="busca-limpar" data-cat="${key}" aria-label="Limpar busca">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        if (agrupado[cargo]) {
            for (const serie in agrupado[cargo]) {
                html += `<div class="serie-grupo" data-serie="${serie}">`;
                html += `<h3>${serie}</h3><div class="grid-candidatos">`;
                agrupado[cargo][serie].forEach(cand => {
                    html += `
                        <div class="candidato-item" data-nome="${cand.nome}" data-cat="${key}">
                            <div class="badge-pos"></div>
                            <button type="button" class="card-preview-btn" data-cat="${key}" data-nome="${cand.nome}" aria-label="Ver detalhes de ${cand.nome}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}" loading="lazy">
                                <p>${cand.nome}</p>
                            </div>
                        </div>
                    `;
                });
                html += `</div></div>`;
            }
        }

        html += `<div class="busca-sem-resultado" data-cat="${key}">
            Nenhum candidato encontrado. Tente outro termo.
        </div>`;

        html += `</div>`;
    });
    container.innerHTML = html;

    // Clique nos cards (seleciona)
    document.querySelectorAll('.candidato-item').forEach(item => {
        item.addEventListener('click', () => {
            toggleCandidato(item.dataset.cat, item.dataset.nome);
        });
    });

    // 🆕 Clique no botão de preview (não propaga)
    document.querySelectorAll('.card-preview-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            abrirPreview(btn.dataset.cat, btn.dataset.nome);
        });
    });

    // 🔍 Listener da busca
    document.querySelectorAll('.busca-candidato').forEach(input => {
        input.addEventListener('input', (e) => {
            const catKey = e.target.dataset.cat;
            filtrarCandidatos(catKey, e.target.value);
            const btnLimpar = document.querySelector(`.busca-limpar[data-cat="${catKey}"]`);
            if (btnLimpar) btnLimpar.classList.toggle('visivel', e.target.value.length > 0);
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.preventDefault();
        });
    });

    document.querySelectorAll('.busca-limpar').forEach(btn => {
        btn.addEventListener('click', () => {
            const catKey = btn.dataset.cat;
            const input = document.querySelector(`.busca-candidato[data-cat="${catKey}"]`);
            if (input) {
                input.value = '';
                filtrarCandidatos(catKey, '');
                input.focus();
            }
            btn.classList.remove('visivel');
        });
    });

    atualizarInterfaceNavegacao();
}

// ============================================================
// 🔍 BUSCA DE CANDIDATOS
// ============================================================
function normalizarBusca(txt) {
    return (txt || '').toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function filtrarCandidatos(catKey, termo) {
    const termoNorm = normalizarBusca(termo);
    const etapa = document.querySelector(`.candidato-item[data-cat="${catKey}"]`)?.closest('.etapa-votacao');
    if (!etapa) return;

    const slots = escolhas[catKey] || {};
    const itens = etapa.querySelectorAll(`.candidato-item[data-cat="${catKey}"]`);

    itens.forEach(item => {
        const nome = item.dataset.nome;
        const nomeNorm = normalizarBusca(nome);
        const serieNorm = normalizarBusca(item.closest('.serie-grupo')?.dataset.serie || '');
        const selecionado = [1, 2, 3].some(p => slots[p] === nome);

        const match = !termoNorm
            || nomeNorm.includes(termoNorm)
            || serieNorm.includes(termoNorm)
            || selecionado;

        item.classList.toggle('oculto', !match);
    });

    etapa.querySelectorAll('.serie-grupo').forEach(grupo => {
        const visiveis = grupo.querySelectorAll('.candidato-item:not(.oculto)').length;
        grupo.classList.toggle('oculto', visiveis === 0);
    });

    const semResultado = etapa.querySelector(`.busca-sem-resultado[data-cat="${catKey}"]`);
    if (semResultado) {
        const totalVisiveis = etapa.querySelectorAll('.candidato-item:not(.oculto)').length;
        semResultado.classList.toggle('visivel', totalVisiveis === 0 && termoNorm.length > 0);
    }
}

// ============================================================
// 🎯 TOGGLE DE CANDIDATO
// ============================================================
function toggleCandidato(catKey, nomeCand) {
    const slots = escolhas[catKey];
    const posAtual = [1, 2, 3].find(p => slots[p] === nomeCand);

    if (posAtual) {
        slots[posAtual] = null;
        reorganizarSlots(catKey);
    } else {
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
    atualizarInterfaceNavegacao(); // atualiza progresso do modo rápido
    salvarProgresso(); // 💾

    const inputBusca = document.querySelector(`.busca-candidato[data-cat="${catKey}"]`);
    if (inputBusca && inputBusca.value.trim().length > 0) {
        filtrarCandidatos(catKey, inputBusca.value);
    }
}

function reorganizarSlots(catKey) {
    const slots = escolhas[catKey];
    const selecionados = [1, 2, 3].map(p => slots[p]).filter(n => n !== null);
    for (let i = 0; i < 3; i++) {
        slots[i + 1] = selecionados[i] || null;
    }
}

// ============================================================
// ATUALIZA BADGES
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
// ATUALIZA CONTADOR
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
    const isRapido = modoVotacao === 'rapido';

    // Sincroniza botões do toggle
    document.querySelectorAll('.modo-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.modo === modoVotacao);
    });

    if (isRapido) {
        ordemCargos.forEach((cargo, i) => {
            const el = document.getElementById(`etapa-${i}`);
            if (el) el.style.display = 'block';
        });
        document.getElementById('btn-anterior').style.display = 'none';
        document.getElementById('btn-proximo').style.display = 'none';
        document.getElementById('btn-revisar').style.display = 'flex';

        const total = calcularTotalSelecionados();
        const pct = (total / (ordemCargos.length * 3)) * 100;
        document.getElementById('progresso-barra').style.width = `${pct}%`;
        document.getElementById('progresso-texto').innerText = `Modo rápido · ${total} de ${ordemCargos.length * 3} escolhas`;
    } else {
        ordemCargos.forEach((cargo, i) => {
            const el = document.getElementById(`etapa-${i}`);
            if (el) el.style.display = i === etapaAtual ? 'block' : 'none';
        });
        document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'flex';

        if (etapaAtual === ordemCargos.length - 1) {
            document.getElementById('btn-proximo').style.display = 'none';
            document.getElementById('btn-revisar').style.display = 'flex';
        } else {
            document.getElementById('btn-proximo').style.display = 'flex';
            document.getElementById('btn-revisar').style.display = 'none';
        }

        const pct = ((etapaAtual + 1) / ordemCargos.length) * 100;
        document.getElementById('progresso-barra').style.width = `${pct}%`;
        document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${ordemCargos.length}: ${ordemCargos[etapaAtual]}`;
    }
}

// 🆕 Toggle do modo
document.querySelectorAll('.modo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const novoModo = btn.dataset.modo;
        if (novoModo === modoVotacao) return;
        modoVotacao = novoModo;
        atualizarInterfaceNavegacao();
        salvarProgresso();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

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

    etapaAtual++;
    atualizarInterfaceNavegacao();
    salvarProgresso();
    window.scrollTo(0, 0);
});

document.getElementById('btn-anterior').addEventListener('click', () => {
    etapaAtual--;
    atualizarInterfaceNavegacao();
    salvarProgresso();
    window.scrollTo(0, 0);
});

document.getElementById('btn-revisar').addEventListener('click', async () => {
    if (modoVotacao === 'rapido') {
        const total = calcularTotalSelecionados();
        if (total < ordemCargos.length * 3) {
            const faltam = (ordemCargos.length * 3) - total;
            await modalAviso(
                'Faltam escolhas',
                `Você ainda não completou todas as categorias.<br><br>Faltam <strong>${faltam}</strong> escolha(s) para revisar.`
            );
            return;
        }
    } else {
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
// 🆕 CONFETES
// ============================================================
function dispararConfete() {
    if (typeof confetti !== 'function') return;

    const cores = ['#C9992A', '#E8B93B', '#8B1E5C', '#A62270', '#15803D', '#FFFFFF'];
    const duracao = 3500;
    const fim = Date.now() + duracao;

    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.75 },
            colors: cores,
            scalar: 0.9
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.75 },
            colors: cores,
            scalar: 0.9
        });
        if (Date.now() < fim) requestAnimationFrame(frame);
    })();

    setTimeout(() => {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.55 },
            colors: cores,
            startVelocity: 45
        });
    }, 200);

    setTimeout(() => {
        confetti({
            particleCount: 80,
            angle: 90,
            spread: 360,
            origin: { y: 0.5 },
            colors: cores,
            startVelocity: 30,
            gravity: 0.8
        });
    }, 700);
}

// ============================================================
// 🆕 COMPROVANTE COMPARTILHÁVEL
// ============================================================
async function gerarImagemComprovante() {
    if (typeof html2canvas !== 'function') {
        await modalAviso('Indisponível', 'A biblioteca de geração de imagem não carregou.<br>Verifique a conexão.');
        return null;
    }
    const alvo = document.getElementById('resumo-section');
    if (!alvo) return null;

    const bgCor = document.body.classList.contains('dark-mode') ? '#1A1220' : '#FFFFFF';

    try {
        const canvas = await html2canvas(alvo, {
            backgroundColor: bgCor,
            scale: 2,
            useCORS: true,
            logging: false,
            ignoreElements: (el) => el.classList.contains('no-capture') || el.id === 'botoes-resumo'
        });
        return canvas;
    } catch (e) {
        console.error('Erro ao gerar imagem:', e);
        return null;
    }
}

document.getElementById('btn-baixar-comprovante').addEventListener('click', async function() {
    const original = this.innerHTML;
    this.innerHTML = 'Gerando...';
    this.disabled = true;

    const canvas = await gerarImagemComprovante();
    if (canvas) {
        try {
            const link = document.createElement('a');
            const slug = (eleitorAtual.email || 'comprovante').split('@')[0].replace(/[^a-z0-9]/gi, '-');
            link.download = `comprovante-melhores-series-${slug}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            await modalAviso('Erro', 'Não foi possível baixar a imagem.');
        }
    }

    this.innerHTML = original;
    this.disabled = false;
});

document.getElementById('btn-compartilhar-comprovante').addEventListener('click', async function() {
    const original = this.innerHTML;
    this.innerHTML = 'Preparando...';
    this.disabled = true;

    const canvas = await gerarImagemComprovante();
    if (!canvas) {
        this.innerHTML = original;
        this.disabled = false;
        return;
    }

    canvas.toBlob(async (blob) => {
        if (!blob) {
            this.innerHTML = original;
            this.disabled = false;
            return;
        }
        const file = new File([blob], 'comprovante-melhores-series.png', { type: 'image/png' });
        const texto = `🎬 Acabei de votar na Premiação Melhores das Séries 2026! Confira o meu comprovante.`;

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: 'Meu comprovante de votação',
                    text: texto
                });
            } catch (e) {
                if (e.name !== 'AbortError') console.warn('Erro ao compartilhar:', e);
            }
        } else {
            try {
                const link = document.createElement('a');
                const slug = (eleitorAtual.email || 'comprovante').split('@')[0].replace(/[^a-z0-9]/gi, '-');
                link.download = `comprovante-melhores-series-${slug}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                await modalAviso(
                    'Imagem baixada! 📸',
                    'O seu dispositivo não suporta partilha direta.<br>A imagem foi salva — agora você pode compartilhá-la manualmente.'
                );
            } catch (e) {
                await modalAviso('Erro', 'Não foi possível gerar o comprovante.');
            }
        }

        this.innerHTML = original;
        this.disabled = false;
    }, 'image/png');
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
            // 🎉 Confete
            dispararConfete();

            this.style.display = 'none';
            document.getElementById('botoes-resumo').style.display = 'none';
            document.getElementById('header-resumo').innerHTML = `<h2>Comprovante de Votação</h2><p>Votos enviados por <strong>${eleitorAtual.email}</strong>.</p>`;
            document.getElementById('mensagem-sucesso').style.display = 'block';
            document.getElementById('comprovante-acoes').style.display = 'flex';

            // 💾 Limpa progresso
            limparProgresso(eleitorAtual.email);
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

    // Guarda dados do eleitor para o comprovante
    eleitorAtual.nome = dadosDB.nome_completo;
    eleitorAtual.email = dadosDB.email;

    document.getElementById('header-resumo').innerHTML = `
        <h2 style="color: #1a7f37;">Voto Já Registrado!</h2>
        <p>Identificamos que <strong>${dadosDB.nome_completo}</strong> (${dadosDB.email}) já participou da votação. Abaixo estão as suas escolhas:</p>
    `;

    document.getElementById('botoes-resumo').style.display = 'none';
    document.getElementById('mensagem-sucesso').style.display = 'none';
    document.getElementById('comprovante-acoes').style.display = 'flex';

    preencherListaResumo(dadosDB);
}

// ============================================================
// 🚀 Start
// ============================================================
inicializar();