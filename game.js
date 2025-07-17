document.addEventListener('DOMContentLoaded', function() {

  let gameRunning = false;
  let score = 0;
  let levelElement = document.getElementById('level');
let pauseElement = document.getElementById('pauseButton');

  function updateLevel(newLevel) {
    level = newLevel;
    levelElement.innerText = "Level: " + level;
  }

  // Toggle game pause/resume state
function togglePause() {
  gameRunning = !gameRunning;
  if (gameRunning) {
    pauseElement.innerText = "Pause";
    update();
  } else {
    pauseElement.innerText = "Resume";
  }
}

// Function to set a cookie
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function beep(freq, duration) {
  if (typeof AudioContext === 'undefined') return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = freq;
  osc.type = 'square';
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  setTimeout(() => { osc.stop(); ctx.close(); }, duration);
}

  if (typeof window !== 'undefined') {
    window.setCookie = setCookie;
    window.getCookie = getCookie;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setCookie, getCookie };
  }

// High score helpers using localStorage
function saveHighScore(email) {
  var key = 'highscore_' + email;
  var highScore = localStorage.getItem(key);
  if (highScore === null || score > parseInt(highScore, 10)) {
    localStorage.setItem(key, score);
  }
}

function getHighScore(email) {
  return localStorage.getItem('highscore_' + email);
}


  
function resetGame() {
  // Reset necessary game variables to their initial state
  console.log("reset() function called");
  gameOver = true
  score = 0;
  updateScore(score);
  level = 1;
  updateLevel(level);
  linesClearedTotal = 0;
  dropInterval = baseDropInterval;

  // Hide the game over screen and overlay
  gameOverElement.style.display = 'none';
  document.getElementById('overlay').style.display = 'none';

  // Call the startGame function to reinitialize the game
  startGame();
}

function newGame() {
  // Reset necessary game variables to their initial state
  console.log("newGame() function called");
  reset();
  score = 0;
  updateScore(score);
  level = 1;
  updateLevel(level);
  linesClearedTotal = 0;
  dropInterval = baseDropInterval;
  gameSpeed = 1;
  levelUp(0);
  var email = document.getElementById('email').value;
  updateHighScoreDisplay(email);

  // Hide the game over screen and overlay
  gameOverElement.style.display = 'none';
  document.getElementById('overlay').style.display = 'none';

  // Call the startGame function to reinitialize the game
  startGame();
}

const gameOverElement = document.getElementById('gameOver');
const blurElement = document.getElementById('overlay');

let dropCounter = 0;
let dropInterval = 1000; // In milliseconds

let level = 1;
let baseDropInterval = 1000; // In milliseconds
let isHardMode = false;

let linesClearedTotal = 0;

let gameSpeed = 1;

function levelUp(linesCleared) {
  linesClearedTotal += linesCleared;
  if (linesClearedTotal >= level * 10) {
    level++;
    gameSpeed = level;
    dropInterval = baseDropInterval / gameSpeed;
    updateLevel(level);
  }
}


const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const blockSize = 32;

const tetrominoColors = [
    '#00FFFF', // cyan
    '#00b3b3', // darker cyan
    '#FF00FF', // purple
    '#ff00bf', // pink
    '#b30086', // dark purple
    '#0000FF', // blue
    '#ffcc00'  // yellow
  ];

function randomTetromino() {
  const randomIndex = Math.floor(Math.random() * tetrominoes.length);
  const randomPiece = tetrominoes[randomIndex];
  return {
    shape: [...randomPiece[Math.floor(Math.random() * randomPiece.length)]],
    color: tetrominoColors[randomIndex]
  };
}

const tetrominoes = [
  [
    ['0110',
      '0110'
    ]
  ],
  [
    ['0010',
      '0010',
      '0010',
      '0010'
    ],
    ['0000',
      '1111',
      '0000',
      '0000'
    ]
  ],
  [
    ['0100',
      '0110',
      '0010'
    ],
    ['0110',
      '0100',
      '0100'
    ],
    ['0010',
      '0110',
      '0100'
    ],
    ['0100',
      '0100',
      '0110'
    ]
  ],
  [
    ['0010',
      '0110',
      '0100'
    ],
    ['0110',
      '0010',
      '0010'
    ]
  ],
  [
    ['0100',
      '0110',
      '0010'
    ],
    ['0110',
      '0100',
      '0100'
    ]
  ],
  [
    ['0100',
      '0110',
      '0100'
    ]
  ]
];


let piece = {
  x: 0,
  y: 0,
  shape: null,
  color: '#fff'
};
let nextPiece = randomTetromino();
let holdPiece = null;
let holdUsed = false;

let gameOver = false;


function reset() {
  piece = nextPiece;
  piece.y = 0;
  piece.x = Math.floor(canvas.width / (2 * blockSize)) - 1;
  nextPiece = randomTetromino();
  holdUsed = false;
  drawNextPiece();
}



const board = new Array(Math.floor(canvas.height / blockSize)).fill(null)
  .map(() => new Array(Math.floor(canvas.width / blockSize)).fill(0));

function collide() {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] === '1') {
        let newX = piece.x + x;
        let newY = piece.y + y;

        if (newX < 0 || newX >= canvas.width / blockSize || newY < 0 || newY >= canvas.height / blockSize) {
          return true;
        }
        if (board[newY][newX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge() {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] === '1') {
        board[piece.y + y][piece.x + x] = piece.color;
      }
    }
  }
}


