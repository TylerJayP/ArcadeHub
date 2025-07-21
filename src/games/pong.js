// Demo Pong Game - Replace with your team's actual games
class PongGame {
  constructor({ container, onScoreChange, onGameEnd, username }) {
    this.container = container;
    this.onScoreChange = onScoreChange;
    this.onGameEnd = onGameEnd;
    this.username = username;
    
    this.canvas = null;
    this.ctx = null;
    this.gameLoop = null;
    
    this.paddle = { x: 50, y: 200, width: 15, height: 80, speed: 8 };
    this.aiPaddle = { x: 735, y: 200, width: 15, height: 80, speed: 5 };
    this.ball = { x: 400, y: 300, dx: 4, dy: 3, size: 15 };
    this.score = 0;
    this.aiScore = 0;
    this.gameRunning = false;
    
    this.keys = {};
    
    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 800;
    this.canvas.height = 400;
    this.canvas.style.border = '2px solid #00ff00';
    this.canvas.style.background = '#001100';
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="text-align: center; margin: 20px; color: #00ff00; font-family: Orbitron;">
        <h3>PONG GAME</h3>
        <p>Use W/S or ↑/↓ keys to move paddle • First to 5 points wins!</p>
        <p>Win the game to earn 1 token!</p>
        <button id="start-pong" style="
          background: linear-gradient(45deg, #001100, #003300);
          border: 2px solid #00ff00;
          color: #00ff00;
          padding: 10px 20px;
          font-family: Orbitron;
          font-weight: 700;
          cursor: pointer;
          border-radius: 4px;
          margin-top: 10px;
        ">START GAME</button>
      </div>
    `;
    this.container.appendChild(instructions);
    
    // Event listeners
    document.getElementById('start-pong').addEventListener('click', () => {
      this.startGame();
    });
    
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  startGame() {
    this.gameRunning = true;
    this.gameLoop = setInterval(() => {
      this.update();
      this.draw();
    }, 16); // ~60 FPS
  }

  update() {
    if (!this.gameRunning) return;
    
    // Player paddle movement
    if ((this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) && this.paddle.y > 0) {
      this.paddle.y -= this.paddle.speed;
    }
    if ((this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) && this.paddle.y < this.canvas.height - this.paddle.height) {
      this.paddle.y += this.paddle.speed;
    }
    
    // AI paddle movement (simple AI)
    const aiCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
    const ballCenter = this.ball.y;
    
    if (aiCenter < ballCenter - 35) {
      this.aiPaddle.y += this.aiPaddle.speed;
    } else if (aiCenter > ballCenter + 35) {
      this.aiPaddle.y -= this.aiPaddle.speed;
    }
    
    // Keep AI paddle in bounds
    this.aiPaddle.y = Math.max(0, Math.min(this.canvas.height - this.aiPaddle.height, this.aiPaddle.y));
    
    // Ball movement
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Ball collision with top/bottom walls
    if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ball.size) {
      this.ball.dy = -this.ball.dy;
    }
    
    // Ball collision with paddles
    if (this.ball.x <= this.paddle.x + this.paddle.width &&
        this.ball.y >= this.paddle.y &&
        this.ball.y <= this.paddle.y + this.paddle.height &&
        this.ball.dx < 0) {
      this.ball.dx = -this.ball.dx;
      this.ball.dx *= 1.05; // Increase speed slightly
    }
    
    if (this.ball.x >= this.aiPaddle.x - this.ball.size &&
        this.ball.y >= this.aiPaddle.y &&
        this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
        this.ball.dx > 0) {
      this.ball.dx = -this.ball.dx;
      this.ball.dx *= 1.05; // Increase speed slightly
    }
    
    // Scoring
    if (this.ball.x < 0) {
      this.aiScore++;
      this.resetBall();
      if (this.aiScore >= 5) {
        this.endGame(false);
      }
    } else if (this.ball.x > this.canvas.width) {
      this.score++;
      this.onScoreChange(this.score);
      this.resetBall();
      if (this.score >= 5) {
        this.endGame(true);
      }
    }
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.dx = Math.random() > 0.5 ? 4 : -4;
    this.ball.dy = (Math.random() - 0.5) * 6;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw center line
    this.ctx.setLineDash([5, 15]);
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Draw paddles
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
    
    // Draw ball
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(this.ball.x, this.ball.y, this.ball.size, this.ball.size);
    
    // Draw scores
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 48px Orbitron';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score, this.canvas.width / 4, 60);
    this.ctx.fillText(this.aiScore, (3 * this.canvas.width) / 4, 60);
  }

  endGame(playerWon) {
    this.gameRunning = false;
    clearInterval(this.gameLoop);
    
    // Calculate tokens earned
    const tokensEarned = playerWon ? 1 : 0;
    
    setTimeout(() => {
      this.onGameEnd(this.score, tokensEarned);
    }, 1000);
  }

  cleanup() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default PongGame;
