import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StartScreen from './components/StartScreen';
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

const GameContainer = styled.div`
  min-height: 100vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

function AppContent() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  const handleBackToStart = () => {
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={
        <AppContainer>
          <StartScreen onStartGame={handleStartGame} />
        </AppContainer>
      } />
      <Route path="/game" element={
        <GameContainer>
          {/* 까만 배경만 표시 */}
        </GameContainer>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;