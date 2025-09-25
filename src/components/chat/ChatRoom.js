import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import ChatHeader from './ChatHeader';

export default function ChatRoom({ chatId, messages, onBack, onSendMessage }) {
  const [inputMessage, setInputMessage] = useState('');
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 채팅방이 변경되거나 메시지가 변경될 때 초기화
  useEffect(() => {
    setDisplayedMessages([]);
    setCurrentMessageIndex(0);
    setIsWaitingForInput(false);
    setIsTyping(false);
    setInputMessage('');
  }, [chatId, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지를 줄바꿈으로 분리하는 함수
  const splitMessageIntoBubbles = text => {
    return text.split('\n').filter(line => line.trim() !== '');
  };

  // 순차적으로 메시지 표시
  useEffect(() => {
    if (currentMessageIndex < messages.length) {
      const currentMessage = messages[currentMessageIndex];
      const messageBubbles = splitMessageIntoBubbles(currentMessage.text);

      // 타이핑 시작
      setIsTyping(true);

      // 각 줄을 개별 버블로 추가
      messageBubbles.forEach((bubbleText, bubbleIndex) => {
        setTimeout(() => {
          setDisplayedMessages(prev => [
            ...prev,
            {
              ...currentMessage,
              text: bubbleText,
              id: `${currentMessageIndex}-${bubbleIndex}`,
            },
          ]);

          // 마지막 버블이면 다음 메시지로 진행
          if (bubbleIndex === messageBubbles.length - 1) {
            setTimeout(() => {
              setCurrentMessageIndex(prev => prev + 1);
            }, 1500); // 1.5초 대기
          }
        }, bubbleIndex * 2000); // 각 버블 간 간격
      });
    } else {
      // 모든 메시지가 표시되었을 때
      setIsTyping(false);
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.isOwn) {
        setIsWaitingForInput(true);
        // 입력창에 자동으로 포커스
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
    }
  }, [currentMessageIndex, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [displayedMessages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(chatId, inputMessage);
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

      <ChatContent>
        {displayedMessages.map((message, index) => (
          <MessageBubble key={message.id || index} isOwn={message.isOwn}>
            {message.text}
          </MessageBubble>
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
