import React, { useState, useEffect, useMemo } from 'react';
import { useFlowManager } from '../../contexts/FlowContext';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

export default function ChatContainer() {
  const { chatData, currStepData, characters } = useFlowManager();

  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [shownToastKeys, setShownToastKeys] = useState(
    new Set('friend-sister')
  );

  const hasUnreadFromOtherChats = useMemo(() => {
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
      hasUnreadFromOtherChats &&
      !!selectedChatRoomId &&
      currStepData.type === 'chatFromOpponent' &&
      currStepData.data.key !== selectedChatRoomId
    ) {
      const toastKey = `${currStepData.data.key}-${selectedChatRoomId}`;
      console.log('toastKey:', toastKey, shownToastKeys);

      // todo: 로컬 스토리지 저장 시스템 구현하고 나면, 이 부분 어떻게 처리할지 고민하기
      if (!shownToastKeys.has(toastKey)) {
        const newMessageSender = characters.find(
          char => char.id === currStepData.data.key
        );

        window.message(`${newMessageSender.name}의 새로운 메시지 도착`);
        setShownToastKeys(prev => new Set([...prev, toastKey]));
      }
    }
  }, [hasUnreadFromOtherChats, selectedChatRoomId, currStepData]);

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
