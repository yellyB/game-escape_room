import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import GameLobby from './components/GameLobby';
import GameRoom from './components/GameRoom';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Arial', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

function App() {
  const [currentView, setCurrentView] = useState('lobby');
  const [gameData, setGameData] = useState(null);

  const handleJoinGame = (roomId, playerName) => {
    setGameData({ roomId, playerName });
    setCurrentView('game');
  };

  const handleBackToLobby = () => {
    setCurrentView('lobby');
    setGameData(null);
  };

  return (
    <AppContainer>
      <div>
        <Title>🎮 Escape Game</Title>
        {currentView === 'lobby' ? (
          <GameLobby onJoinGame={handleJoinGame} />
        ) : (
          <GameRoom 
            gameData={gameData} 
            onBackToLobby={handleBackToLobby} 
          />
        )}
      </div>
    </AppContainer>
  );
}

export default App;