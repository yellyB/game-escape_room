import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FlowProvider } from './contexts/FlowContext';
import StartScreen from './components/StartScreen';
import GameContainer from './components/GameContainer';
import './App.css';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/game" element={<GameContainer />} />
    </Routes>
  );
}

function App() {
  return (
    <FlowProvider>
      <Router>
        <AppContent />
      </Router>
    </FlowProvider>
  );
}

export default App;
