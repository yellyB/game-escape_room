import React, { useState } from 'react';
import styled from 'styled-components';
import backgroundImage from '../images/background.png';
import ChatContainer from './chat/ChatContainer';
import { useFlowManager } from '../contexts/FlowContext';
import Monologue from './Monologue';
import BottomArea from './BottomArea';

export default function GameContainer() {
  const { currStepData } = useFlowManager();

  const [isChatOpen, setIsChatOpen] = useState(false);

  const handlePhoneClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  // 토스트 테스트 함수
  const testToast = () => {
    if (typeof window !== 'undefined' && window.message) {
      window.message('토스트 메시지 테스트입니다!');
    }
  };

  return (
    <GameContainerWrapper backgroundImage={backgroundImage}>
      <BottomArea onChatOpenClick={handlePhoneClick} />
      {isChatOpen && <ChatContainer />}
      {currStepData.type === 'monologue' && <Monologue />}
      {/* 토스트 테스트 버튼 (개발용) */}
      <TestToastButton onClick={testToast}>토스트 테스트</TestToastButton>
    </GameContainerWrapper>
  );
}

const GameContainerWrapper = styled.div`
  min-height: 100vh;
  background: #000000;
  background-image: url(${props => props.backgroundImage});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TestToastButton = styled.button`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(76, 175, 80, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
