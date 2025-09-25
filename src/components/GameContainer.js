import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import phoneIcon from '../images/icon_phone.png';
import backgroundImage from '../images/background.png';
import playerImage from '../images/player.png';
import { chapterUtils, loadChapterProgress } from '../data/monologues';
import {
  chatRooms,
  getChatMessages,
  messageProgressUtils,
} from '../data/chatData';
import ChatList from './chat/ChatList';
import ChatRoom from './chat/ChatRoom';
import '../utils/debug'; // 개발자 디버그 기능 로드

export default function GameContainer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);
  const [currentMonologueIndex, setCurrentMonologueIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chatMessages, setChatMessages] = useState({});

  const handlePhoneClick = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setSelectedChat(null);
    }
  };

  const handleChatSelect = chatId => {
    setSelectedChat(chatId);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = (chatId, message) => {
    const newMessage = {
      text: message,
      isOwn: true,
      timestamp: Date.now(),
    };

    setChatMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMessage],
    }));

    // 로컬 스토리지에도 저장
    const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    messages.push(newMessage);
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));

    // 메시지 전송 후 다음 단계로 진행
    setTimeout(() => {
      messageProgressUtils.incrementPhase(chatId);

      // 다른 채팅방의 다음 단계 메시지가 있는지 확인하고 추가
      updateOtherChatRooms(chatId);
    }, 2000);
  };

  // 다른 채팅방의 메시지 업데이트
  const updateOtherChatRooms = currentChatId => {
    const chatOrder = ['friend_mina', 'mom', 'sister', 'junior'];
    const currentIndex = chatOrder.indexOf(currentChatId);

    // 현재 채팅방 다음 순서의 채팅방들 업데이트
    for (let i = currentIndex + 1; i < chatOrder.length; i++) {
      const nextChatId = chatOrder[i];
      const nextPhase = messageProgressUtils.getCurrentPhase(nextChatId);
      const nextMessages = getChatMessages(nextChatId, nextPhase);

      if (nextMessages.length > 0) {
        // 새로운 메시지를 실시간으로 추가
        setChatMessages(prev => ({
          ...prev,
          [nextChatId]: [...(prev[nextChatId] || []), ...nextMessages],
        }));

        // 로컬 스토리지에도 저장
        const savedMessages = JSON.parse(
          localStorage.getItem(`chat_${nextChatId}`) || '[]'
        );
        const updatedMessages = [...savedMessages, ...nextMessages];
        localStorage.setItem(
          `chat_${nextChatId}`,
          JSON.stringify(updatedMessages)
        );
      }
    }
  };

  const handleScreenClick = () => {
    if (isMonologueOpen && currentChapter) {
      if (currentMonologueIndex < currentChapter.monologue.length - 1) {
        setCurrentMonologueIndex(currentMonologueIndex + 1);
      } else {
        // 독백이 끝나면 챕터 완료 처리
        chapterUtils.completeChapter(currentChapter.id);

        // 다음 챕터로 진행
        if (chapterUtils.goToNextChapter()) {
          setCurrentChapter(chapterUtils.getCurrentChapter());
        }

        setIsMonologueOpen(false);
        setCurrentMonologueIndex(0);
      }
    }
  };

  const startMonologue = () => {
    setIsMonologueOpen(true);
    setCurrentMonologueIndex(0);
  };

  const handleResetGame = () => {
    const confirmed = window.confirm(
      '게임 데이터가 초기화됩니다. 초기화 하시겠습니까?'
    );

    if (confirmed) {
      // 게임 데이터 초기화
      chapterUtils.resetProgress();
      messageProgressUtils.resetProgress();
      setCurrentChapter(chapterUtils.getCurrentChapter());
      setCurrentMonologueIndex(0);
      setIsMonologueOpen(false);
      setIsChatOpen(false);
      setSelectedChat(null);
      setChatMessages({});

      // 홈페이지로 이동
      window.location.href = '/';
    }
  };

  // 컴포넌트 마운트 시 챕터 진행 상황 로드
  useEffect(() => {
    loadChapterProgress();
    messageProgressUtils.loadProgress();
    setCurrentChapter(chapterUtils.getCurrentChapter());
  }, []);

  // 챕터 변경 시 독백 인덱스 초기화
  useEffect(() => {
    setCurrentMonologueIndex(0);
  }, [currentChapter]);

  const getChatMessagesForRoom = chatId => {
    // 실시간 메시지가 있으면 그것을 사용
    if (chatMessages[chatId]) {
      return chatMessages[chatId];
    }

    // 현재 단계의 메시지 가져오기
    const currentPhase = messageProgressUtils.getCurrentPhase(chatId);
    const phaseMessages = getChatMessages(chatId, currentPhase);

    // 로컬 스토리지에서 메시지 불러오기
    const savedMessages = JSON.parse(
      localStorage.getItem(`chat_${chatId}`) || '[]'
    );

    // 기본 메시지가 없으면 현재 단계의 메시지 추가
    if (savedMessages.length === 0 && phaseMessages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(phaseMessages));
      return phaseMessages;
    }

    return savedMessages;
  };

  return (
    <GameContainerWrapper
      onClick={handleScreenClick}
      backgroundImage={backgroundImage}
    >
      <BottomFixedArea>
        <PhoneIcon
          src={phoneIcon}
          alt="Phone Icon"
          onClick={handlePhoneClick}
        />
        <MonologueButton onClick={startMonologue}>💭</MonologueButton>
        <ResetButton onClick={handleResetGame}>🔄</ResetButton>
      </BottomFixedArea>

      {isChatOpen &&
        (selectedChat ? (
          <ChatRoom
            chatId={selectedChat}
            messages={getChatMessagesForRoom(selectedChat)}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <ChatList chatRooms={chatRooms} onChatSelect={handleChatSelect} />
        ))}

      {isMonologueOpen && currentChapter && (
        <MonologueOverlay>
          <MonologueBox>
            <MonologueContent>
              <PlayerImage src={playerImage} alt="Player" />
              <MonologueText>
                {currentChapter.monologue[currentMonologueIndex]}
              </MonologueText>
            </MonologueContent>
            <MonologueProgress>
              {currentMonologueIndex + 1} / {currentChapter.monologue.length}
            </MonologueProgress>
          </MonologueBox>
        </MonologueOverlay>
      )}
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

const BottomFixedArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #333;
`;

const PhoneIcon = styled.img`
  width: 40px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const MonologueButton = styled.button`
  width: 40px;
  height: 40px;
  background: #28a745;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const ResetButton = styled.button`
  width: 40px;
  height: 40px;
  background: #dc3545;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const MonologueOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 100px;
  z-index: 2000;
`;

const MonologueBox = styled.div`
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 15px;
  padding: 30px;
  width: 80%;
  max-width: 600px;
  min-height: 200px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MonologueContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const PlayerImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const MonologueText = styled.div`
  color: white;
  font-size: 18px;
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const MonologueProgress = styled.div`
  color: #888;
  font-size: 14px;
`;
