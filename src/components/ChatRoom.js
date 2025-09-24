import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ChatRoomContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 80px;
  background: #1a1a1a;
  z-index: 1500;
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #333;
  }
`;

const ChatTitle = styled.h2`
  color: white;
  margin: 0;
  font-size: 20px;
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MessageBubble = styled.div`
  background: ${props => props.isOwn ? '#007bff' : '#2a2a2a'};
  color: white;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
`;

const MessageInput = styled.div`
  background: #2a2a2a;
  padding: 20px;
  border-top: 1px solid #333;
  flex-shrink: 0;
  display: flex;
  gap: 10px;
`;

const InputField = styled.textarea`
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 20px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  resize: none;
  min-height: 20px;
  max-height: 100px;
  font-family: inherit;
  line-height: 1.4;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  background: #007bff;
  border: none;
  border-radius: 20px;
  padding: 12px 20px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
  
  &:hover {
    background: #0056b3;
  }
  
  &:disabled {
    background: #333;
    cursor: not-allowed;
  }
`;

export default function ChatRoom({ 
  chatId, 
  messages, 
  onBack, 
  onSendMessage 
}) {
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatRoomContainer>
      <ChatHeader>
        <BackButton onClick={onBack}>←</BackButton>
        <ChatTitle>채팅방</ChatTitle>
      </ChatHeader>
      
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
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={!inputMessage.trim()}>
          전송
        </SendButton>
      </MessageInput>
    </ChatRoomContainer>
  );
}
