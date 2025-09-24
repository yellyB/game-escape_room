import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import phoneIcon from '../images/icon_phone.png';
import backgroundImage from '../images/background.png';
import {  chapterUtils, loadChapterProgress } from '../data/monologues';
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

  const handleChatSelect = (chatId) => {
    setSelectedChat(chatId);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
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
    { id: 'room1', name: '게임 관리자', lastMessage: '안녕하세요! 도움이 필요하시면...', time: '오후 2:30', unread: 2 },
    { id: 'room2', name: '플레이어1', lastMessage: '게임 재미있네요!', time: '오후 2:25', unread: 0 },
    { id: 'room3', name: '플레이어2', lastMessage: '다음에 또 같이 해요', time: '오후 2:20', unread: 1 },
  ];

  const getChatMessages = (chatId) => {
    const messages = {
      room1: [
        { text: '안녕하세요! 게임에 오신 것을 환영합니다.', time: '오후 2:30', isMe: false },
        { text: '도움이 필요하시면 언제든 말씀해주세요.', time: '오후 2:31', isMe: false },
        { text: '네, 감사합니다!', time: '오후 2:32', isMe: true },
      ],
      room2: [
        { text: '게임 재미있네요!', time: '오후 2:25', isMe: false },
        { text: '네, 정말 재미있어요!', time: '오후 2:26', isMe: true },
      ],
      room3: [
        { text: '다음에 또 같이 해요', time: '오후 2:20', isMe: false },
        { text: '좋아요!', time: '오후 2:21', isMe: true },
      ],
    };
    return messages[chatId] || [];
  };

  return (
    <GameContainerWrapper onClick={handleScreenClick} backgroundImage={backgroundImage}>
      <BottomFixedArea>
        <PhoneIcon 
          src={phoneIcon} 
          alt="Phone Icon" 
          onClick={handlePhoneClick}
        />
        <MonologueButton onClick={startMonologue}>
          💭
        </MonologueButton>
        <ResetButton onClick={handleResetGame}>
          🔄
        </ResetButton>
      </BottomFixedArea>
      
      {isChatOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatTitle>
              {selectedChat ? (
                <>
                  <BackButton onClick={handleBackToList}>←</BackButton>
                  💬 {chatRooms.find(room => room.id === selectedChat)?.name}
                </>
              ) : (
                '💬 채팅방 목록'
              )}
            </ChatTitle>
          </ChatHeader>
          <ChatContent>
            {!selectedChat ? (
              <ChatRoomList>
                {chatRooms.map((room) => (
                  <ChatRoomItem 
                    key={room.id} 
                    onClick={() => handleChatSelect(room.id)}
                    hasUnread={room.unread > 0}
                  >
                    <RoomAvatar>👤</RoomAvatar>
                    <RoomInfo>
                      <RoomName>{room.name}</RoomName>
                      <LastMessage>{room.lastMessage}</LastMessage>
                    </RoomInfo>
                    <RoomMeta>
                      <RoomTime>{room.time}</RoomTime>
                      {room.unread > 0 && <UnreadBadge>{room.unread}</UnreadBadge>}
                    </RoomMeta>
                  </ChatRoomItem>
                ))}
              </ChatRoomList>
            ) : (
              <>
                <MessageList>
                  {getChatMessages(selectedChat).map((message, index) => (
                    <MessageItem key={index} isMe={message.isMe}>
                      <MessageText>{message.text}</MessageText>
                      <MessageTime>{message.time}</MessageTime>
                    </MessageItem>
                  ))}
                </MessageList>
                <MessageInput>
                  <InputField placeholder="메시지를 입력하세요..." />
                  <SendButton>전송</SendButton>
                </MessageInput>
              </>
            )}
          </ChatContent>
        </ChatWindow>
      )}
      
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

const ChatWindow = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
  background: #1a1a1a;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  z-index: 1000;
`;

const ChatHeader = styled.div`
  background: #333;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const ChatTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 16px;
`;


const ChatContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  overflow: hidden;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 15px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-right: 10px;
  padding: 4px;
  
  &:hover {
    background: #555;
    border-radius: 4px;
  }
`;

const ChatRoomList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatRoomItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2a2a2a;
  }
  
  ${props => props.hasUnread && `
    background: #1a2a3a;
  `}
`;

const RoomAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  color: #888;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoomMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const RoomTime = styled.div`
  color: #888;
  font-size: 11px;
`;

const UnreadBadge = styled.div`
  background: #667eea;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  min-width: 16px;
  text-align: center;
`;

const MessageItem = styled.div`
  margin-bottom: 10px;
  padding: 8px 12px;
  background: ${props => props.isMe ? '#667eea' : '#2a2a2a'};
  border-radius: 8px;
  align-self: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  max-width: 80%;
  margin-left: ${props => props.isMe ? 'auto' : '0'};
  margin-right: ${props => props.isMe ? '0' : 'auto'};
`;

const MessageText = styled.div`
  color: white;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
`;

const MessageTime = styled.div`
  color: ${props => props.isMe ? '#ccc' : '#888'};
  font-size: 12px;
`;

const MessageInput = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const InputField = styled.input`
  flex: 1;
  padding: 10px;
  background: #333;
  border: 1px solid #555;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  padding: 10px 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  
  &:hover {
    background: #5a6fd8;
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
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
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
