// Fixed Snake Game - No Double Screen Issue
class SnakeGame {
  constructor({ container, onScoreChange, onGameEnd, username }) {
    this.container = container;
    this.onScoreChange = onScoreChange;
    this.onGameEnd = onGameEnd;
    this.username = username;
    
    this.canvas = null;
    this.ctx = null;
    this.gameLoop = null;
    
    this.gridSize = 20;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = { x: 0, y: 0 };
    this.food = { x: 15, y: 15 };
    this.score = 0;
    this.gameRunning = false;
    
    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = 600;
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
        <h3>🐍 RETRO SNAKE 🐍</h3>
        <p>Use ARROW KEYS to move • Eat food to grow • Don't hit walls or yourself!</p>
        <p>Score 100+ points to earn 2 tokens!</p>
      </div>
    `;
    
    this.container.appendChild(instructions);
    
    // Set up event listeners
    this.keyHandler = (e) => this.handleKeyPress(e);
    document.addEventListener('keydown', this.keyHandler);
    
    this.generateFood();
  }

  start() {
    // Start the game immediately when called by GamePlayer
    this.gameRunning = true;
    this.gameLoop = this.runGame.bind(this);
    this.gameLoop();
  }

  handleKeyPress(e) {
    if (!this.gameRunning) return;
    
    if (e.key === 'ArrowUp' && this.direction.y === 0) {
      this.direction = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown' && this.direction.y === 0) {
      this.direction = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft' && this.direction.x === 0) {
      this.direction = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight' && this.direction.x === 0) {
      this.direction = { x: 1, y: 0 };
    }
  }

  update() {
    if (!this.gameRunning) return;
    
    // Move snake head
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
        head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
      this.endGame();
      return;
    }
    
    // Check self collision
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.endGame();
      return;
    }
    
    this.snake.unshift(head);
    
    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      if (this.onScoreChange) {
        this.onScoreChange(this.score);
      }
      this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  generateFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
        y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
      };
    } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y));
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#001100';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw snake
    this.ctx.fillStyle = '#00ff00';
    this.snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head - brighter
        this.ctx.fillStyle = '#00ff88';
      } else {
        this.ctx.fillStyle = '#00cc00';
      }
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    });
    
    // Draw food
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
    
    // Draw score
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Orbitron';
    this.ctx.fillText('Score: ' + this.score, 10, 30);
    
    // Draw game over screen
    if (!this.gameRunning) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ff0000';
      this.ctx.font = '40px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
      
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '20px Orbitron';
      this.ctx.fillText('Final Score: ' + this.score, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.textAlign = 'start';
    }
  }

  runGame() {
    this.update();
    this.draw();
    
    if (this.gameRunning) {
      setTimeout(() => {
        this.gameLoop();
      }, 150); // Game speed
    }
  }

  endGame() {
    this.gameRunning = false;
    
    // Calculate tokens earned
    let tokensEarned = 0;
    if (this.score >= 100) tokensEarned = 2;
    else if (this.score >= 50) tokensEarned = 1;
    
    setTimeout(() => {
      if (this.onGameEnd) {
        this.onGameEnd(this.score, tokensEarned);
      }
    }, 3000);
  }

  cleanup() {
    this.gameRunning = false;
    
    // Remove event listener
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
    }
    
    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export default SnakeGame;