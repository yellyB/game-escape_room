import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import ChatHeader from './ChatHeader';
import { useFlowManager } from '../../contexts/FlowContext';

const NEW_MESSAGE_DELAY = 500;
const TYPING_DELAY = 50;
const INITIAL_INPUT_MESSAGE = { id: 0, message: '', isSentFromMe: true };

export default function ChatRoom({ opponentId, onBack }) {
  const {
    currStepData,
    chatData,
    moveNextStep,
    turnAllMessagesAsRead,
    updateChatData,
  } = useFlowManager();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const [inputMessageData, setInputMessageData] = useState(
    INITIAL_INPUT_MESSAGE
  );
  const [isOpponentTyping, setIsOpponentTyping] = useState(true);
  const [visibleCount, setVisibleCount] = useState(0);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);

  const { instantItems, delayedItems } = useMemo(() => {
    const instant = [];
    const delayed = [];
    let hasStartedDelay = false;

    for (const message of displayMessages) {
      if (message.isRead && !hasStartedDelay) {
        instant.push(message);
      } else {
        // NOTE: 내가 보낸 메시지 순서 관리를 위해 아래와 같이 처리(한번 딜레이에 넣기 시작하면 그 이후를 전부 딜레이에 넣음)
        if (!hasStartedDelay) {
          hasStartedDelay = true;
        }
        delayed.push(message);
      }
    }

    return { instantItems: instant, delayedItems: delayed };
  }, [displayMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    updateChatData(opponentId, inputMessageData);
    setInputMessageData(INITIAL_INPUT_MESSAGE);
    setIsSendButtonDisabled(true);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (currStepData.type !== 'chatFromMe') return;
    const inputPendingMessage = currStepData.data?.messages[0];
    if (!inputPendingMessage) return;

    const { message, ...rest } = inputPendingMessage;

    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setInputMessageData({
          ...rest,
          message: message.slice(0, currentIndex + 1),
        });
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsSendButtonDisabled(false);
      }
    }, TYPING_DELAY);

    return () => clearInterval(typeInterval);
  }, [currStepData]);

  useEffect(() => {
    const chatMessages = chatData.find(
      chat => chat.key === opponentId
    )?.messages;
    if (chatMessages && chatMessages.length > 0) {
      setDisplayMessages(prev => {
        // 새로운 메시지들로 업데이트 (기존 것 교체, 새로운 것 추가)
        const updatedMessages = [...prev];

        chatMessages.forEach(newMessage => {
          const existingIndex = updatedMessages.findIndex(
            msg => msg.id === newMessage.id
          );
          if (existingIndex !== -1) {
            // 기존 메시지가 있으면 교체
            updatedMessages[existingIndex] = newMessage;
          } else {
            // 새로운 메시지면 추가
            updatedMessages.push(newMessage);
          }
        });

        return updatedMessages;
      });
    }
  }, [chatData, opponentId, currStepData]);

  useEffect(() => {
    if (delayedItems.length === 0) {
      setIsOpponentTyping(false);
      return;
    }

    if (visibleCount > delayedItems.length) {
      setIsOpponentTyping(false);
      moveNextStep();
      return;
    } else {
      console.log('isOpponentTyping', visibleCount, delayedItems.length);
      setIsOpponentTyping(true);
    }

    timerRef.current = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, NEW_MESSAGE_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [visibleCount, delayedItems.length]);

  useEffect(() => {
    return () => {
      turnAllMessagesAsRead(opponentId);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [visibleCount]);

  return (
    <ChatRoomContainer>
      <ChatHeader title="채팅방" onBack={onBack} />

      <div style={{ color: 'white' }} onClick={() => moveNextStep()}>
        moveNextStep
      </div>
      <div
        style={{ color: 'white' }}
        onClick={() => console.log(instantItems, delayedItems, displayMessages)}
      >
        chatData
      </div>
      <ChatContent>
        {instantItems.map(message => (
          <MessageBubble key={message.id} isSentFromMe={message.isSentFromMe}>
            {message.message}
          </MessageBubble>
        ))}

        {delayedItems.slice(0, visibleCount).map(message => (
          <MessageBubble key={message.id} isSentFromMe={message.isSentFromMe}>
            {message.message}
          </MessageBubble>
        ))}

        {isOpponentTyping && (
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
          value={inputMessageData.message}
          onChange={e => setInputMessageData(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={'메시지 입력'}
          rows={1}
          spellCheck={false}
          disabled={!!inputMessageData}
        />
        <SendButton onClick={handleSend} disabled={isSendButtonDisabled}>
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
    props.isSentFromMe ? colors.primary : colors.lightGraySecondary};
  color: ${colors.white};
  padding: 12px 16px;
  border-radius: 16px;
  max-width: 70%;
  align-self: ${props => (props.isSentFromMe ? 'flex-end' : 'flex-start')};
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
