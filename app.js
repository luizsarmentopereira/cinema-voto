// ⚠️ SUBSTITUA PELAS SUAS NOVAS CREDENCIAIS DO SUPABASE
const supabaseUrl = 'https://ypyhbuoglipxsyazsxoj.supabase.co';
const supabaseKey = 'sb_publishable_ufcIVBj-f_fHQqnecaxEfw_50Cslvyx';

// ============================================================
// CANDIDATOS POR SÉRIE E CATEGORIA
// ============================================================
const candidatosData = [
    // ============ GAME OF THRONES ============
    // Personagem Feminino
    { id: "got-f1", nome: "Daenerys Targaryen", cargo: "Personagem Feminino", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Daenerys+Targaryen&background=E91E63&color=fff&bold=true" },
    { id: "got-f2", nome: "Arya Stark",            cargo: "Personagem Feminino", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Arya+Stark&background=E91E63&color=fff&bold=true" },
    { id: "got-f3", nome: "Cersei Lannister",      cargo: "Personagem Feminino", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Cersei+Lannister&background=E91E63&color=fff&bold=true" },
    // Personagem Masculino
    { id: "got-m1", nome: "Jon Snow",              cargo: "Personagem Masculino", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Jon+Snow&background=3F51B5&color=fff&bold=true" },
    { id: "got-m2", nome: "Tyrion Lannister",      cargo: "Personagem Masculino", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Tyrion+Lannister&background=3F51B5&color=fff&bold=true" },
    { id: "got-m3", nome: "Jaime Lannister",       cargo: "Personagem Masculino", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Jaime+Lannister&background=3F51B5&color=fff&bold=true" },
    // Melhor Pet
    { id: "got-p1", nome: "Fantasma (Ghost)",      cargo: "Melhor Pet", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Fantasma&background=9E9E9E&color=fff&bold=true" },
    { id: "got-p2", nome: "Drogon",                cargo: "Melhor Pet", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Drogon&background=9E9E9E&color=fff&bold=true" },
    { id: "got-p3", nome: "Nymeria",               cargo: "Melhor Pet", setor: "Game of Thrones", foto: "https://ui-avatars.com/api/?name=Nymeria&background=9E9E9E&color=fff&bold=true" },

    // ============ THE OFFICE ============
    { id: "off-f1", nome: "Pam Beesly",            cargo: "Personagem Feminino", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Pam+Beesly&background=E91E63&color=fff&bold=true" },
    { id: "off-f2", nome: "Angela Martin",         cargo: "Personagem Feminino", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Angela+Martin&background=E91E63&color=fff&bold=true" },
    { id: "off-f3", nome: "Kelly Kapoor",          cargo: "Personagem Feminino", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Kelly+Kapoor&background=E91E63&color=fff&bold=true" },
    { id: "off-m1", nome: "Michael Scott",         cargo: "Personagem Masculino", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Michael+Scott&background=3F51B5&color=fff&bold=true" },
    { id: "off-m2", nome: "Jim Halpert",           cargo: "Personagem Masculino", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Jim+Halpert&background=3F51B5&color=fff&bold=true" },
    { id: "off-m3", nome: "Dwight Schrute",        cargo: "Personagem Masculino", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Dwight+Schrute&background=3F51B5&color=fff&bold=true" },
    { id: "off-p1", nome: "Bandit (gato)",         cargo: "Melhor Pet", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Bandit&background=9E9E9E&color=fff&bold=true" },
    { id: "off-p2", nome: "Princess Lady (gato)",  cargo: "Melhor Pet", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Princess+Lady&background=9E9E9E&color=fff&bold=true" },
    { id: "off-p3", nome: "Garbage (gato)",        cargo: "Melhor Pet", setor: "The Office", foto: "https://ui-avatars.com/api/?name=Garbage&background=9E9E9E&color=fff&bold=true" },

    // ============ FRIENDS ============
    { id: "fr-f1", nome: "Rachel Green",           cargo: "Personagem Feminino", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Rachel+Green&background=E91E63&color=fff&bold=true" },
    { id: "fr-f2", nome: "Monica Geller",          cargo: "Personagem Feminino", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Monica+Geller&background=E91E63&color=fff&bold=true" },
    { id: "fr-f3", nome: "Phoebe Buffay",          cargo: "Personagem Feminino", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Phoebe+Buffay&background=E91E63&color=fff&bold=true" },
    { id: "fr-m1", nome: "Ross Geller",            cargo: "Personagem Masculino", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Ross+Geller&background=3F51B5&color=fff&bold=true" },
    { id: "fr-m2", nome: "Chandler Bing",          cargo: "Personagem Masculino", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Chandler+Bing&background=3F51B5&color=fff&bold=true" },
    { id: "fr-m3", nome: "Joey Tribbiani",         cargo: "Personagem Masculino", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Joey+Tribbiani&background=3F51B5&color=fff&bold=true" },
    { id: "fr-p1", nome: "Marcel (macaco)",        cargo: "Melhor Pet", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Marcel&background=9E9E9E&color=fff&bold=true" },
    { id: "fr-p2", nome: "Chick Jr. (pintinho)",   cargo: "Melhor Pet", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Chick+Jr&background=9E9E9E&color=fff&bold=true" },
    { id: "fr-p3", nome: "Duck Jr. (pato)",        cargo: "Melhor Pet", setor: "Friends", foto: "https://ui-avatars.com/api/?name=Duck+Jr&background=9E9E9E&color=fff&bold=true" },

    // ============ BROOKLYN NINE-NINE ============
    { id: "b99-f1", nome: "Amy Santiago",          cargo: "Personagem Feminino", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Amy+Santiago&background=E91E63&color=fff&bold=true" },
    { id: "b99-f2", nome: "Rosa Diaz",             cargo: "Personagem Feminino", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Rosa+Diaz&background=E91E63&color=fff&bold=true" },
    { id: "b99-f3", nome: "Gina Linetti",          cargo: "Personagem Feminino", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Gina+Linetti&background=E91E63&color=fff&bold=true" },
    { id: "b99-m1", nome: "Jake Peralta",          cargo: "Personagem Masculino", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Jake+Peralta&background=3F51B5&color=fff&bold=true" },
    { id: "b99-m2", nome: "Raymond Holt",          cargo: "Personagem Masculino", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Raymond+Holt&background=3F51B5&color=fff&bold=true" },
    { id: "b99-m3", nome: "Terry Jeffords",        cargo: "Personagem Masculino", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Terry+Jeffords&background=3F51B5&color=fff&bold=true" },
    { id: "b99-p1", nome: "Cheddar (cão)",         cargo: "Melhor Pet", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Cheddar&background=9E9E9E&color=fff&bold=true" },
    { id: "b99-p2", nome: "Arlo (cão)",            cargo: "Melhor Pet", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Arlo&background=9E9E9E&color=fff&bold=true" },
    { id: "b99-p3", nome: "Kelly (cão)",           cargo: "Melhor Pet", setor: "Brooklyn Nine-Nine", foto: "https://ui-avatars.com/api/?name=Kelly&background=9E9E9E&color=fff&bold=true" },

    // ============ STRANGER THINGS ============
    { id: "st-f1", nome: "Eleven",                 cargo: "Personagem Feminino", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Eleven&background=E91E63&color=fff&bold=true" },
    { id: "st-f2", nome: "Max Mayfield",           cargo: "Personagem Feminino", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Max+Mayfield&background=E91E63&color=fff&bold=true" },
    { id: "st-f3", nome: "Nancy Wheeler",          cargo: "Personagem Feminino", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Nancy+Wheeler&background=E91E63&color=fff&bold=true" },
    { id: "st-m1", nome: "Mike Wheeler",           cargo: "Personagem Masculino", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Mike+Wheeler&background=3F51B5&color=fff&bold=true" },
    { id: "st-m2", nome: "Dustin Henderson",       cargo: "Personagem Masculino", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Dustin+Henderson&background=3F51B5&color=fff&bold=true" },
    { id: "st-m3", nome: "Steve Harrington",       cargo: "Personagem Masculino", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Steve+Harrington&background=3F51B5&color=fff&bold=true" },
    { id: "st-p1", nome: "Mews (gato)",            cargo: "Melhor Pet", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Mews&background=9E9E9E&color=fff&bold=true" },
    { id: "st-p2", nome: "Dart (Demodog)",         cargo: "Melhor Pet", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Dart&background=9E9E9E&color=fff&bold=true" },
    { id: "st-p3", nome: "Tews (gato)",            cargo: "Melhor Pet", setor: "Stranger Things", foto: "https://ui-avatars.com/api/?name=Tews&background=9E9E9E&color=fff&bold=true" }
];

let eleitorAtual = { nome: '', email: '' };
const ordemCargos = ["Personagem Feminino", "Personagem Masculino", "Melhor Pet"];
let etapaAtual = 0;

// Função auxiliar para procurar a foto do candidato pelo nome
function getFotoCandidato(nomeCand) {
    const cand = candidatosData.find(c => c.nome === nomeCand);
    return cand ? cand.foto : 'https://via.placeholder.com/90';
}

// LOGIN E VALIDAÇÃO NO SUPABASE
document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nomeDigitado = document.getElementById('nome-login').value.trim();
    const emailDigitado = document.getElementById('email-login').value.trim().toLowerCase();

    if (!emailDigitado.includes('@')) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }

    const btnLogin = document.getElementById('btn-login');
    btnLogin.innerText = "Verificando...";
    btnLogin.disabled = true;

    try {
        // Verifica no banco de dados se este email já votou
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
        btnLogin.innerText = "Entrar";
        btnLogin.disabled = false;
    }
});

// RENDERIZAR CARTÕES DE VOTAÇÃO
function renderizarCandidatos() {
    const container = document.getElementById('secoes-votacao');
    const agrupado = candidatosData.reduce((acc, candidato) => {
        if (!acc[candidato.cargo]) acc[candidato.cargo] = {};
        if (!acc[candidato.cargo][candidato.setor]) acc[candidato.cargo][candidato.setor] = [];
        acc[candidato.cargo][candidato.setor].push(candidato);
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
            for (const setor in agrupado[cargo]) {
                html += `<h3>${setor}</h3><div class="grid-candidatos">`;
                agrupado[cargo][setor].forEach(cand => {
                    const nameAttr = cargo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
                    html += `
                        <label>
                            <input type="radio" name="${nameAttr}" value="${cand.nome}">
                            <div class="card-candidato">
                                <img src="${cand.foto}" alt="${cand.nome}">
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
renderizarCandidatos();

// CONTROLE DA BARRA E BOTÕES WIZARD
function atualizarInterfaceNavegacao() {
    const progresso = ((etapaAtual + 1) / ordemCargos.length) * 100;
    document.getElementById('progresso-barra').style.width = `${progresso}%`;
    document.getElementById('progresso-texto').innerText = `Passo ${etapaAtual + 1} de ${ordemCargos.length}: ${ordemCargos[etapaAtual]}`;

    document.getElementById('btn-anterior').style.display = etapaAtual === 0 ? 'none' : 'block';
    
    if (etapaAtual === ordemCargos.length - 1) {
        document.getElementById('btn-proximo').style.display = 'none';
        document.getElementById('btn-revisar').style.display = 'block';
    } else {
        document.getElementById('btn-proximo').style.display = 'block';
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

// BOTÃO "REVISAR VOTOS"
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

// BOTÃO "VOLTAR PARA EDIÇÃO"
document.getElementById('btn-voltar-edicao').addEventListener('click', () => {
    document.getElementById('resumo-section').style.display = 'none';
    document.getElementById('votacao-section').style.display = 'block';
});

// ENVIO FINAL
document.getElementById('btn-confirmar-final').addEventListener('click', async function() {
    const votosParaEnvio = {
        personagem_feminino:  document.querySelector('input[name="personagem_feminino"]:checked').value,
        personagem_masculino: document.querySelector('input[name="personagem_masculino"]:checked').value,
        melhor_pet:           document.querySelector('input[name="melhor_pet"]:checked').value
    };

    this.innerText = "Enviando...";
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
            this.innerText = "Confirmar e Enviar";
            this.disabled = false;
            document.getElementById('btn-voltar-edicao').style.display = 'block';
        }
    } catch (erro) {
        alert("Erro de comunicação com o servidor.");
        this.innerText = "Confirmar e Enviar";
        this.disabled = false;
        document.getElementById('btn-voltar-edicao').style.display = 'block';
    }
});

// PREENCHER RESUMO
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

// MOSTRAR TELA DE RECIBO PARA QUEM JÁ VOTOU
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