import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import ChatHeader from './ChatHeader';

export default function ChatRoom({ chatId, messages, onBack, onSendMessage }) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(chatId, inputMessage);
      setInputMessage('');
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
        {messages.map((message, index) => (
          <MessageBubble key={index} isOwn={message.isOwn}>
            {message.text}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </ChatContent>

      <MessageInput>
        <InputField
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          rows={1}
          spellCheck={false}
        />
        <SendButton onClick={handleSend} disabled={!inputMessage.trim()}>
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
