let carro;
let pontos = 0;
let obstaculos = [];
let edificios = []; // Array para armazenar os dados dos edifícios
let gameOverFlag = false; // Flag para controlar o estado do jogo
let gameStarted = false; // Flag para controlar se o jogo começou
let gameWonFlag = false; // Flag para controlar o estado de vitória
const winXPosition = 150; // Posição X que o carro deve atingir para vencer (onde o cavalo está)

function setup() {
  createCanvas(1000, 700);
  carro = new Carro();

  // Gera obstáculos (no campo)
  for (let i = 0; i < 5; i++) {
    obstaculos.push(new Obstaculo());
  }

  // Gera os edifícios da cidade
  gerarEdificios();
}

function draw() {
  if (!gameStarted) {
    // Tela inicial
    background(0, 150, 0); // Fundo verde
    fill(255); // Texto branco
    textSize(40);
    textAlign(CENTER, CENTER);
    text("Clique na tela para começar o jogo", width / 2, height / 2 - 40);
    text("e tente desviar os obstáculos!", width / 2, height / 2 + 20);
  } else if (!gameOverFlag && !gameWonFlag) { // Só executa a lógica do jogo se não for Game Over NEM Vitória
    // --- Desenho do Cenário ---
    // Céu da fazenda (esquerdo) - azul claro
    fill(135, 206, 250); // Cor do céu da fazenda
    rect(0, 0, width / 2, height / 2);

    // Céu da cidade (direito) - azul claro (Este é o céu onde os prédios se alinham)
    fill(135, 206, 235); // Cor do céu da cidade - alterado para azul claro
    rect(width / 2, 0, width / 2, height / 2);

    // Grama (parte de cima do campo)
    fill(144, 238, 144);
    rect(0, height / 2, width / 2, height / 4);

    // Estrada de terra (parte de baixo do campo) - Agora a estrada do campo
    fill(194, 178, 128); // Cor de terra
    rect(0, height / 4 * 3, width / 2, height / 4);

    // Asfalto da cidade (agora a estrada da cidade)
    fill(105, 105, 105); // Cor de asfalto (DarkGray)
    rect(width / 2, height / 2, width / 2, height / 2);

    // Faixas tracejadas amarelas na estrada da cidade
    stroke(255, 255, 0); // Amarelo
    strokeWeight(3);
    for (let i = height / 2 + 10; i < height - 10; i += 30) {
      line(width / 2 + width / 4 - 25, i, width / 2 + width / 4 + 25, i); // Desenha no meio da cidade
    }
    noStroke(); // Reseta o estilo de linha

    // Linha divisória (cerca) - Esta é a linha que o carro pode atravessar
    stroke(0); // Cor da linha (preto)
    strokeWeight(5); // Espessura da linha
    line(width / 2, 0, width / 2, height); // Desenha a linha vertical
    noStroke(); // Reseta o stroke para outros desenhos

    textSize(50);

    // Emojis da fazenda (lado esquerdo)
    text('☀️', 100, 100);
    text('🏠', 200, height / 2 + 80); // Celeiro
    text('🌳', 290, height / 2 + 50); // Árvore
    text('🚜', 200, height / 4 * 3 + 50); // Trator na estrada
    text('🐎', 90, height / 4 * 3 + 60); // O cavalo está em X=90, Y=algum valor da fazenda
    text('🐕', 140, height / 4 * 3 + 60);
    text('🐓', 350, height / 4 * 3 + 70);

    // --- DESENHA OS EDIFÍCIOS MELHORADOS ---
    for (let i = 0; i < edificios.length; i++) {
      let edificio = edificios[i];

      // Corpo principal do prédio
      fill(edificio.cor);
      rect(edificio.x, edificio.y, edificio.largura, edificio.altura);

      // Telhado (opcional, pode ser um retângulo ou triângulo para simular profundidade)
      fill(edificio.corTelhado);
      rect(edificio.x, edificio.y - 5, edificio.largura, 5); // Telhado simples

      // Desenha janelas
      for (let j = 0; j < edificio.janelas.length; j++) {
        let janela = edificio.janelas[j];
        fill(janela.cor);
        rect(janela.x, janela.y, janela.largura, janela.altura);
      }
    }

    // --- NOVO CÓDIGO DO SOL DA CIDADE ---
    let sunX = 800;
    let sunY = 160;
    let sunSize = 70; // Tamanho do corpo do sol
    let rayLength = 30; // Comprimento dos raios do sol

    // Desenha o corpo do sol
    fill(255, 255, 0); // Amarelo brilhante
    noStroke();
    ellipse(sunX, sunY, sunSize, sunSize);

    // Desenha os raios do sol
    stroke(255, 255, 0); // Raios amarelos
    strokeWeight(3); // Espessura dos raios
    for (let i = 0; i < 360; i += 30) { // Desenha linhas a cada 30 graus
      let angle = radians(i);
      let x1 = sunX + cos(angle) * (sunSize / 2);
      let y1 = sunY + sin(angle) * (sunSize / 2);
      let x2 = sunX + cos(angle) * (sunSize / 2 + rayLength);
      let y2 = sunY + sin(angle) * (sunSize / 2 + rayLength);
      line(x1, y1, x2, y2);
    }
    noStroke(); // Reseta o stroke

    // Emojis da cidade (lado direito) - Mantidos outros emojis
    textSize(50);
    text('🚚', 800, 570);
    text('🚏', 700, 460);


    // --- Lógica e Desenho do Jogo ---
    // Exibe o carro
    carro.display();
    carro.move();

    // Exibe obstáculos e verifica colisões
    for (let i = 0; i < obstaculos.length; i++) {
      obstaculos[i].display();
      obstaculos[i].move();
      if (carro.collide(obstaculos[i])) {
        gameOver(); // Chama a função gameOver ao colidir
      }
    }

    // Exibe a pontuação
    textSize(20);
    fill(0); // Cor para o texto da pontuação
    text("Pontos: " + pontos, 20, 30); // Exibe a pontuação na tela

    // --- NOVA CONDIÇÃO DE VITÓRIA ---
    // Se o carro passar da posição X definida para a vitória (lado da fazenda)
    if (carro.x <= winXPosition) {
      gameWon();
    }

  } else if (gameOverFlag) {
    // Se for Game Over, exibe a tela de Game Over
    displayGameOverScreen();
  } else if (gameWonFlag) { // Se o jogo for vencido, exibe a tela de vitória
    displayWinScreen();
  }
}