function rotate() {
  const newShape = [];
  for (let x = 0; x < piece.shape[0].length; x++) {
    newShape.push([]);
    for (let y = piece.shape.length - 1; y >= 0; y--) {
      newShape[x].push(piece.shape[y][x]);
    }
  }
  piece.shape = newShape;
  if (collide()) {
    piece.shape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i])).reverse();
  }
  beep(600, 80);
}

function move(dir) {
  piece.x += dir;
  if (collide()) {
    piece.x -= dir;
  }
}

function holdCurrentPiece() {
  if (holdUsed) return;
  if (!holdPiece) {
    holdPiece = {shape: piece.shape, color: piece.color};
    reset();
  } else {
    let temp = {shape: piece.shape, color: piece.color};
    piece.shape = holdPiece.shape;
    piece.color = holdPiece.color;
    holdPiece = temp;
    piece.x = Math.floor(canvas.width / (2 * blockSize)) - 1;
    piece.y = 0;
    drawNextPiece();
  }
  holdUsed = true;
  drawNextPiece();
}

function clearRows() {
  let linesCleared = 0;
  const boardWidth = board[0].length;

  for (let y = board.length - 1; y >= 0;) {
    let isRowComplete = true;

    for (let x = 0; x < boardWidth; x++) {
      if (board[y][x] === 0) {
        isRowComplete = false;
        break;
      }
    }

    if (isRowComplete) {
      board.splice(y, 1);
      board.unshift(new Array(boardWidth).fill(0));
      linesCleared++;
    } else {
      y--; // Move to the next row only if the current row is not complete
    }
  }

  if (linesCleared > 0) {
    const lineScores = [40, 100, 300, 1200];
    score += lineScores[linesCleared - 1] * level;
    levelUp(linesCleared);
    beep(400, 100);
  }
}


let scoreElement = document.getElementById('score');
let highScoreElement = document.getElementById('highScore');

function updateScore(newScore) {
  score = newScore;
  scoreElement.innerText = "Score: " + score + " | Level: " + level;
}

function updateHighScoreDisplay(email) {
  if(!email) return;
  var hs = getHighScore(email);
  if (hs === null) hs = 0;
  highScoreElement.innerText = "High Score: " + hs;
}


function drop() {
  piece.y++;
  if (collide()) {
    piece.y--;
    merge();
    clearRows(); // Call clearRows() here
    reset();
    if (collide()) {
      gameOver = true;
      board.forEach(row => row.fill(0));
    }
  }
  dropCounter = 0;
}


function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}

function drawPieceToCanvas(pieceObj, canvasId) {
  const cvs = document.getElementById(canvasId);
  if(!cvs) return;
  const c = cvs.getContext('2d');
  c.clearRect(0,0,cvs.width,cvs.height);
  const offX = Math.floor((cvs.width / blockSize - pieceObj.shape[0].length)/2);
  const offY = Math.floor((cvs.height / blockSize - pieceObj.shape.length)/2);
  for(let y=0;y<pieceObj.shape.length;y++){
    for(let x=0;x<pieceObj.shape[y].length;x++){
      if(pieceObj.shape[y][x] !== '0'){
        c.fillStyle = pieceObj.color;
        c.fillRect((x+offX)*blockSize,(y+offY)*blockSize,blockSize,blockSize);
        c.strokeStyle='black';
        c.strokeRect((x+offX)*blockSize,(y+offY)*blockSize,blockSize,blockSize);
      }
    }
  }
}

