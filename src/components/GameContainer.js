import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import phoneIcon from '../images/icon_phone.png';
import backgroundImage from '../images/background.png';
import { chapterUtils, loadChapterProgress } from '../data/monologues';
import ChatList from './chat/ChatList';
import ChatRoom from './chat/ChatRoom';
import '../utils/debug'; // 개발자 디버그 기능 로드

export default function GameContainer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);
  const [currentMonologueIndex, setCurrentMonologueIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);

  const handlePhoneClick = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setSelectedChat(null); // 채팅창 닫을 때 선택된 채팅 초기화
    }
  };

  const handleChatSelect = chatId => {
    setSelectedChat(chatId);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = (chatId, message) => {
    // 메시지 전송 로직 (로컬 스토리지에 저장)
    const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
    const newMessage = {
      text: message,
      isOwn: true,
      timestamp: Date.now(),
    };
    messages.push(newMessage);
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
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
    // 게임 데이터 초기화
    chapterUtils.resetProgress();
    setCurrentChapter(chapterUtils.getCurrentChapter());
    setCurrentMonologueIndex(0);
    setIsMonologueOpen(false);
    setIsChatOpen(false);
    setSelectedChat(null);

    // 페이지 새로고침으로 완전 초기화
    window.location.reload();
  };

  // 컴포넌트 마운트 시 챕터 진행 상황 로드
  useEffect(() => {
    loadChapterProgress();
    setCurrentChapter(chapterUtils.getCurrentChapter());
  }, []);

  // 챕터 변경 시 독백 인덱스 초기화
  useEffect(() => {
    setCurrentMonologueIndex(0);
  }, [currentChapter]);

  const chatRooms = [
    {
      id: 'room1',
      name: '게임 관리자',
      lastMessage: '안녕하세요! 도움이 필요하시면...',
      time: '오후 2:30',
      unread: 2,
    },
    {
      id: 'room2',
      name: '플레이어1',
      lastMessage: '게임 재미있네요!',
      time: '오후 2:25',
      unread: 0,
    },
    {
      id: 'room3',
      name: '플레이어2',
      lastMessage: '다음에 또 같이 해요',
      time: '오후 2:20',
      unread: 1,
    },
  ];

  const getChatMessages = chatId => {
    // 로컬 스토리지에서 메시지 불러오기
    const savedMessages = JSON.parse(
      localStorage.getItem(`chat_${chatId}`) || '[]'
    );

    // 기본 메시지가 없으면 초기 메시지 추가
    if (savedMessages.length === 0) {
      const defaultMessages = {
        room1: [
          {
            text: '안녕하세요! 게임에 오신 것을 환영합니다.',
            isOwn: false,
            timestamp: Date.now() - 10000,
          },
          {
            text: '도움이 필요하시면 언제든 말씀해주세요.',
            isOwn: false,
            timestamp: Date.now() - 9000,
          },
        ],
        room2: [
          {
            text: '게임 재미있네요!',
            isOwn: false,
            timestamp: Date.now() - 8000,
          },
        ],
        room3: [
          {
            text: '다음에 또 같이 해요',
            isOwn: false,
            timestamp: Date.now() - 7000,
          },
        ],
      };
      const initialMessages = defaultMessages[chatId] || [];
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(initialMessages));
      return initialMessages;
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
            messages={getChatMessages(selectedChat)}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <ChatList chatRooms={chatRooms} onChatSelect={handleChatSelect} />
        ))}

      {isMonologueOpen && currentChapter && (
        <MonologueOverlay>
          <MonologueBox>
            <MonologueText>
              {currentChapter.monologue[currentMonologueIndex]}
            </MonologueText>
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
  align-items: center;
  justify-content: center;
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

const MonologueText = styled.div`
  color: white;
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 20px;
  font-weight: 500;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const MonologueProgress = styled.div`
  color: #888;
  font-size: 14px;
`;
