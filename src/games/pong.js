// Fixed Pong Game - No Double Screen Issue
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
    
    // Add simple instructions below canvas
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="text-align: center; margin: 20px; color: #00ff00; font-family: Orbitron;">
        <h3>🏓 ARCADE PONG 🏓</h3>
        <p>Use W/S or ↑/↓ keys to move paddle • First to 5 points wins!</p>
        <p>Win the game to earn 1 token!</p>
      </div>
    `;
    
    this.container.appendChild(instructions);
    
    // Set up event listeners
    this.keyDownHandler = (e) => this.handleKeyDown(e);
    this.keyUpHandler = (e) => this.handleKeyUp(e);
    
    document.addEventListener('keydown', this.keyDownHandler);
    document.addEventListener('keyup', this.keyUpHandler);
  }

  start() {
    // Start the game immediately when called by GamePlayer
    this.gameRunning = true;
    this.gameLoop = this.runGame.bind(this);
    this.gameLoop();
  }

  handleKeyDown(e) {
    this.keys[e.key] = true;
  }

  handleKeyUp(e) {
    this.keys[e.key] = false;
  }

  update() {
    if (!this.gameRunning) return;
    
    // Move player paddle
    if ((this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) && this.paddle.y > 0) {
      this.paddle.y -= this.paddle.speed;
    }
    if ((this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) && 
        this.paddle.y < this.canvas.height - this.paddle.height) {
      this.paddle.y += this.paddle.speed;
    }
    
    // Move AI paddle (simple AI)
    const paddleCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
    if (paddleCenter < this.ball.y - 35 && this.aiPaddle.y < this.canvas.height - this.aiPaddle.height) {
      this.aiPaddle.y += this.aiPaddle.speed;
    } else if (paddleCenter > this.ball.y + 35 && this.aiPaddle.y > 0) {
      this.aiPaddle.y -= this.aiPaddle.speed;
    }
    
    // Move ball
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    
    // Ball collision with top/bottom walls
    if (this.ball.y <= this.ball.size || this.ball.y >= this.canvas.height - this.ball.size) {
      this.ball.dy = -this.ball.dy;
    }
    
    // Ball collision with paddles
    if (this.ball.x <= this.paddle.x + this.paddle.width &&
        this.ball.y >= this.paddle.y &&
        this.ball.y <= this.paddle.y + this.paddle.height &&
        this.ball.dx < 0) {
      this.ball.dx = -this.ball.dx;
      // Add some randomness to ball direction
      this.ball.dy += (Math.random() - 0.5) * 2;
    }
    
    if (this.ball.x >= this.aiPaddle.x - this.ball.size &&
        this.ball.y >= this.aiPaddle.y &&
        this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
        this.ball.dx > 0) {
      this.ball.dx = -this.ball.dx;
      // Add some randomness to ball direction
      this.ball.dy += (Math.random() - 0.5) * 2;
    }
    
    // Ball goes off screen - score points
    if (this.ball.x < 0) {
      this.aiScore++;
      this.resetBall();
      if (this.aiScore >= 5) {
        this.endGame(false); // Player lost
      }
    } else if (this.ball.x > this.canvas.width) {
      this.score++;
      if (this.onScoreChange) {
        this.onScoreChange(this.score);
      }
      this.resetBall();
      if (this.score >= 5) {
        this.endGame(true); // Player won
      }
    }
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.canvas.height / 2;
    this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    this.ball.dy = (Math.random() - 0.5) * 6;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw center line
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 15]);
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
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw scores
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '30px Orbitron';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score, this.canvas.width / 4, 50);
    this.ctx.fillText(this.aiScore, 3 * this.canvas.width / 4, 50);
    
    // Draw labels
    this.ctx.font = '16px Orbitron';
    this.ctx.fillText('PLAYER', this.canvas.width / 4, 80);
    this.ctx.fillText('COMPUTER', 3 * this.canvas.width / 4, 80);
    
    // Draw game over screen
    if (!this.gameRunning) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.score >= 5) {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '40px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 40);
      } else {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '40px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('YOU LOSE!', this.canvas.width / 2, this.canvas.height / 2 - 40);
      }
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '20px Orbitron';
      this.ctx.fillText(`Final Score: ${this.score} - ${this.aiScore}`, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    this.ctx.textAlign = 'start';
  }

  runGame() {
    this.update();
    this.draw();
    
    if (this.gameRunning) {
      requestAnimationFrame(this.gameLoop);
    }
  }

  endGame(playerWon) {
    this.gameRunning = false;
    
    // Calculate tokens earned
    let tokensEarned = 0;
    if (playerWon) {
      tokensEarned = 1; // Win the game to earn 1 token
    }
    
    setTimeout(() => {
      if (this.onGameEnd) {
        this.onGameEnd(this.score, tokensEarned);
      }
    }, 3000);
  }

  cleanup() {
    this.gameRunning = false;
    
    // Remove event listeners
    if (this.keyDownHandler) {
      document.removeEventListener('keydown', this.keyDownHandler);
    }
    if (this.keyUpHandler) {
      document.removeEventListener('keyup', this.keyUpHandler);
    }
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default PongGame;