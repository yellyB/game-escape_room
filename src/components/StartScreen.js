import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { getCharacters } from '../services/api';
import { useFlowManager } from '../contexts/FlowContext';

export default function StartScreen() {
  const navigate = useNavigate();

  const { setCurrStepKey } = useFlowManager();

  const handleStartGame = async () => {
    setCurrStepKey({ id: 'opening', index: 0 });
    navigate('/game');

    // const charactersData = await getCharacters();
    // setCharacters(charactersData);
  };

  return (
    <Container>
      <StartButton onClick={handleStartGame}>방에서 나가기</StartButton>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Arial', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
  text-align: center;
`;

const StartButton = styled.button`
  padding: 2rem 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  touch-action: manipulation;
  min-height: 80px;
  min-width: 200px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-5px);
  }

  &:active {
    transform: translateY(0);
  }
`;