// --- Funções de Cenário ---
function gerarEdificios() {
  edificios = []; // Limpa qualquer prédio anterior
  const numBuildings = 6; // Número de prédios que queremos gerar
  const buildingBaseY = height / 2; // Onde a base dos prédios começa

  const buildingColors = [
    color(120, 120, 120), // Cinza médio
    color(90, 100, 110), // Cinza azulado
    color(150, 140, 130), // Marrom acinzentado
    color(80, 80, 90), // Cinza escuro
    color(110, 100, 90) // Cinza amarronzado
  ];

  const windowLitColor = color(255, 230, 100, 200); // Amarelo claro para janelas acesas
  const windowDarkColor = color(50, 80, 100, 180); // Azul escuro para janelas apagadas

  // Para garantir espaçamento, vamos gerar os prédios da esquerda para a direita
  // na área da cidade (width / 2 até width)
  let currentX = width / 2 + 20; // Começa um pouco depois da linha divisória

  for (let i = 0; i < numBuildings; i++) {
    let largura = random(60, 100); // Largura variada
    let altura = random(100, 300); // Altura variada

    // Calcula a próxima posição X para garantir espaçamento
    // Garante que o prédio comece após o último e não ultrapasse o limite da tela
    let x = random(currentX, currentX + largura + 50); // Adiciona um espaçamento mínimo aleatório (50 pixels)
    x = constrain(x, width / 2 + 10, width - largura - 10); // Limita dentro da área da cidade

    // Se o próximo prédio for ultrapassar o limite, pare de gerar
    if (x + largura > width - 10) {
      break;
    }

    let corCorpo = random(buildingColors);
    let corTelhado = lerpColor(corCorpo, color(50, 50, 50), 0.5); // Telhado um pouco mais escuro

    let novoEdificio = {
      x: x,
      y: buildingBaseY - altura, // Posiciona a base do prédio na linha do horizonte
      largura: largura,
      altura: altura,
      cor: corCorpo,
      corTelhado: corTelhado,
      janelas: []
    };

    // Gerar janelas para o prédio
    let numCols = floor(largura / 25); // Número de colunas de janela
    let numRows = floor(altura / 30); // Número de linhas de janela

    for (let col = 0; col < numCols; col++) {
      for (let row = 0; row < numRows; row++) {
        let janelaLargura = random(10, 15);
        let janelaAltura = random(15, 20);
        let janelaX = novoEdificio.x + 5 + col * (largura / numCols);
        let janelaY = novoEdificio.y + 10 + row * (altura / numRows);

        let janelaCor = random() < 0.6 ? windowDarkColor : windowLitColor; // 60% apagada, 40% acesa

        if (janelaX + janelaLargura < novoEdificio.x + largura - 5 &&
          janelaY + janelaAltura < novoEdificio.y + altura - 5) { // Evita janelas fora do prédio
          novoEdificio.janelas.push({
            x: janelaX,
            y: janelaY,
            largura: janelaLargura,
            altura: janelaAltura,
            cor: janelaCor
          });
        }
      }
    }
    edificios.push(novoEdificio);

    // Atualiza currentX para o início do próximo prédio, incluindo um espaçamento
    currentX = novoEdificio.x + novoEdificio.largura + random(30, 80); // Espaçamento variável
  }
}