function drawNextPiece(){
  drawPieceToCanvas(nextPiece,'nextPieceCanvas');
  if(holdPiece){
    drawPieceToCanvas(holdPiece,'holdPieceCanvas');
  } else {
    const cvs = document.getElementById('holdPieceCanvas');
    if(cvs){
      const ctxh = cvs.getContext('2d');
      ctxh.clearRect(0,0,cvs.width,cvs.height);
    }
  }
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the static blocks on the board
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] !== 0) {
        drawBlock(x, y, board[y][x]);
      }
    }
  }

  // Draw the current tetromino
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== '0') {
        drawBlock(piece.x + x, piece.y + y, piece.color);
      }
    }
  }

  // Update and display the score
  scoreElement.innerHTML = `Score: ${score}`;
}


function gameLoop() {
  draw();
  drop();
  requestAnimationFrame(gameLoop);
  gameOverAnimation();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    rotate();
  } else if (e.key === 'ArrowRight') {
    move(1);
  } else if (e.key === 'ArrowLeft') {
    move(-1);
  } else if (e.key === 'ArrowDown') {
    drop();
  } else if (e.key === 'Shift') {
    holdCurrentPiece();
  }
});


let animationFrame;

function gameOverAnimation() {
  if (gameOver) {
    let rowsCleared = 0;
    for (let y = board.length - 1; y >= 0; y--) {
      if (rowsCleared < board[y].length) {
        board[y].fill(0);
        rowsCleared++;
      } else {
        break;
      }
      draw();
    }
    setTimeout(() => {
      gameRunning = false;
      gameOverElement.style.display = 'block';
      document.getElementById('overlay').style.display = 'block'; // Show the overlay
      beep(200,200);

      // Save the high score when the game is over
      var email = document.getElementById('email').value; // Assuming you have an input field with id 'email'
      saveHighScore(email, score);
      updateHighScoreDisplay(email);
       
    }, 1000);
  } else {
    cancelAnimationFrame(animationFrame);
  }
}


function startGame() {
  console.log("startGame() function called");

  if (gameRunning) return;

  gameOverElement.style.display = 'none';
  document.getElementById('startScreen').style.display = 'none'; // Hide the start screen
  gameRunning = true;
  gameOver = false;
  board.forEach(row => row.fill(0));
  score = 0;
  updateScore(score);
  var email = document.getElementById('email').value;
  updateHighScoreDisplay(email);
  reset();
  update();
}



let lastTime = 0;


function update(time = 0) {
  if (gameOver) {
    gameOverAnimation();
    return;
  }

  if (gameRunning) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      drop();
      dropCounter = 0;
    }
  }

  draw();
  requestAnimationFrame(update);
}


document.getElementById('startButton').addEventListener('click', startGame);
updateLevel(level);
document.getElementById('restartButton').addEventListener('click', resetGame);
document.getElementById('newGame').addEventListener('click', newGame);
updateLevel(level);
document.getElementById('leftButton').addEventListener('touchstart', () => move(-1));
document.getElementById('leftButton').addEventListener('click', () => move(-1));
document.getElementById('rightButton').addEventListener('touchstart', () => move(1));
document.getElementById('rightButton').addEventListener('click', () => move(1));
document.getElementById('rotateButton').addEventListener('touchstart', () => rotate());
document.getElementById('rotateButton').addEventListener('click', () => rotate());
document.getElementById('holdButton').addEventListener('click', holdCurrentPiece);
document.getElementById('holdButton').addEventListener('touchstart', holdCurrentPiece);
document.getElementById('pauseButton').addEventListener('click', togglePause);
document.getElementById('pause').addEventListener('click', togglePause);
document.getElementById('hardMode').addEventListener('click', function(){
  isHardMode = !isHardMode;
  baseDropInterval = isHardMode ? 500 : 1000;
  dropInterval = baseDropInterval;
  this.innerText = isHardMode ? 'Normal Mode' : 'Hard Mode';
});
document.getElementById('submitEmail').addEventListener('click', function() {
  var email = document.getElementById('email').value;
  saveHighScore(email);
  updateHighScoreDisplay(email);
});


  


reset();
update();
drawNextPiece();
 });
