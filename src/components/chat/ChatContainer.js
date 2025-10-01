import React, { useState, useEffect, useMemo } from 'react';
import { useFlowManager } from '../../contexts/FlowContext';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

export default function ChatContainer() {
  const { chatData, currStepData } = useFlowManager();

  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [shownToastKeys, setShownToastKeys] = useState(new Set());

  const hasUnreadMessagesExceptCurrChat = useMemo(() => {
    return chatData.some(chat => {
      if (chat.key !== selectedChatRoomId) {
        return chat.messages.some(message => !message.isRead);
      }
      return false;
    });
  }, [chatData, selectedChatRoomId]);

  const handleChatSelect = async opponentId => {
    setSelectedChatRoomId(opponentId);
  };

  useEffect(() => {
    if (
      hasUnreadMessagesExceptCurrChat &&
      !!selectedChatRoomId &&
      currStepData.type === 'chatFromOpponent' &&
      currStepData.data.key !== selectedChatRoomId
    ) {
      const toastKey = `${currStepData.data.key}-${selectedChatRoomId}`;

      // todo: 로컬 스토리지 저장 시스템 구현하고 나면, 이 부분 어떻게 처리할지 고민하기
      if (!shownToastKeys.has(toastKey)) {
        window.message('새로운 메시지 도착');
        setShownToastKeys(prev => new Set([...prev, toastKey]));
      }
    }
  }, [hasUnreadMessagesExceptCurrChat, selectedChatRoomId, currStepData]);

  return (
    <>
      {selectedChatRoomId ? (
        <ChatRoom
          opponentId={selectedChatRoomId}
          onBack={() => setSelectedChatRoomId(null)}
        />
      ) : (
        <ChatList onChatSelect={handleChatSelect} />
      )}
    </>
  );
}
