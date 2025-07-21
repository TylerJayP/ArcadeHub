import React, { useState, useEffect } from 'react';
import ArcadeHub from './components/ArcadeHub';
import GamePlayer from './components/GamePlayer';
import TokenManager from './utils/TokenManager';
import './App.css';

function App() {
  const [currentGame, setCurrentGame] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Load saved data
    const savedTokens = TokenManager.getTokens();
    const savedUsername = localStorage.getItem('arcade_username');
    const lastLogin = localStorage.getItem('arcade_last_login');
    const today = new Date().toDateString();

    setTokens(savedTokens);
    
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
      
      // Give daily free token if it's a new day
      if (lastLogin !== today) {
        TokenManager.addTokens(1);
        setTokens(TokenManager.getTokens());
        localStorage.setItem('arcade_last_login', today);
      }
    }
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
    localStorage.setItem('arcade_username', name);
    localStorage.setItem('arcade_last_login', new Date().toDateString());
    
    // Give welcome token
    TokenManager.addTokens(1);
    setTokens(TokenManager.getTokens());
  };

  const handleGameSelect = (game) => {
    if (tokens > 0) {
      TokenManager.spendToken();
      setTokens(TokenManager.getTokens());
      setCurrentGame(game);
    }
  };

  const handleGameComplete = (tokensEarned = 0) => {
    if (tokensEarned > 0) {
      TokenManager.addTokens(tokensEarned);
      setTokens(TokenManager.getTokens());
    }
    setCurrentGame(null);
  };

  const handleBackToHub = () => {
    setCurrentGame(null);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      {currentGame ? (
        <GamePlayer 
          game={currentGame} 
          onGameComplete={handleGameComplete}
          onBackToHub={handleBackToHub}
          username={username}
        />
      ) : (
        <ArcadeHub 
          tokens={tokens}
          username={username}
          onGameSelect={handleGameSelect}
          onTokensUpdate={setTokens}
        />
      )}
    </div>
  );
}

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="login-screen">
      <div className="crt-effect">
        <div className="login-terminal">
          <div className="terminal-header">
            <span className="terminal-title">RETRO GAME HUB v1.0</span>
          </div>
          <div className="terminal-content">
            <pre className="ascii-art">
              {`
    ████████████████████████████████
    █  ██  ████  ████  ████  ██  █
    █     █     █     █     █     █
    █  ██  ████  ████  ████  ██  █
    ████████████████████████████████
    
        WELCOME TO THE ARCADE
              `}
            </pre>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>ENTER PLAYER NAME:</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="retro-input"
                  maxLength={12}
                  autoFocus
                />
              </div>
              <button type="submit" className="retro-button">
                START GAME
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

