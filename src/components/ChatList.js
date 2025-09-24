import React from 'react';
import styled from 'styled-components';
import colors from '../styles/colors';

export default function ChatList({ chatRooms, onChatSelect }) {
  return (
    <ChatListContainer>
      <ChatHeader>
        <ChatTitle>채팅방 목록</ChatTitle>
      </ChatHeader>
      <ChatContent>
        <ChatRoomList>
          {chatRooms.map(room => (
            <ChatRoomItem
              key={room.id}
              onClick={() => onChatSelect(room.id)}
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
      </ChatContent>
    </ChatListContainer>
  );
}

const ChatListContainer = styled.div`
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

const ChatHeader = styled.div`
  background: ${colors.darkGray};
  padding: 20px;
  border-bottom: 1px solid ${colors.lightGray};
  flex-shrink: 0;
`;

const ChatTitle = styled.h2`
  color: ${colors.white};
  margin: 0;
  font-size: 20px;
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const ChatRoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ChatRoomItem = styled.div`
  background: ${props =>
    props.hasUnread ? colors.primarySecondary : colors.darkGray};
  border: ${props =>
    props.hasUnread ? 'none' : `1px solid ${colors.primarySecondary}`};
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 60px;

  &:hover {
    background: ${props =>
      props.hasUnread ? colors.primarySecondary : colors.lightGray};
    border-color: ${props =>
      props.hasUnread ? 'transparent' : colors.lightGray};
  }
`;

const RoomAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: ${colors.lightGray};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RoomName = styled.div`
  color: ${colors.white};
  font-size: 16px;
  font-weight: bold;
`;

const LastMessage = styled.div`
  color: ${colors.lightGray};
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoomMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const RoomTime = styled.div`
  color: ${colors.lightGray};
  font-size: 12px;
`;

const UnreadBadge = styled.div`
  background: ${colors.primary};
  color: ${colors.white};
  border-radius: 12px;
  padding: 4px 8px;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
`;
