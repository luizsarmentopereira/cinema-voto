// ⚠️ Credenciais do Supabase
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

// ============================================================
// ÍCONES SVG (para uso no modal)
// ============================================================
const ICONES_MODAL = {
    aviso: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    confirmacao: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    erro: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
};

// ============================================================
// 🎬 MODAL CUSTOMIZADO
// ============================================================
const modalEl = document.getElementById('modal-custom');
const modalIconWrapper = document.getElementById('modal-icon-wrapper');
const modalIcon = document.getElementById('modal-icon');
const modalTitulo = document.getElementById('modal-titulo');
const modalMensagem = document.getElementById('modal-mensagem');
const modalBotoes = document.getElementById('modal-botoes');

let modalResolver = null;

/**
 * Abre o modal e retorna uma Promise.
 * @param {Object} opts
 * @param {string} opts.tipo     'aviso' | 'confirmacao' | 'erro'
 * @param {string} opts.titulo
 * @param {string} opts.mensagem  (aceita HTML simples como <strong>)
 * @param {Array}  opts.botoes    [{ texto, valor, estilo }]
 *        estilo: 'primary' | 'cancelar' | 'perigo'
 */
function abrirModal({ tipo = 'aviso', titulo, mensagem, botoes }) {
    return new Promise(resolve => {
        modalResolver = resolve;

        // Aplica ícone e cor
        modalIconWrapper.className = 'modal-icon-wrapper tipo-' + tipo;
        modalIcon.innerHTML = ICONES_MODAL[tipo] || ICONES_MODAL.aviso;

        // Textos
        modalTitulo.innerText = titulo;
        modalMensagem.innerHTML = mensagem;

        // Botões
        modalBotoes.innerHTML = '';
        botoes.forEach(btn => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'btn-' + (btn.estilo || 'primary');
            b.innerHTML = btn.texto;
            b.addEventListener('click', () => {
                fecharModal(btn.valor);
            });
            modalBotoes.appendChild(b);
        });

        // Exibe
        modalEl.style.display = 'flex';

        // Permite fechar com ESC (resolve como false/null)
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                fecharModal(null);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    });
}

function fecharModal(valor) {
    modalEl.style.display = 'none';
    if (modalResolver) {
        modalResolver(valor);
        modalResolver = null;
    }
}

// Atalhos
function modalAviso(titulo, mensagem) {
    return abrirModal({
        tipo: 'aviso',
        titulo,
        mensagem,
        botoes: [{ texto: 'Entendi', valor: true, estilo: 'primary' }]
    });
}

function modalConfirmacao(titulo, mensagem, textoSim = 'Sim, trocar', textoNao = 'Não, manter') {
    return abrirModal({
        tipo: 'confirmacao',
        titulo,
        mensagem,
        botoes: [
            { texto: textoNao, valor: false, estilo: 'cancelar' },
            { texto: textoSim, valor: true, estilo: 'primary' }
        ]
    });
}

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
        await modalAviso(
            'Erro ao carregar',
            'Não foi possível carregar os candidatos.<br>Verifique a conexão e recarregue a página.'
        );
        btnLogin.innerHTML = "Erro ao carregar";
    }
}

// ============================================================
// AUXILIAR
// ============================================================
function getFotoCandidato(nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    return cand ? cand.foto : 'https://via.placeholder.com/90';
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
    aplicarBloqueioTrocaSelecao();
}

// ============================================================
// 🚫 BLOQUEIO: não permitir trocar de candidato sem confirmação
// ============================================================
function aplicarBloqueioTrocaSelecao() {
    document.querySelectorAll('#secoes-votacao input[type="radio"]').forEach(radio => {
        radio.addEventListener('click', async function(e) {
            const nomeGrupo = this.name;

            // Qual está selecionado atualmente nesse grupo?
            const atualSelecionado = document.querySelector(`input[name="${nomeGrupo}"]:checked`);

            // Se não havia nenhum, ou é o mesmo que já estava → deixa passar
            if (!atualSelecionado || atualSelecionado === this) return;

            // Bloqueia a mudança automática
            e.preventDefault();

            const nomeAnterior = atualSelecionado.value;
            const nomeNovo = this.value;

            const confirmou = await modalConfirmacao(
                'Trocar de candidato?',
                `Você já escolheu <strong>${nomeAnterior}</strong> nesta categoria.<br><br>Deseja trocar por <strong>${nomeNovo}</strong>?`,
                'Sim, trocar',
                'Não, manter'
            );

            if (confirmou) {
                // Aplica a troca manualmente
                atualSelecionado.checked = false;
                this.checked = true;
            }
            // Se não confirmou → nada acontece, o antigo permanece
        });
    });
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

// ============================================================
// BOTÃO PRÓXIMO
// ============================================================
document.getElementById('btn-proximo').addEventListener('click', async () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");

    if (!document.querySelector(`input[name="${nameAttr}"]:checked`)) {
        await modalAviso(
            'Escolha um candidato',
            `Você ainda não selecionou o seu voto para <strong>${cargoAtual}</strong>.<br><br>Escolha uma opção antes de avançar para a próxima categoria.`
        );
        return;
    }

    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual++;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0); 
});

// ============================================================
// BOTÃO ANTERIOR
// ============================================================
document.getElementById('btn-anterior').addEventListener('click', () => {
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'none';
    etapaAtual--;
    document.getElementById(`etapa-${etapaAtual}`).style.display = 'block';
    atualizarInterfaceNavegacao();
    window.scrollTo(0, 0);
});

// ============================================================
// BOTÃO REVISAR
// ============================================================
document.getElementById('btn-revisar').addEventListener('click', async () => {
    const cargoAtual = ordemCargos[etapaAtual];
    const nameAttr = cargoAtual.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");

    if (!document.querySelector(`input[name="${nameAttr}"]:checked`)) {
        await modalAviso(
            'Escolha um candidato',
            `Você ainda não selecionou o seu voto para <strong>${cargoAtual}</strong>.<br><br>Escolha uma opção antes de revisar os votos.`
        );
        return;
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

// ============================================================
// BOTÃO VOLTAR PARA EDIÇÃO
// ============================================================
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
            await modalAviso(
                'Voto já registado',
                'Este e-mail já consta na base de dados.<br>Você não pode votar novamente.'
            );
            this.innerHTML = htmlOriginal;
            this.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'flex';
        }
    } catch (erro) {
        await modalAviso(
            'Erro de comunicação',
            'Não foi possível enviar os seus votos.<br>Tente novamente em instantes.'
        );
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