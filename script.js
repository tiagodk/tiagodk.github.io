const tabuleiro = document.getElementById("tabuleiro");
const mensagem = document.getElementById("mensagem");

let cartas = [];
let pontosAzul = 0;
let pontosVermelho = 0;
let quantidadePalavras = 16; // CORREÇÃO: valor padrão igual ao botão ativo no HTML
let mapaVisivel = false;
let jogoFinalizado = false;
let turnoAtual = "azul";
let equipeInicial = "azul";
let objetivoAzul = 0;
let objetivoVermelho = 0;

function trocarTela(id) {
    const telas = document.querySelectorAll(".tela");
    telas.forEach((tela) => {
        tela.classList.remove("ativa");
    });
    document.getElementById(id).classList.add("ativa");
}

function abrirRegras() {
    trocarTela("regras");
}

function voltarMenu() {
    trocarTela("menuInicial");
}

function abrirConfiguracoes() {
    trocarTela("configuracoes");
}

function iniciarJogo() {
    trocarTela("jogo");
    document.getElementById("mensagemInicial").innerText =
        "As equipes devem decidir quem será o Mestre.";
    criarTabuleiro();
}

function embaralhar(lista) {
    // Fisher-Yates shuffle — mais justo que sort(random)
    const arr = [...lista];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function gerarTipos() {
    let tipos = [];

    const azulComeca = Math.random() < 0.5;
    equipeInicial = azulComeca ? "azul" : "vermelho";

    let cartasAzuis;
    let cartasVermelhas;
    let cartasNeutras;

    if (quantidadePalavras === 16) {
        // CORREÇÃO: 6 + 5 + 4 + 1 = 16
        cartasAzuis = azulComeca ? 6 : 5;
        cartasVermelhas = azulComeca ? 5 : 6;
        cartasNeutras = 4;
    } else if (quantidadePalavras === 20) {
        // 7 + 6 + 6 + 1 = 20
        cartasAzuis = azulComeca ? 7 : 6;
        cartasVermelhas = azulComeca ? 6 : 7;
        cartasNeutras = 6;
    } else {
        // 9 + 8 + 7 + 1 = 25
        cartasAzuis = azulComeca ? 9 : 8;
        cartasVermelhas = azulComeca ? 8 : 9;
        cartasNeutras = 7;
    }

    objetivoAzul = cartasAzuis;
    objetivoVermelho = cartasVermelhas;

    for (let i = 0; i < cartasAzuis; i++) tipos.push("azul");
    for (let i = 0; i < cartasVermelhas; i++) tipos.push("vermelho");
    for (let i = 0; i < cartasNeutras; i++) tipos.push("neutra");
    tipos.push("assassina");

    turnoAtual = equipeInicial;

    return embaralhar(tipos);
}

function criarTabuleiro() {
    tabuleiro.innerHTML = "";

    const tipos = gerarTipos();
    cartas = [];

    const palavrasEmbaralhadas = embaralhar(palavras);

    if (quantidadePalavras === 16) {
        tabuleiro.style.gridTemplateColumns = "repeat(4, 1fr)";
    } else {
        tabuleiro.style.gridTemplateColumns = "repeat(5, 1fr)";
    }

    for (let i = 0; i < quantidadePalavras; i++) {
        const carta = {
            palavra: palavrasEmbaralhadas[i],
            tipo: tipos[i],
            revelada: false
        };

        cartas.push(carta);

        const elemento = document.createElement("div");
        elemento.classList.add("carta");
        elemento.innerText = carta.palavra;
        elemento.onclick = () => revelarCarta(i, elemento);
        tabuleiro.appendChild(elemento);
    }

    pontosAzul = 0;
    pontosVermelho = 0;

    atualizarPlacar();
    atualizarMensagemTurno();
}

function revelarCarta(index, elemento) {
    if (mapaVisivel || jogoFinalizado) return;

    const carta = cartas[index];
    if (carta.revelada) return;

    carta.revelada = true;

    if (carta.tipo === "azul") {
        elemento.classList.add("reveladaAzul");
        pontosAzul++;
        atualizarPlacar();
        if (!verificarVitoria()) {
            // Carta da equipe errada encerra o turno
            if (turnoAtual !== "azul") {
                trocarTurno();
            } else {
                atualizarMensagemTurno();
            }
        }

    } else if (carta.tipo === "vermelho") {
        elemento.classList.add("reveladaVermelho");
        pontosVermelho++;
        atualizarPlacar();
        if (!verificarVitoria()) {
            if (turnoAtual !== "vermelho") {
                trocarTurno();
            } else {
                atualizarMensagemTurno();
            }
        }

    } else if (carta.tipo === "neutra") {
        elemento.classList.add("neutra");
        trocarTurno();

    } else {
        // Carta assassina
        elemento.classList.add("assassina");
        jogoFinalizado = true;

        document.getElementById("mensagemFinal").innerHTML =
            turnoAtual === "azul"
            ? `A <span class="textoAzul">Equipe Azul</span> clicou na carta assassina.<br><br>
               Vitória da <span class="textoVermelho">Equipe Vermelha</span>!`
            : `A <span class="textoVermelho">Equipe Vermelha</span> clicou na carta assassina.<br><br>
               Vitória da <span class="textoAzul">Equipe Azul</span>!`;

        setTimeout(() => trocarTela("telaFinal"), 800);
    }
}

function atualizarPlacar() {
    document.getElementById("pontosAzul").innerText =
        pontosAzul + "/" + objetivoAzul;
    document.getElementById("pontosVermelho").innerText =
        pontosVermelho + "/" + objetivoVermelho;
}

function verificarVitoria() {
    if (pontosAzul === objetivoAzul) {
        jogoFinalizado = true;
        document.getElementById("mensagemFinal").innerHTML =
            `Vitória da <span class="textoAzul">Equipe Azul</span>!`;
        setTimeout(() => trocarTela("telaFinal"), 600);
        return true;
    }

    if (pontosVermelho === objetivoVermelho) {
        jogoFinalizado = true;
        document.getElementById("mensagemFinal").innerHTML =
            `Vitória da <span class="textoVermelho">Equipe Vermelha</span>!`;
        setTimeout(() => trocarTela("telaFinal"), 600);
        return true;
    }

    return false;
}

function mostrarMapa() {
    mapaVisivel = true;

    const elementos = document.querySelectorAll("#tabuleiro .carta");
    elementos.forEach((elemento, index) => {
        const tipo = cartas[index].tipo;
        if (tipo === "azul") elemento.classList.add("mapaAzul");
        else if (tipo === "vermelho") elemento.classList.add("mapaVermelho");
        else if (tipo === "assassina") elemento.classList.add("mapaAssassina");
    });

    document.getElementById("botaoMapa").innerText = "Esconder mapa secreto";
    mensagem.innerText = "Mapa secreto visível. Apenas o Mestre pode ver!";
}

function esconderMapa() {
    mapaVisivel = false;

    const elementos = document.querySelectorAll("#tabuleiro .carta");
    elementos.forEach((elemento) => {
        elemento.classList.remove("mapaAzul", "mapaVermelho", "mapaAssassina");
    });

    document.getElementById("botaoMapa").innerText = "Mostrar mapa secreto";
    atualizarMensagemTurno();
}

function alternarMapa() {
    if (mapaVisivel) {
        esconderMapa();
    } else {
        mostrarMapa();
    }
}

function atualizarMensagemTurno() {
    mensagem.innerText =
        "Turno da Equipe " + (turnoAtual === "azul" ? "Azul" : "Vermelha") + ".";
}

function trocarTurno() {
    turnoAtual = turnoAtual === "azul" ? "vermelho" : "azul";
    atualizarMensagemTurno();
}

function reiniciarJogo() {
    jogoFinalizado = false;
    mapaVisivel = false;
    turnoAtual = "azul";
    equipeInicial = "azul";
    pontosAzul = 0;
    pontosVermelho = 0;
    quantidadePalavras = 16;
    document.querySelectorAll(".opcao").forEach((b) => b.classList.remove("ativaOpcao"));
    const primeiroBotao = document.querySelector(".opcao");
    if (primeiroBotao) primeiroBotao.classList.add("ativaOpcao");
    voltarMenu();
}

function selecionarPalavras(valor, botao) {
    quantidadePalavras = valor;
    const botoes = botao.parentElement.querySelectorAll(".opcao");
    botoes.forEach((b) => b.classList.remove("ativaOpcao"));
    botao.classList.add("ativaOpcao");
}

function abrirTutorial() {
    trocarTela("tutorial");
}

trocarTela("menuInicial");
