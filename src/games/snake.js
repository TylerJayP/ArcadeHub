// Demo Snake Game - Replace with your team's actual games
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
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="text-align: center; margin: 20px; color: #00ff00; font-family: Orbitron;">
        <h3>SNAKE GAME</h3>
        <p>Use ARROW KEYS to move • Eat food to grow • Don't hit walls or yourself!</p>
        <p>Score 100+ points to earn 2 tokens!</p>
        <button id="start-snake" style="
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
    document.getElementById('start-snake').addEventListener('click', () => {
      this.startGame();
    });
    
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });
  }

  startGame() {
    this.gameRunning = true;
    this.gameLoop = setInterval(() => {
      this.update();
      this.draw();
    }, 150);
  }

  handleKeyPress(e) {
    if (!this.gameRunning) return;
    
    const key = e.key;
    if (key === 'ArrowUp' && this.direction.y === 0) {
      this.direction = { x: 0, y: -1 };
    } else if (key === 'ArrowDown' && this.direction.y === 0) {
      this.direction = { x: 0, y: 1 };
    } else if (key === 'ArrowLeft' && this.direction.x === 0) {
      this.direction = { x: -1, y: 0 };
    } else if (key === 'ArrowRight' && this.direction.x === 0) {
      this.direction = { x: 1, y: 0 };
    }
  }

  update() {
    if (!this.gameRunning) return;
    
    // Move snake
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    
    // Check wall collision
    if (head.x < 0 || head.x >= 30 || head.y < 0 || head.y >= 20) {
      this.endGame();
      return;
    }
    
    // Check self collision
    for (let segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.endGame();
        return;
      }
    }
    
    this.snake.unshift(head);
    
    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.onScoreChange(this.score);
      this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  generateFood() {
    this.food = {
      x: Math.floor(Math.random() * 30),
      y: Math.floor(Math.random() * 20)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of this.snake) {
      if (this.food.x === segment.x && this.food.y === segment.y) {
        this.generateFood();
        break;
      }
    }
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw snake
    this.ctx.fillStyle = '#00ff00';
    for (let segment of this.snake) {
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }
    
    // Draw food
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  endGame() {
    this.gameRunning = false;
    clearInterval(this.gameLoop);
    
    // Calculate tokens earned
    const tokensEarned = this.score >= 100 ? 2 : this.score >= 50 ? 1 : 0;
    
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

export default SnakeGame;
