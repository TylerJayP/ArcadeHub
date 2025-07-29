// Game Registry - Add your team's games here
const games = [
  {
    id: 'snake',
    name: 'RETRO SNAKE',
    description: 'Classic snake game with a retro twist',
    developer: 'Demo Team',
    difficulty: 3,
    preview: '🐍',
    file: 'snake.js',
    tokensOnWin: 2
  },
  {
    id: 'pong',
    name: 'ARCADE PONG',
    description: 'The classic paddle ball game',
    developer: 'Demo Team',
    difficulty: 2,
    preview: '🏓',
    file: 'pong.js',
    tokensOnWin: 1
  },
  {
    id: 'rock-and-roll',
    name: 'ROCK AND ROLL',
    description: 'Rhythm-based driving game - hit the notes and avoid obstacles!',
    developer: 'Group Member',
    difficulty: 4,
    preview: '🎸',
    file: 'rockandroll.js',
    tokensOnWin: 3
  }
];

class GameRegistry {
  static getAllGames() {
    return games;
  }

  static getGame(id) {
    return games.find(game => game.id === id);
  }

  static addGame(gameConfig) {
    games.push(gameConfig);
  }

  static removeGame(id) {
    const index = games.findIndex(game => game.id === id);
    if (index > -1) {
      games.splice(index, 1);
      return true;
    }
    return false;
  }
}

export default GameRegistry;