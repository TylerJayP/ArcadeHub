// Rock and Roll Rhythm Game - Integrated for Arcade Hub
class RockAndRollGame {
  constructor({ container, onScoreChange, onGameEnd, username }) {
    this.container = container;
    this.onScoreChange = onScoreChange;
    this.onGameEnd = onGameEnd;
    this.username = username;
    
    // Canvas and context
    this.canvas = null;
    this.ctx = null;
    this.gameLoop = null;
    
    // Car properties
    this.car = {
      width: 40,
      height: 50,
      x: 0,
      y: 0,
      speed: 5
    };
    
    // Input state
    this.leftPressed = false;
    this.rightPressed = false;
    this.keyPressed = {};
    
    // Game settings
    this.lanes = 5;
    this.laneWidth = 0;
    this.noteColors = ['#0f0', '#f00', '#ff0', '#00f', '#fa0'];
    this.keyMap = ['1', '2', '3', '4', '5'];
    this.defaultBaselineOffset = 100;
    this.baselineOffset = this.defaultBaselineOffset;
    this.noteWidth = 0;
    this.noteHeight = 40;
    this.obstacleWidth = 40;
    this.obstacleHeight = 40;
    
    // Game state
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.noteTimer = 0;
    this.noteSpawnInterval = 30;
    this.bpm = 120;
    this.noteFallBeats = 4;
    this.obstacleSpeed = 4;
    
    // Audio and patterns
    this.currentSong = null;
    this.audio = null;
    this.notePattern = null;
    this.patternStartTime = 0;
    this.lastNoteIndex = 0;
    
    // Song library
    this.songLibrary = [
      { name: "Beginner Mode", bpm: 100, file: null },
      { name: "Normal Mode", bpm: 120, file: null },
      { name: "Hard Mode", bpm: 150, file: null },
      { name: "Expert Mode", bpm: 180, file: null }
    ];
    
    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 400;
    this.canvas.height = 600;
    this.canvas.style.border = '2px solid #00ff00';
    this.canvas.style.background = '#000011';
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Calculate lane width and car position
    this.laneWidth = this.canvas.width / this.lanes;
    this.noteWidth = this.laneWidth;
    this.car.x = this.canvas.width / 2 - this.car.width / 2;
    this.car.y = this.canvas.height - 100;
    
    this.calculateObstacleSpeed();
    
    // Add simple instructions below canvas
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      text-align: center;
      margin: 20px;
      color: #00ff00;
      font-family: 'Orbitron', monospace;
    `;
    
    instructions.innerHTML = `
      <h3>🎸 ROCK AND ROLL 🎸</h3>
      <p>Use ← → arrow keys to steer • Use number keys 1-5 to hit rhythm notes!</p>
      <p>Avoid obstacles and hit the notes perfectly to score big!</p>
    `;
    
    this.container.appendChild(instructions);
    
    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.keyDownHandler = (e) => this.handleKeyDown(e);
    this.keyUpHandler = (e) => this.handleKeyUp(e);
    
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  handleKeyDown(e) {
    if (e.key === 'ArrowLeft') this.leftPressed = true;
    if (e.key === 'ArrowRight') this.rightPressed = true;
    
    if (this.gameOver && (e.key === 'r' || e.key === 'R')) {
      this.resetGame();
      return;
    }
    
    // Handle note hits
    const keyIndex = this.keyMap.indexOf(e.key);
    if (keyIndex !== -1 && this.gameStarted) {
      this.hitNote(keyIndex);
    }
  }

  handleKeyUp(e) {
    if (e.key === 'ArrowLeft') this.leftPressed = false;
    if (e.key === 'ArrowRight') this.rightPressed = false;
  }

  calculateObstacleSpeed() {
    const beatsPerSecond = this.bpm / 60;
    const timeSeconds = this.noteFallBeats / beatsPerSecond;
    const distance = this.canvas.height - this.defaultBaselineOffset;
    this.obstacleSpeed = distance / (timeSeconds * 60); // 60fps
  }

  startGame() {
    this.gameStarted = true;
    this.gameOver = false;
    this.patternStartTime = Date.now();
    this.lastNoteIndex = 0;
    
    this.gameLoop = this.runGameLoop.bind(this);
    this.gameLoop();
  }

  resetGame() {
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.score = 0;
    this.car.x = this.canvas.width / 2 - this.car.width / 2;
    this.gameOver = false;
    this.gameStarted = false;
    this.notePattern = null;
    this.lastNoteIndex = 0;
    this.baselineOffset = this.defaultBaselineOffset;
    
    if (this.onScoreChange) {
      this.onScoreChange(this.score);
    }
  }

  update() {
    if (this.gameOver || !this.gameStarted) return;
    
    // Move car
    if (this.leftPressed && this.car.x > 0) {
      this.car.x -= this.car.speed;
    }
    if (this.rightPressed && this.car.x < this.canvas.width - this.car.width) {
      this.car.x += this.car.speed;
    }
    
    // Spawn obstacles
    this.obstacleTimer++;
    if (this.obstacleTimer > this.noteSpawnInterval) {
      this.spawnObstacles();
      this.obstacleTimer = 0;
    }
    
    // Move obstacles
    for (let i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].y += this.obstacleSpeed;
    }
    
    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(ob => 
      ob.y < this.canvas.height && (ob.type !== 'note' || !ob.hit)
    );
    
    // Check collisions
    this.checkCollisions();
    
    // Check missed notes
    this.checkMissedNotes();
    
    if (!this.gameOver) {
      this.score++;
      if (this.onScoreChange) {
        this.onScoreChange(this.score);
      }
    }
  }

  checkCollisions() {
    for (let i = 0; i < this.obstacles.length; i++) {
      const ob = this.obstacles[i];
      if (ob.type === 'indestructible' && this.checkCollision(this.car, ob)) {
        this.endGame();
      }
      if (ob.type === 'note' && !ob.hit && this.checkCollision(this.car, ob)) {
        this.endGame();
      }
    }
  }

  checkMissedNotes() {
    for (let i = 0; i < this.obstacles.length; i++) {
      const ob = this.obstacles[i];
      if (ob.type === 'note' && !ob.hit && 
          ob.y > (this.car.y - this.baselineOffset + this.noteHeight / 2)) {
        ob.hit = true;
        this.baselineOffset -= 10;
        if (this.baselineOffset < 0) this.baselineOffset = 0;
        this.calculateObstacleSpeed();
      }
    }
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  hitNote(keyIndex) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const ob = this.obstacles[i];
      if (ob.type === 'note' && ob.lane === keyIndex && !ob.hit &&
          Math.abs((ob.y + ob.height / 2) - (this.car.y - this.baselineOffset + this.noteHeight / 2)) < 30) {
        ob.hit = true;
        this.score += 50;
        if (this.onScoreChange) {
          this.onScoreChange(this.score);
        }
        break;
      }
    }
  }

  spawnObstacles() {
    // Create random obstacles and notes
    if (Math.random() < 0.3) {
      // Spawn a note
      const lane = Math.floor(Math.random() * this.lanes);
      this.obstacles.push({
        x: lane * this.laneWidth,
        y: -this.noteHeight,
        width: this.noteWidth,
        height: this.noteHeight,
        color: this.noteColors[lane],
        type: 'note',
        lane: lane,
        hit: false
      });
    }
    
    if (Math.random() < 0.2) {
      // Spawn an indestructible obstacle
      const lane = Math.floor(Math.random() * this.lanes);
      this.obstacles.push({
        x: lane * this.laneWidth + (this.laneWidth - this.obstacleWidth) / 2,
        y: -this.obstacleHeight,
        width: this.obstacleWidth,
        height: this.obstacleHeight,
        color: '#666',
        type: 'indestructible'
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw lane dividers
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    for (let i = 1; i < this.lanes; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.laneWidth, 0);
      this.ctx.lineTo(i * this.laneWidth, this.canvas.height);
      this.ctx.stroke();
    }
    
    this.drawCar();
    this.drawBaseline();
    this.obstacles.forEach(ob => this.drawObstacle(ob));
    
    // Draw score
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '20px Orbitron';
    this.ctx.fillText('Score: ' + this.score, 10, 30);
    
    // Draw game over
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ff0000';
      this.ctx.font = '40px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
      
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '20px Orbitron';
      this.ctx.fillText('Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
      this.ctx.textAlign = 'start';
    }
  }

  drawCar() {
    this.ctx.fillStyle = '#0f0';
    this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);
    
    // Add some car details
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.car.x + 5, this.car.y + 5, 30, 10);
    this.ctx.fillRect(this.car.x + 5, this.car.y + 35, 30, 10);
  }

  drawBaseline() {
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-25, this.car.y - this.baselineOffset + this.noteHeight / 2);
    this.ctx.lineTo(this.canvas.width + 25, this.car.y - this.baselineOffset + this.noteHeight / 2);
    this.ctx.stroke();
  }

  drawObstacle(obstacle) {
    this.ctx.fillStyle = obstacle.color;
    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    
    if (obstacle.type === 'note') {
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Add note number
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '16px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        (obstacle.lane + 1).toString(),
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2 + 6
      );
      this.ctx.textAlign = 'start';
    }
  }

  runGameLoop() {
    this.update();
    this.draw();
    
    if (!this.gameOver && this.gameStarted) {
      requestAnimationFrame(this.gameLoop);
    } else if (this.gameOver) {
      // Calculate tokens earned based on score
      let tokensEarned = 0;
      if (this.score >= 1000) tokensEarned = 3;
      else if (this.score >= 500) tokensEarned = 2;
      else if (this.score >= 200) tokensEarned = 1;
      
      setTimeout(() => {
        if (this.onGameEnd) {
          this.onGameEnd(this.score, tokensEarned);
        }
      }, 3000);
    }
  }

  endGame() {
    this.gameOver = true;
  }

  start() {
    // Start the game immediately when called by GamePlayer
    this.currentSong = this.songLibrary[1]; // Default to Normal Mode
    this.bpm = this.currentSong.bpm;
    this.calculateObstacleSpeed();
    this.startGame();
  }

  cleanup() {
    // Remove event listeners
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      document.removeEventListener('keyup', this.keyUpHandler);
    }
    
    // Stop any audio
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    
    // Clear the game loop
    if (this.gameLoop) {
      this.gameLoop = null;
    }
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default RockAndRollGame;