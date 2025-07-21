import React, { useState, useEffect, useRef } from 'react';
import './GamePlayer.css';

const GamePlayer = ({ game, onGameComplete, onBackToHub, username }) => {
  const gameContainerRef = useRef(null);
  const [gameState, setGameState] = useState('loading');
  const [score, setScore] = useState(0);
  const [gameInstance, setGameInstance] = useState(null);

  useEffect(() => {
    loadGame();
    return () => {
      // Cleanup when component unmounts
      if (gameInstance && gameInstance.cleanup) {
        gameInstance.cleanup();
      }
    };
  }, [game]);

  const loadGame = async () => {
    try {
      setGameState('loading');
      
      // Import the game module
      const gameModule = await import(`../games/${game.file}`);
      const GameClass = gameModule.default;
      
      // Create game instance
      const instance = new GameClass({
        container: gameContainerRef.current,
        onScoreChange: setScore,
        onGameEnd: handleGameEnd,
        username: username
      });
      
      setGameInstance(instance);
      
      // Start the game
      if (instance.start) {
        instance.start();
      }
      
      setGameState('playing');
    } catch (error) {
      console.error('Failed to load game:', error);
      setGameState('error');
    }
  };

  const handleGameEnd = (finalScore, tokensEarned = 0) => {
    setScore(finalScore);
    setGameState('completed');
    
    // Award tokens based on performance
    setTimeout(() => {
      onGameComplete(tokensEarned);
    }, 3000);
  };

  const handleBackClick = () => {
    if (gameInstance && gameInstance.cleanup) {
      gameInstance.cleanup();
    }
    onBackToHub();
  };

  return (
    <div className="game-player">
      <div className="game-header">
        <button className="back-button" onClick={handleBackClick}>
          ← BACK TO HUB
        </button>
        <div className="game-info">
          <span className="current-game">NOW PLAYING: {game.name}</span>
          <span className="current-score">SCORE: {score}</span>
        </div>
      </div>

      <div className="game-container">
        {gameState === 'loading' && (
          <div className="game-status">
            <div className="loading-screen">
              <div className="loading-text">LOADING GAME...</div>
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
            </div>
          </div>
        )}
        
        {gameState === 'error' && (
          <div className="game-status">
            <div className="error-screen">
              <div className="error-text">ERROR LOADING GAME</div>
              <div className="error-message">Failed to load {game.name}</div>
              <button className="retry-button" onClick={loadGame}>
                RETRY
              </button>
            </div>
          </div>
        )}
        
        {gameState === 'completed' && (
          <div className="game-status">
            <div className="complete-screen">
              <div className="complete-text">GAME COMPLETE!</div>
              <div className="final-score">FINAL SCORE: {score}</div>
              <div className="returning-text">Returning to hub...</div>
            </div>
          </div>
        )}
        
        <div 
          ref={gameContainerRef} 
          className="game-canvas"
          style={{ 
            display: gameState === 'playing' ? 'block' : 'none' 
          }}
        />
      </div>
    </div>
  );
};

export default GamePlayer;
