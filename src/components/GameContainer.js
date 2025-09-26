import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import phoneIcon from '../images/icon_phone.png';
import backgroundImage from '../images/background.png';
import playerImage from '../images/player.png';
import { chapterUtils, loadChapterProgress } from '../data/monologues';
import { getCharacters, getDialogue } from '../services/api';
import ChatList from './chat/ChatList';
import ChatRoom from './chat/ChatRoom';
import '../utils/debug'; // 개발자 디버그 기능 로드

export default function GameContainer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);
  const [currentMonologueIndex, setCurrentMonologueIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [dialogueData, setDialogueData] = useState({});
  const [hasLocalData, setHasLocalData] = useState({});

  const handlePhoneClick = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setSelectedChat(null);
    }
  };

  const handleChatSelect = async chatId => {
    setSelectedChat(chatId);

    // 1. 먼저 로컬 스토리지에서 기존 데이터 확인
    const savedMessages = JSON.parse(
      localStorage.getItem(`chat_${chatId}`) || '[]'
    );

    // 2. 로컬 스토리지 데이터 여부 저장
    const hasLocal = savedMessages.length > 0;
    setHasLocalData(prev => ({
      ...prev,
      [chatId]: hasLocal,
    }));

    // 3. 로컬 스토리지에 데이터가 있으면 API 호출하지 않음
    if (hasLocal) {
      console.log(`${chatId} 캐릭터의 로컬 저장된 대화 데이터 사용`);
      return;
    }

    // 4. 로컬 스토리지에 데이터가 없으면 API에서 가져오기
    if (!dialogueData[chatId]) {
      try {
        const dialogue = await getDialogue({
          characterId: chatId,
          partNumber: 1,
        });
        setDialogueData(prev => ({
          ...prev,
          [chatId]: dialogue,
        }));

        console.log(`${chatId} 캐릭터의 대화 데이터:`, dialogue);
      } catch (error) {
        console.error(`${chatId} 캐릭터 대화 데이터 로딩 실패:`, error);
      }
    }
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

    // 로컬 스토리지에 사용자 메시지 추가
    const messages = JSON.parse(localStorage.getItem(`chat_${chatId}`) || '[]');
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
    const confirmed = window.confirm(
      '게임 데이터가 초기화됩니다. 초기화 하시겠습니까?'
    );

    if (confirmed) {
      // 게임 데이터 초기화
      chapterUtils.resetProgress();
      setCurrentChapter(chapterUtils.getCurrentChapter());
      setCurrentMonologueIndex(0);
      setIsMonologueOpen(false);
      setIsChatOpen(false);
      setSelectedChat(null);

      // 대화 데이터 초기화
      setCharacters([]);
      setDialogueData({});
      setHasLocalData({});

      // 로컬 스토리지에서 대화 데이터 삭제
      characters.forEach(character => {
        localStorage.removeItem(`chat_${character.id}`);
      });

      // 홈페이지로 이동
      window.location.href = '/';
    }
  };

  useEffect(() => {
    loadChapterProgress();
    setCurrentChapter(chapterUtils.getCurrentChapter());

    const fetchCharacters = async () => {
      try {
        const charactersData = await getCharacters();
        setCharacters(charactersData);
        console.log('받은 캐릭터 데이터:', charactersData);
      } catch (error) {
        console.error('캐릭터 데이터 로딩 실패:', error);
      }
    };

    fetchCharacters();
  }, []);

  // 챕터 변경 시 독백 인덱스 초기화
  useEffect(() => {
    setCurrentMonologueIndex(0);
  }, [currentChapter]);

  // API에서 받은 캐릭터 데이터를 ChatList 형식으로 변환
  const getChatRoomsFromCharacters = () => {
    return characters.map(character => ({
      id: character.id,
      name: character.name,
      lastMessage: '새로운 메시지가 있습니다',
      time: '방금 전',
      unread: 1,
    }));
  };

  // 대화 데이터를 가져오는 함수
  const getChatMessagesForRoom = chatId => {
    // 로컬 스토리지에서 메시지 불러오기
    const savedMessages = JSON.parse(
      localStorage.getItem(`chat_${chatId}`) || '[]'
    );

    // 로컬 스토리지에 데이터가 있으면 사용 (한번에 표시)
    if (savedMessages.length > 0) {
      return savedMessages;
    }

    // 로컬 스토리지에 데이터가 없고 API 데이터가 있으면 사용 (순차적 표시)
    if (dialogueData[chatId]) {
      const apiMessages = dialogueData[chatId].messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        isOwn: false,
        timestamp: Date.now(),
      }));

      return apiMessages;
    }

    return [];
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
            isLocalData={hasLocalData[selectedChat] || false}
          />
        ) : (
          <ChatList
            chatRooms={getChatRoomsFromCharacters()}
            onChatSelect={handleChatSelect}
          />
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
