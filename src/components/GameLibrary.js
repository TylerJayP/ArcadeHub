import React from 'react';
import gameRegistry from '../games/gameRegistry';
import './GameLibrary.css';

const GameLibrary = ({ tokens, onGameSelect }) => {
  const games = gameRegistry.getAllGames();

  return (
    <div className="game-library">
      <div className="library-header">
        <h2>GAME SELECTION</h2>
        <div className="instruction">
          {tokens > 0 ? 'Click a game to play!' : 'No tokens! Come back tomorrow or win a game!'}
        </div>
      </div>
      
      <div className="games-grid">
        {games.map((game) => (
          <GameCard 
            key={game.id}
            game={game}
            canPlay={tokens > 0}
            onSelect={() => onGameSelect(game)}
          />
        ))}
      </div>
      
      {games.length === 0 && (
        <div className="no-games">
          <p>No games available yet!</p>
          <p>Add your team's games to the registry.</p>
        </div>
      )}
    </div>
  );
};

const GameCard = ({ game, canPlay, onSelect }) => {
  return (
    <div 
      className={`game-card ${canPlay ? 'playable' : 'locked'}`}
      onClick={canPlay ? onSelect : undefined}
    >
      <div className="game-screen">
        <div className="game-preview">
          {game.preview || '🎮'}
        </div>
        <div className="game-title">{game.name}</div>
        <div className="game-description">{game.description}</div>
        <div className="game-meta">
          <span className="developer">By: {game.developer}</span>
          <span className="difficulty">⭐ {game.difficulty}/5</span>
        </div>
      </div>
      
      <div className="game-controls">
        <div className="insert-coin">
          {canPlay ? 'PRESS TO PLAY' : 'NEED TOKEN'}
        </div>
      </div>
      
      {!canPlay && <div className="locked-overlay">🔒</div>}
    </div>
  );
};

export default GameLibrary;
