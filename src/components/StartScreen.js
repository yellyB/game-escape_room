import React from 'react';
import styled from 'styled-components';

const StartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
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

function StartScreen({ onStartGame }) {
  return (
    <StartContainer>
      <StartButton onClick={onStartGame}>방에서 나가기</StartButton>
    </StartContainer>
  );
}

export default StartScreen;
