# Retro Game Hub

A retro arcade-style game hub built with React that allows team members to showcase their JavaScript games in a unified gaming experience.

## Features

- 🕹️ Retro arcade cabinet interface with CRT-style effects
- 🎮 Token-based gameplay system (earn tokens by winning games)
- 👥 Multi-game library supporting team member contributions
- 💾 Local storage for user progress and tokens
- 🎯 Daily token rewards system
- 📱 Responsive design with authentic arcade aesthetics

## Getting Started

1. **Installation**
   ```bash
   npm install
   npm start
   ```

2. **Adding Your Team's Games**
   
   Add your games to the `src/games/` directory and register them in `src/games/gameRegistry.js`:
   
   ```javascript
   {
     id: 'your-game-id',
     name: 'YOUR GAME NAME',
     description: 'Your game description',
     developer: 'Your Name',
     difficulty: 1-5,
     preview: '🎮', // Emoji or small icon
     file: 'your-game.js',
     tokensOnWin: 1-3
   }
   ```

3. **Game Interface Requirements**
   
   Your games should export a class with this interface:
   
   ```javascript
   class YourGame {
     constructor({ container, onScoreChange, onGameEnd, username }) {
       // Initialize your game
     }
     
     start() {
       // Start the game
     }
     
     cleanup() {
       // Clean up resources when game ends
     }
   }
   ```

## Token System

- Players receive 1 free token daily
- Additional tokens earned by winning games
- Maximum of 10 tokens can be held
- Each game play costs 1 token

## Architecture

- **React Components**: Modern functional components with hooks
- **Token Management**: Local storage-based persistence
- **Game Loading**: Dynamic ES6 module imports
- **Styling**: CSS-in-JS with retro CRT effects

## Demo Games Included

- **Snake**: Classic snake game (earn 2 tokens for 100+ points)
- **Pong**: Paddle ball game (earn 1 token for winning)

Replace these with your team's actual games!

## Customization

- Modify `src/components/ArcadeHub.css` for visual theming
- Adjust token rewards in `gameRegistry.js`
- Add new game types by following the existing game structure
- Customize the arcade cabinet design in `ArcadeHub.js`

## Team Integration

Perfect for class projects where each team member creates a game. The hub provides:
- Unified user experience
- Progress tracking across all games
- Competitive token earning system
- Professional presentation of student work

Built with ❤️ for retro gaming enthusiasts!
