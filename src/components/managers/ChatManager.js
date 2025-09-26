import { useState, useEffect } from 'react';
import { getCharacters, getDialogue } from '../../services/api';
import { STORAGE_KEYS, storageUtils } from '../../utils/storage';

export default function ChatManager() {
  const [characters, setCharacters] = useState([]);
  const [dialogueData, setDialogueData] = useState({});
  const [hasLocalData, setHasLocalData] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);

  // 캐릭터 데이터 로딩
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // 먼저 로컬 스토리지에서 캐릭터 데이터 확인
        const savedCharacters = storageUtils.get(STORAGE_KEYS.CHARACTERS, []);

        if (savedCharacters.length > 0) {
          setCharacters(savedCharacters);
          console.log('로컬 저장된 캐릭터 데이터 사용:', savedCharacters);
          return;
        }

        // 로컬 스토리지에 데이터가 없으면 API에서 가져오기
        const charactersData = await getCharacters();
        setCharacters(charactersData);

        // API 데이터를 로컬 스토리지에 저장
        storageUtils.set(STORAGE_KEYS.CHARACTERS, charactersData);

        console.log('받은 캐릭터 데이터:', charactersData);
      } catch (error) {
        console.error('캐릭터 데이터 로딩 실패:', error);
      }
    };

    fetchCharacters();
  }, []);

  // 채팅 선택 처리
  const handleChatSelect = async chatId => {
    setSelectedChat(chatId);

    // 안읽은 메시지 플래그 해제
    storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(chatId), false);

    // 1. 먼저 로컬 스토리지에서 기존 데이터 확인
    const savedMessages = storageUtils.get(
      STORAGE_KEYS.CHAT_MESSAGE(chatId),
      []
    );

    // 2. 로컬 스토리지 데이터 여부 저장
    const hasLocal = savedMessages.length > 0;
    setHasLocalData(prev => ({
      ...prev,
      [chatId]: hasLocal,
    }));

    // 3. 로컬 데이터가 있으면 API 호출하지 않음
    if (hasLocal) {
      return;
    }

    // 4. 로컬 데이터가 없으면 API에서 대화 데이터 가져오기
    try {
      const dialogue = await getDialogue({
        characterId: chatId,
        partNumber: 1,
      });
      setDialogueData(prev => ({
        ...prev,
        [chatId]: dialogue,
      }));

      // 안읽은 메시지 플래그 설정
      storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(chatId), true);

      console.log(`${chatId} 캐릭터의 대화 데이터:`, dialogue);
    } catch (error) {
      console.error(`${chatId} 캐릭터 대화 데이터 로딩 실패:`, error);
    }
  };

  // 사용자 메시지 전송
  const handleSendMessage = (chatId, messageText) => {
    const newMessage = {
      id: Date.now(),
      text: messageText,
      isOwn: true,
      timestamp: Date.now(),
    };

    // 로컬 스토리지에 사용자 메시지 추가
    const messages = storageUtils.get(STORAGE_KEYS.CHAT_MESSAGE(chatId), []);
    messages.push(newMessage);
    storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(chatId), messages);
  };

  // API에서 받은 캐릭터 데이터를 ChatList 형식으로 변환
  const getChatRoomsFromCharacters = () => {
    return characters
      .filter(character => {
        // 대화 데이터가 있거나 안읽은 메시지가 있는 캐릭터만 표시
        const hasMessages =
          storageUtils.get(STORAGE_KEYS.CHAT_MESSAGE(character.id), []).length >
          0;
        const hasUnreadMessages = storageUtils.get(
          STORAGE_KEYS.UNREAD_MESSAGE(character.id),
          false
        );

        return hasMessages || hasUnreadMessages;
      })
      .map(character => {
        // 로컬 스토리지에서 안읽은 메시지 플래그 확인
        const hasUnreadMessages = storageUtils.get(
          STORAGE_KEYS.UNREAD_MESSAGE(character.id),
          false
        );

        return {
          id: character.id,
          name: character.name,
          lastMessage: hasUnreadMessages
            ? '새로운 메시지가 있습니다'
            : '대화를 시작하세요',
          time: '방금 전',
          unread: hasUnreadMessages ? 1 : 0,
        };
      });
  };

  // 대화 데이터를 가져오는 함수
  const getChatMessagesForRoom = chatId => {
    // 로컬 스토리지에서 메시지 불러오기
    const savedMessages = storageUtils.get(
      STORAGE_KEYS.CHAT_MESSAGE(chatId),
      []
    );

    // 로컬 스토리지에 데이터가 있으면 사용 (한번에 표시)
    if (savedMessages.length > 0) {
      return savedMessages;
    }

    // 로컬 스토리지에 데이터가 없고 API 데이터가 있으면 사용 (순차적 표시)
    if (dialogueData[chatId]) {
      const apiMessages = dialogueData[chatId].messages.map(msg => ({
        id: msg.id,
        text: msg.text,
        isOwn: false,
        timestamp: Date.now(),
      }));
      return apiMessages;
    }

    return [];
  };

  // 로컬 스토리지 데이터 삭제 함수
  const clearLocalStorageData = () => {
    // 대화 데이터 삭제
    characters.forEach(character => {
      storageUtils.remove(STORAGE_KEYS.CHAT_MESSAGE(character.id));
      // 안읽은 메시지 플래그도 삭제
      storageUtils.remove(STORAGE_KEYS.UNREAD_MESSAGE(character.id));
    });

    // 캐릭터 데이터 삭제
    storageUtils.remove(STORAGE_KEYS.CHARACTERS);
  };

  return {
    // 상태
    characters,
    selectedChat,
    hasLocalData,

    // 함수들
    handleChatSelect,
    handleSendMessage,
    getChatRoomsFromCharacters,
    getChatMessagesForRoom,
    clearLocalStorageData,
  };
}
