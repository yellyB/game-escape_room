import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import ChatHeader from './ChatHeader';
import { useFlowManager } from '../../contexts/FlowContext';

const NEW_MESSAGE_DELAY = 500;

export default function ChatRoom({
  opponentId,
  // displayMessages,
  onBack,
  onSendMessage,
}) {
  const { readChats, moveNextStep, turnToMessagesAsRead } = useFlowManager();

  const [inputMessage, setInputMessage] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(0);
  const [displayMessages, setDisplayMessages] = useState([]);
  const timerRef = useRef(null);

  const { instantItems, delayedItems } = useMemo(() => {
    const instant = [];
    const delayed = [];

    for (const message of displayMessages) {
      if (message.isRead) {
        instant.push(message);
      } else {
        delayed.push(message);
      }
    }

    return { instantItems: instant, delayedItems: delayed };
  }, [displayMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  useEffect(() => {
    const chatMessages = readChats.find(
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
  }, [readChats, opponentId]);

  useEffect(() => {
    if (delayedItems.length === 0) {
      setIsTyping(false);
      return;
    }

    if (visibleCount >= delayedItems.length) {
      setIsTyping(false);
      return;
    } else {
      setIsTyping(true);
    }

    timerRef.current = setTimeout(() => {
      setVisibleCount(prev => prev + 1);
    }, NEW_MESSAGE_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [visibleCount, delayedItems.length]);

  useEffect(() => {
    return () => {
      turnToMessagesAsRead(opponentId);
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
      <ChatContent>
        {instantItems.map(message => (
          <MessageBubble key={message.id}>{message.message}</MessageBubble>
        ))}

        {delayedItems.slice(0, visibleCount).map(message => (
          <MessageBubble key={message.id}>{message.message}</MessageBubble>
        ))}

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
