import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import { getDialogue } from '../../services/api';
import { STORAGE_KEYS, storageUtils } from '../../utils/storage';
import { useFlowManager } from '../../contexts/FlowContext';

export default function ChatContainer({
  currentChapter,
  currentStepIndex,
  goToNextStep,
}) {
  const [selectedChatRoomId, setSelectedChatRoomId] = useState(null);
  const [availableChats, setAvailableChats] = useState([]);
  const [hasLocalData, setHasLocalData] = useState({});
  const [dialogueData, setDialogueData] = useState({});

  // 메시지 전송 처리
  const handleSendMessage = (opponentId, message) => {
    const newMessage = {
      text: message,
      isOwn: true,
      timestamp: Date.now(),
    };

    // 로컬 스토리지에 사용자 메시지 추가
    const messages = storageUtils.get(
      STORAGE_KEYS.CHAT_MESSAGE(opponentId),
      []
    );
    messages.push(newMessage);
    storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(opponentId), messages);
  };

  // 채팅방 입장 시 메시지 처리
  const handleChatRoomEntry = async (opponentId, stepData) => {
    const { key, partNumber } = stepData;

    try {
      // API에서 데이터 다시 불러오기 (캐시된 데이터 사용)
      const dialogue = await getDialogue({
        opponentId: key,
        partNumber: partNumber,
      });

      // 기존 대화 내역 가져오기
      const existingMessages = storageUtils.get(
        STORAGE_KEYS.CHAT_MESSAGE(key),
        []
      );

      // 새로운 메시지들을 기존 메시지에 추가 (읽지않음 플래그 포함)
      const newMessages = dialogue.messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        isOwn: false,
        timestamp: Date.now(),
        partNumber: partNumber,
        isUnread: true, // 읽지않음 플래그
      }));

      // 기존 메시지와 새 메시지를 합쳐서 저장
      const allMessages = [...existingMessages, ...newMessages];
      storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(key), allMessages);

      // 안읽은 메시지 플래그 설정
      storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(key), true);

      // eslint-disable-next-line no-console
      console.log(`💾 ${key} 파트 ${partNumber} 메시지 로컬스토리지 저장 완료`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`${key} 채팅방 입장 처리 실패:`, error);
      goToNextStep();
    }
  };

  const handleChatSelect = async opponentId => {
    // 현재 스텝이 chatFromOpponent인 경우 해당 채팅방에 들어갔을 때 처리
    if (
      currentChapter &&
      currentChapter.steps &&
      currentStepIndex >= 0 &&
      currentStepIndex < currentChapter.steps.length &&
      currentChapter.steps[currentStepIndex]?.type === 'chatFromOpponent'
    ) {
      const currentStep = currentChapter.steps[currentStepIndex];
      if (
        currentStep &&
        currentStep.data &&
        currentStep.data.key === opponentId
      ) {
        // 4. 플레이어가 해당 채팅방에 입장했다면, 불러왔던 메시지를 로컬스토리지에 저장
        // eslint-disable-next-line no-console
        console.log(
          `🎯 ${opponentId} 채팅방에 들어감 - 메시지 로컬스토리지 저장 및 순차 표시 시작`
        );
        await handleChatRoomEntry(opponentId, currentStep.data);
        return;
      }
    }

    // 1. 먼저 로컬 스토리지에서 기존 데이터 확인
    const savedMessages = storageUtils.get(
      STORAGE_KEYS.CHAT_MESSAGE(opponentId),
      []
    );

    // 2. 안읽은 메시지가 있는지 확인
    const hasUnreadMessages = storageUtils.get(
      STORAGE_KEYS.UNREAD_MESSAGE(opponentId),
      false
    );

    // 3. 로컬 스토리지 데이터 여부 저장
    const hasLocal = savedMessages.length > 0;
    setHasLocalData(prev => ({
      ...prev,
      [opponentId]: hasLocal,
    }));

    // 4. 안읽은 메시지가 있으면 플래그 해제 (최초 읽음 처리)
    if (hasUnreadMessages) {
      storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(opponentId), false);

      // 채팅방 목록에서 안읽음 상태 업데이트
      setAvailableChats(prev =>
        prev.map(chat =>
          chat.id === opponentId
            ? {
                ...chat,
                unread: 0,
                lastMessage:
                  savedMessages[savedMessages.length - 1]?.text ||
                  '대화를 시작하세요',
              }
            : chat
        )
      );
    }

    // 5. 로컬 스토리지에 데이터가 있으면 API 호출하지 않음
    if (hasLocal) {
      return;
    }

    // 6. 로컬 스토리지에 데이터가 없으면 API에서 가져오기
    if (!dialogueData[opponentId]) {
      try {
        const dialogue = await getDialogue({
          opponentId: opponentId,
          partNumber: 1,
        });
        setDialogueData(prev => ({
          ...prev,
          [opponentId]: dialogue,
        }));

        // 안읽은 메시지 플래그 설정
        storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(opponentId), true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`${opponentId} 캐릭터 대화 데이터 로딩 실패:`, error);
      }
    }

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
        <ChatList
          availableChats={availableChats}
          onChatSelect={handleChatSelect}
        />
      )}
    </>
  );
}
