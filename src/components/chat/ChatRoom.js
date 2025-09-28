import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import ChatHeader from './ChatHeader';
import { STORAGE_KEYS, storageUtils } from '../../utils/storage';
import { useFlowManager } from '../../contexts/FlowContext';

export default function ChatRoom({
  opponentId,
  messages,
  onBack,
  onSendMessage,
  isLocalData = false,
  isFirstRead = false,
  onMessageRead,
}) {
  const { getChatMessagesByOpponentId } = useFlowManager();

  const [inputMessage, setInputMessage] = useState('');
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 채팅방이 변경될 때만 초기화
  // useEffect(() => {
  //   setDisplayedMessages([]);
  //   setCurrentMessageIndex(0);
  //   setIsWaitingForInput(false);
  //   setIsTyping(false);
  //   setInputMessage('');
  // }, [opponentId]);

  // // 메시지가 변경될 때 처리
  // useEffect(() => {
  //   // 로컬 데이터인 경우 처리
  //   if (isLocalData && messages.length > 0) {
  //     // if (myMessages.length > 0) {
  //     //   // 내 메시지가 있으면 순차적으로 표시하도록 처리
  //     //   setDisplayedMessages([]);
  //     //   setCurrentMessageIndex(0);
  //     //   setIsTyping(false);
  //     //   setIsWaitingForInput(false);
  //     // } else {
  //     // 내 메시지가 없으면 기존 메시지들을 한번에 표시
  //     setDisplayedMessages(messages);
  //     const lastMessage = messages[messages.length - 1];
  //     if (lastMessage && lastMessage.isOwn) {
  //       setIsWaitingForInput(true);
  //       setTimeout(() => {
  //         inputRef.current?.focus();
  //       }, 500);
  //     }
  //     // 로컬 데이터인 경우 읽지않은 메시지가 있으면 읽음 처리
  //     const hasUnreadMessages = messages.some(msg => msg.isUnread);
  //     if (hasUnreadMessages && onMessageRead) {
  //       onMessageRead(opponentId);
  //     }
  //     // }
  //   }
  // }, [messages, isLocalData, opponentId, onMessageRead]);

  // // 최초 읽을 때 입력중 표시 (읽지않은 메시지가 있을 때만)
  // useEffect(() => {
  //   if (isFirstRead && messages.length > 0 && !isLocalData) {
  //     const unreadMessages = messages.filter(msg => msg.isUnread);
  //     if (unreadMessages.length > 0) {
  //       setIsTyping(true);
  //       // 2초 후 입력중 표시 제거하고 메시지 표시 시작
  //       setTimeout(() => {
  //         setIsTyping(false);
  //       }, 2000);
  //     }
  //   }
  // }, [isFirstRead, messages.length, isLocalData, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // // 메시지를 줄바꿈으로 분리하는 함수
  // const splitMessageIntoBubbles = text => {
  //   return text.split('\n').filter(line => line.trim() !== '');
  // };

  // // 읽지않은 메시지와 내 메시지를 순차적으로 표시
  // useEffect(() => {
  //   // 로컬 데이터이거나 API 데이터인 경우 모두 처리
  //   if (true) {
  //     // 읽지않은 메시지와 내 메시지 필터링
  //     const unreadMessages = messages.filter(msg => msg.isUnread);
  //     const myMessages = messages.filter(
  //       msg => msg.isOwn && (msg.isUnread === undefined || !msg.isUnread)
  //     );

  //     // 이미 표시된 원본 메시지 ID들 (버블 ID가 아닌 원본 ID)
  //     const displayedOriginalIds = displayedMessages
  //       .map(msg => msg.originalId || msg.id)
  //       .filter((id, index, arr) => arr.indexOf(id) === index); // 중복 제거

  //     // 아직 표시되지 않은 메시지들만 필터링
  //     const newUnreadMessages = unreadMessages.filter(
  //       msg => !displayedOriginalIds.includes(msg.id)
  //     );
  //     const newMyMessages = myMessages.filter(
  //       msg => !displayedOriginalIds.includes(msg.id)
  //     );
  //     const allNewMessages = [...newUnreadMessages, ...newMyMessages];

  //     // eslint-disable-next-line no-console
  //     console.log('💬 ChatRoom 메시지 필터링:', {
  //       totalMessages: messages.length,
  //       unreadMessages: unreadMessages.length,
  //       myMessages: myMessages.length,
  //       newUnreadMessages: newUnreadMessages.length,
  //       newMyMessages: newMyMessages.length,
  //       allNewMessages: allNewMessages.length,
  //       displayedMessages: displayedMessages.length,
  //       displayedOriginalIds: displayedOriginalIds,
  //     });
  //     // 새로 표시할 메시지가 있고, 아직 표시하지 않은 메시지가 있을 때만 처리
  //     if (
  //       allNewMessages.length > 0 &&
  //       currentMessageIndex < allNewMessages.length
  //     ) {
  //       const currentMessage = allNewMessages[currentMessageIndex];
  //       const currentPartNumber = currentMessage.partNumber; // 내 메시지는 partNumber가 없을 수 있음

  //       if (!currentPartNumber) return;

  //       // 새로 표시할 메시지가 있으면 먼저 입력중 표시
  //       setIsTyping(true);

  //       // 입력중 표시 후 메시지 표시 (1초 딜레이)
  //       setTimeout(() => {
  //         setIsTyping(false);

  //         // 순차적 메시지 표시
  //         const messageBubbles = splitMessageIntoBubbles(currentMessage.text);

  //         // 각 줄을 개별 버블로 추가
  //         messageBubbles.forEach((bubbleText, bubbleIndex) => {
  //           setDisplayedMessages(prev => [
  //             ...prev,
  //             {
  //               ...currentMessage,
  //               text: bubbleText,
  //               id: `${currentMessageIndex}-${bubbleIndex}`,
  //               originalId: currentMessage.id, // 원본 메시지 ID 보존
  //             },
  //           ]);

  //           // 마지막 버블이면 다음 메시지로 진행
  //           if (bubbleIndex === messageBubbles.length - 1) {
  //             const isLastUnreadMessageInPart =
  //               currentMessageIndex === allNewMessages.length - 1 ||
  //               allNewMessages[currentMessageIndex + 1].partNumber !==
  //                 currentPartNumber;
  //             if (isLastUnreadMessageInPart) {
  //               // 현재 파트의 마지막 읽지않은 메시지면 파트 완료 처리
  //               setTimeout(() => {
  //                 storageUtils.set(
  //                   STORAGE_KEYS.CHAT_MESSAGE(opponentId),
  //                   messages
  //                 );
  //                 setCurrentMessageIndex(prev => prev + 1);
  //                 // 현재 파트의 모든 읽지않은 메시지를 읽었을 때 부모 컴포넌트에 알림
  //                 if (onMessageRead) {
  //                   onMessageRead(opponentId);
  //                 }
  //               }, 200); // 즉시 저장
  //             } else {
  //               // 같은 파트 내의 다음 읽지않은 메시지로 진행
  //               setTimeout(() => {
  //                 setCurrentMessageIndex(prev => prev + 1);
  //               }, 1500); // 1.5초 대기
  //             }
  //           }
  //         });
  //       }, 1000); // 1초 입력중 표시
  //     }
  //   }
  // }, [
  //   currentMessageIndex,
  //   messages,
  //   isLocalData,
  //   opponentId,
  //   onMessageRead,
  //   displayedMessages,
  // ]);

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(opponentId, inputMessage);
      setInputMessage('');
      setIsWaitingForInput(false);
      // 메시지 전송 후 다음 메시지로 진행
      setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 1000);
    }
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatRoomContainer>
      <ChatHeader title="채팅방" onBack={onBack} />

      <div
        style={{ color: 'white' }}
        onClick={() =>
          console.log(
            'fsdfdsfsdfsdfdsfs:',
            getChatMessagesByOpponentId(opponentId)
          )
        }
      >
        testestets
      </div>
      <ChatContent>
        {getChatMessagesByOpponentId(opponentId).map(message => {
          console.log('message:', message);
          return (
            <MessageBubble key={message.id} isOwn={message.isSentFromMe}>
              {message.message}
            </MessageBubble>
          );
        })}

        {isTyping && (
          <TypingIndicator>
            <TypingDots>
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </TypingDots>
          </TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </ChatContent>

      <MessageInput>
        <InputField
          ref={inputRef}
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            isWaitingForInput
              ? '답장을 입력하세요...'
              : '메시지를 입력하세요...'
          }
          rows={1}
          spellCheck={false}
          disabled={!isWaitingForInput}
        />
        <SendButton
          onClick={handleSend}
          disabled={!inputMessage.trim() || !isWaitingForInput}
        >
          전송
        </SendButton>
      </MessageInput>
    </ChatRoomContainer>
  );
}

const ChatRoomContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
  background: ${colors.darkGray};
  z-index: 1500;
  display: flex;
  flex-direction: column;
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div`
  background: ${props =>
    props.isOwn ? colors.primary : colors.lightGraySecondary};
  color: ${colors.white};
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 70%;
  align-self: ${props => (props.isOwn ? 'flex-end' : 'flex-start')};
  word-wrap: break-word;
`;

const MessageInput = styled.div`
  background: ${colors.darkGray};
  padding: 18px 12px;
  border-top: 1px solid ${colors.lightGray};
  flex-shrink: 0;
  display: flex;
  gap: 10px;
`;

const InputField = styled.textarea`
  flex: 1;
  background: ${colors.darkGray};
  border-radius: 12px;
  border-color: ${colors.lightGraySecondary};
  padding: 8px 12px;
  color: ${colors.white};
  font-size: 16px;
  resize: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  line-height: 1.4;

  &:focus {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${colors.lightGray};
  }
`;

const SendButton = styled.button`
  background: ${colors.primary};
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: ${colors.white};
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;

  &:disabled {
    background: ${colors.lightGraySecondary};
    cursor: not-allowed;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: ${colors.lightGraySecondary};
  border-radius: 16px;
  max-width: 70%;
  align-self: flex-start;
  margin-bottom: 12px;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;

  span {
    width: 8px;
    height: 8px;
    background: ${colors.lightGray};
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }

    &:nth-child(3) {
      animation-delay: 0s;
    }
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
