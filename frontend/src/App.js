import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import StartScreen from './components/StartScreen';
import GameContainer from './components/GameContainer';
import './App.css';



function AppContent() {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };


  return (
    <Routes>
      <Route path="/" element={
        <AppContainer>
          <StartScreen onStartGame={handleStartGame} />
        </AppContainer>
      } />
      <Route path="/game" element={<GameContainer />} />
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