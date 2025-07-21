import React, { useState } from 'react';
import GameLibrary from './GameLibrary';
import TokenManager from '../utils/TokenManager';
import './ArcadeHub.css';

const ArcadeHub = ({ tokens, username, onGameSelect, onTokensUpdate }) => {
  const [devMode, setDevMode] = useState(false);

  const handleAddTokens = () => {
    TokenManager.addTokens(5);
    onTokensUpdate(TokenManager.getTokens());
  };

  const handleRemoveTokens = () => {
    const current = TokenManager.getTokens();
    TokenManager.setTokens(Math.max(0, current - 1));
    onTokensUpdate(TokenManager.getTokens());
  };

  const handleResetTokens = () => {
    TokenManager.resetTokens();
    onTokensUpdate(TokenManager.getTokens());
  };

  return (
    <div className="arcade-hub">
      <div className="crt-overlay"></div>
      
      <header className="arcade-header">
        <div className="player-info">
          <span className="player-name">PLAYER: {username}</span>
          <div className="token-section">
            <span className="token-count">TOKENS: {tokens}</span>
            <button 
              className="dev-toggle"
              onClick={() => setDevMode(!devMode)}
            >
              DEV
            </button>
            {devMode && (
              <div className="dev-controls">
                <button className="dev-button add" onClick={handleAddTokens}>+5</button>
                <button className="dev-button remove" onClick={handleRemoveTokens}>-1</button>
                <button className="dev-button reset" onClick={handleResetTokens}>RESET</button>
              </div>
            )}
          </div>
        </div>
        <h1 className="arcade-title">RETRO GAME HUB</h1>
        <div className="subtitle">SELECT YOUR GAME</div>
      </header>

      <main className="arcade-main">
        <div className="arcade-cabinet">
          <div className="cabinet-screen">
            <GameLibrary tokens={tokens} onGameSelect={onGameSelect} />
          </div>
          
          <div className="cabinet-controls">
            <div className="control-panel">
              <div className="joystick"></div>
              <div className="buttons">
                <div className="button red"></div>
                <div className="button blue"></div>
                <div className="button yellow"></div>
              </div>
            </div>
            <div className="coin-slot">
              <div className="slot"></div>
              <span>INSERT COIN</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="arcade-footer">
        <p>Daily token resets at midnight • Earn tokens by winning games</p>
      </footer>
    </div>
  );
};

export default ArcadeHub;