// --- Funções de Estado do Jogo ---
function gameOver() {
  gameOverFlag = true;
}

function gameWon() {
  gameWonFlag = true;
}

function displayGameOverScreen() {
  background(0, 0, 0, 200); // Fundo semi-transparente preto
  fill(255, 0, 0); // Texto vermelho
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER!", width / 2, height / 2 - 40);

  fill(255); // Texto branco
  textSize(32);
  text("Pontos Finais: " + pontos, width / 2, height / 2 + 20);
  text("Pressione 'R' para Reiniciar", width / 2, height / 2 + 70);
}

function displayWinScreen() {
  background(0, 200, 0, 200); // Fundo semi-transparente verde
  fill(255, 255, 0); // Texto amarelo
  textSize(64);
  textAlign(CENTER, CENTER);
  text("VOCÊ VENCEU!", width / 2, height / 2 - 40);

  fill(255); // Texto branco
  textSize(32);
  text("Pontos: " + pontos, width / 2, height / 2 + 20); // Ainda mostra os pontos conquistados
  text("Pressione 'R' para Reiniciar", width / 2, height / 2 + 70);
}


// --- Funções de Interação ---
function keyPressed() {
  // Reinicia tanto para Game Over quanto para Vitória
  if ((gameOverFlag || gameWonFlag) && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
    resetGame(); // Reinicia o jogo para garantir que os obstáculos e a pontuação estejam no início
  }
}

function resetGame() {
  pontos = 0;
  carro.reset();
  obstaculos = []; // Limpa os obstáculos existentes
  for (let i = 0; i < 5; i++) { // Gera novos obstáculos
    obstaculos.push(new Obstaculo());
  }
  gerarEdificios(); // Regenera os prédios para nova variedade
  gameOverFlag = false; // Reseta a flag de Game Over
  gameWonFlag = false; // Reseta a flag de vitória
}

// --- Classes do Jogo ---
class Carro {
  constructor() {
    this.x = width * 0.75; // Posição inicial no meio da estrada da cidade (75% da largura total)
    this.y = height - 60; // Posição do carro mais acima no asfalto
    this.width = 40;
    this.height = 20;
  }

  display() {
    textSize(40);
    text('🚗', this.x - 20, this.y); // Emoji de carro
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 5; // Movimenta para a esquerda
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += 5; // Movimenta para a direita
    }
    // Garante que o carro não saia da tela
    this.x = constrain(this.x, 0 + this.width / 2, width - this.width / 2);
  }

  collide(obstaculo) {
    // Aumenta a área de colisão para ser mais fácil de detectar
    let distancia = dist(this.x, this.y, obstaculo.x, obstaculo.y);
    return distancia < 40; // Aumentado de 30 para 40
  }

  reset() {
    this.x = width * 0.75; // Reseta a posição inicial para a cidade
    this.y = height - 60;
  }
}

class Obstaculo {
  constructor() {
    // Obstáculos gerados APENAS no lado esquerdo (campo)
    this.x = random(50, width / 2 - 50); // Garante que fiquem dentro do campo
    this.y = random(-1000, -500); // Posição inicial fora da tela, vindo de cima
    this.size = 30;
    this.speed = 10; // Velocidade inicial ajustada
  }

  display() {
    textSize(30);
    text('⛔', this.x, this.y); // Emoji de obstáculo
  }

  move() {
    this.y += this.speed;
    // Aumenta a velocidade gradualmente
    this.speed = 15;

    if (this.y > height) {
      this.y = random(-1000, -500);
      // Reposiciona x APENAS no lado esquerdo (campo)
      this.x = random(50, width / 2 - 50);
      pontos++; // Aumenta os pontos quando o obstáculo sai da tela
    }
  }

  reset() {
    this.y = random(-1000, -500);
    // Reseta x para o lado esquerdo (campo)
    this.x = random(50, width / 2 - 50);
  }
}