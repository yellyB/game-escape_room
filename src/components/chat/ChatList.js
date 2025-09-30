import React, { useMemo } from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';
import ChatHeader from './ChatHeader';
import { useFlowManager } from '../../contexts/FlowContext';

export default function ChatList({ onChatSelect }) {
  const {
    getChatAvailableCharacters,
    getChatsByOpponentId,
    moveNextStep,
    chatData,
  } = useFlowManager();

  const chatAvailableCharacters = getChatAvailableCharacters();

  const getUnreadCount = useMemo(() => {
    const unreadCounts = {};
    chatData.forEach(chat => {
      const unreadCount = chat.messages.filter(
        message => message.isRead === false
      ).length;
      unreadCounts[chat.key] = unreadCount;
    });
    return unreadCounts;
  }, [chatData]);

  return (
    <ChatListContainer>
      <ChatHeader title="채팅방 목록" />
      <ChatContent>
        <ChatRoomList>
          <div style={{ color: 'white' }} onClick={() => moveNextStep()}>
            moveNextStep
          </div>
          <div style={{ color: 'white' }}>chatData</div>
          {chatAvailableCharacters.map(room => {
            const unreadCount = getUnreadCount[room.id] || 0;
            const lastMessage = getChatsByOpponentId(room.id)?.at(-1);

            return (
              <ChatRoomItem
                key={room.id}
                onClick={() => onChatSelect(room.id)}
                hasUnread={!!unreadCount}
              >
                <RoomAvatar>👤</RoomAvatar>
                <RoomInfo>
                  <RoomName>{room.name}</RoomName>
                  <LastMessage>
                    {!!unreadCount
                      ? '새로운 메시지가 있습니다'
                      : lastMessage?.message}
                  </LastMessage>
                </RoomInfo>
                <RoomMeta>
                  {!!unreadCount && <UnreadBadge>{unreadCount}</UnreadBadge>}
                </RoomMeta>
              </ChatRoomItem>
            );
          })}
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

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatRoomList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ChatRoomItem = styled.div`
  background: ${props =>
    props.hasUnread ? colors.primarySecondary : colors.darkGray};
  border: ${props =>
    props.hasUnread ? 'none' : `1px solid ${colors.primarySecondary}`};
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 70px;
  border-left: ${props =>
    props.hasUnread ? `4px solid ${colors.primary}` : 'none'};

  &:hover {
    background: ${props =>
      props.hasUnread ? colors.primarySecondary : colors.lightGraySecondary};
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

const UnreadBadge = styled.div`
  background: ${colors.primary};
  color: ${colors.white};
  border-radius: 12px;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: bold;
  min-width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
