import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
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
      <Route path="/" element={<StartScreen onStartGame={handleStartGame} />} />
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
