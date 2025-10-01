import React, { useState } from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';

export default function ChatContainer() {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);

  const handleChatSelect = async opponentId => {
    setSelectedChatRoomId(opponentId);
  };

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
