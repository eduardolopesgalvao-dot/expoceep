// ==================== DADOS DO USUÁRIO ====================
let currentUser = { username: "Jogador", avatar: "👾", totalScore: 0 };

// ==================== NAVEGAÇÃO COM TRANSIÇÃO ====================
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const targetScreen = document.getElementById(screenId);
    targetScreen.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${screenId}`).classList.add('active');
}

// ==================== USUÁRIO ====================
function loadUser() {
    const saved = localStorage.getItem('gamehub_user');
    if (saved) currentUser = JSON.parse(saved);
    document.getElementById('username').textContent = currentUser.username;
    document.getElementById('avatar').textContent = currentUser.avatar;
}

function logout() {
    if (confirm("Sair da conta?")) {
        localStorage.clear();
        location.reload();
    }
}

// ==================== TIC TAC TOE ====================
let tttBoard = Array(9).fill('');
let currentPlayer = 'X';
let scoreX = 0, scoreO = 0;
let gameActive = true;
const boardEl = document.getElementById('board');

function createBoard() {
    boardEl.innerHTML = '';
    tttBoard.forEach((_, i) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', cellClick);
        boardEl.appendChild(cell);
    });
}

function cellClick(e) {
    const idx = e.target.dataset.index;
    if (tttBoard[idx] || !gameActive) return;
    tttBoard[idx] = currentPlayer;
    e.target.textContent = currentPlayer;

    if (checkWin()) {
        const pts = currentPlayer === 'X' ? 50 : 40;
        currentUser.totalScore += pts;
        scoreX++;
        updateTTTScores();
        saveScore('Tic Tac Toe', pts);
        document.getElementById('ttt-status').textContent = `${currentPlayer} VENCEU! (+${pts}pts)`;
        gameActive = false;
    } else if (tttBoard.every(c => c)) {
        document.getElementById('ttt-status').textContent = 'EMPATE!';
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        document.getElementById('ttt-status').textContent = `Vez do ${currentPlayer}`;
    }
}

function checkWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(combo => combo.every(i => tttBoard[i] === currentPlayer));
}

function updateTTTScores() {
    document.getElementById('scoreX').textContent = scoreX;
    document.getElementById('scoreO').textContent = scoreO;
}

function resetTTT() {
    tttBoard = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    document.getElementById('ttt-status').textContent = 'Vez do X';
    createBoard();
}

// ==================== PEDRA PAPEL TESOURA (Corrigido) ====================
let rpsWins = 0, rpsLosses = 0, rpsDraws = 0;

document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => playRPS(btn.dataset.choice));
});

function playRPS(player) {
    const choices = ['rock','paper','scissors'];
    const pc = choices[Math.floor(Math.random()*3)];
    let pts = 0, result = '';

    if (player === pc) {
        result = 'EMPATE!'; rpsDraws++;
    } else if (
        (player === 'rock' && pc === 'scissors') ||
        (player === 'paper' && pc === 'rock') ||
        (player === 'scissors' && pc === 'paper')
    ) {
        result = 'VOCÊ VENCEU!'; rpsWins++; pts = 30;
    } else {
        result = 'VOCÊ PERDEU!'; rpsLosses++;
    }

    if (pts > 0) {
        currentUser.totalScore += pts;
        saveScore('Pedra Papel Tesoura', pts);
    }

    document.getElementById('rps-result').innerHTML = `
        Você: ${getEmoji(player)}<br>
        PC: ${getEmoji(pc)}<br>
        <strong>${result} ${pts ? `(+${pts}pts)` : ''}</strong>`;
    updateRPSScores();
}

function getEmoji(c) {
    if (c === 'rock') return '🪨';
    if (c === 'paper') return '📄';
    return '✂️';
}

function updateRPSScores() {
    document.getElementById('rps-wins').textContent = rpsWins;
    document.getElementById('rps-losses').textContent = rpsLosses;
    document.getElementById('rps-draws').textContent = rpsDraws;
}

function resetRPS() {
    rpsWins = rpsLosses = rpsDraws = 0;
    updateRPSScores();
    document.getElementById('rps-result').textContent = '';
}

// ==================== SNAKE (WASD + Setas) ====================
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const grid = 20;
let snake = [], dx = 1, dy = 0, food = {}, scoreSnake = 0;
let snakeInterval = null;
let gameRunning = false;

function initSnake() {
    snake = [{x:10,y:10}, {x:9,y:10}, {x:8,y:10}];
    dx = 1; dy = 0;
    scoreSnake = 0;
    document.getElementById('snake-score').textContent = scoreSnake;
    generateFood();
    gameRunning = true;
}

function generateFood() {
    do {
        food = { x: Math.floor(Math.random() * (canvas.width/grid)), y: Math.floor(Math.random() * (canvas.height/grid)) };
    } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ffcc';
    snake.forEach(s => ctx.fillRect(s.x*grid, s.y*grid, grid-2, grid-2));
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(food.x*grid+2, food.y*grid+2, grid-4, grid-4);
}

function move() {
    if (!gameRunning) return;
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    if (head.x < 0 || head.x >= canvas.width/grid || head.y < 0 || head.y >= canvas.height/grid ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOverSnake();
        return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        scoreSnake += 20;
        document.getElementById('snake-score').textContent = scoreSnake;
        generateFood();
    } else {
        snake.pop();
    }
    draw();
}

function gameOverSnake() {
    gameRunning = false;
    clearInterval(snakeInterval);
    if (scoreSnake > 0) {
        currentUser.totalScore += scoreSnake;
        saveScore('Snake', scoreSnake);
    }
    document.getElementById('snake-status').innerHTML = `<strong>GAME OVER!</strong><br>Pontos: ${scoreSnake}`;
}

function startSnake() {
    if (snakeInterval) clearInterval(snakeInterval);
    initSnake();
    draw();
    document.getElementById('snake-status').textContent = 'Use WASD ou Setas';
    snakeInterval = setInterval(move, 90);
}

document.addEventListener('keydown', e => {
    if (!gameRunning) return;
    switch(e.key.toLowerCase()) {
        case 'w': case 'arrowup':    if(dy !== 1){dx=0; dy=-1;} break;
        case 's': case 'arrowdown':  if(dy !== -1){dx=0; dy=1;} break;
        case 'a': case 'arrowleft':  if(dx !== 1){dx=-1; dy=0;} break;
        case 'd': case 'arrowright': if(dx !== -1){dx=1; dy=0;} break;
    }
});

// ==================== SALVAR E ATUALIZAR ====================
function saveScore(game, points) {
    let hist = JSON.parse(localStorage.getItem('gamehub_history') || '[]');
    hist.unshift({ date: new Date().toLocaleString('pt-BR'), game, score: points });
    localStorage.setItem('gamehub_history', JSON.stringify(hist));
    updateRanking();
    updateHistory();
}

function updateRanking() {
    document.getElementById('ranking-body').innerHTML = `
        <tr><td>1º</td><td>${currentUser.username}</td><td>${currentUser.totalScore}</td></tr>`;
}

function updateHistory() {
    const hist = JSON.parse(localStorage.getItem('gamehub_history') || '[]');
    document.getElementById('history-body').innerHTML = hist.map(h => `
        <tr><td>${h.date}</td><td>${h.game}</td><td>${h.score}</td></tr>
    `).join('');
}

// ==================== INICIALIZAÇÃO ====================
window.onload = () => {
    loadUser();
    createBoard();
    updateRanking();
    updateHistory();
};