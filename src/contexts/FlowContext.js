import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { chapters } from '../data/gameFlow';
import { getDialogue } from '../services/api';

const INITIAL_STEP_KEY = { id: 'opening', index: 0 };
const INITIAL_CHARACTERS = [
  {
    id: 'friend',
    name: '수정',
    isChatAvailable: false,
    lastChatDate: null, // NOTE: 현재 저장되는 값은 대화가 시작한 시간이다. 추후 개선 필요 시 작업예정
  },
  {
    id: 'mother',
    name: '엄마',
    isChatAvailable: false,
    lastChatDate: null,
  },
  {
    id: 'colleague',
    name: '민영씨',
    isChatAvailable: false,
    lastChatDate: null,
  },
  {
    id: 'sister',
    name: '여동생',
    isChatAvailable: false,
    lastChatDate: null,
  },
  {
    id: 'future_self',
    name: '미래의 나',
    isChatAvailable: false,
    lastChatDate: null,
  },
];

const FlowContext = createContext();

export function FlowProvider({ children }) {
  const [currStepKey, setCurrStepKey] = useState(INITIAL_STEP_KEY);
  const [characters, setCharacters] = useState(INITIAL_CHARACTERS);
  const [chatData, setChatData] = useState([]);

  const currStepData = useMemo(() => {
    return chapters[currStepKey.id][currStepKey.index];
  }, [currStepKey]);

  const getChatAvailableCharacters = () => {
    return characters.filter(character => character.isChatAvailable);
  };

  const getChatsByOpponentId = opponentId => {
    return chatData.find(chat => chat.key === opponentId)?.messages || [];
  };

  const turnToChatAvailable = useCallback(id => {
    setCharacters(prevCharacters => {
      const updated = prevCharacters.map(character => {
        return character.id === id
          ? { ...character, isChatAvailable: true }
          : character;
      });
      return updated;
    });
  }, []);

  const markMessagesAsRead = useCallback((opponentId, messageId) => {
    setChatData(prevChats => {
      return prevChats.map(chat => {
        if (chat.key === opponentId) {
          return {
            ...chat,
            messages: chat.messages.map(message => {
              if (message.id === messageId) {
                return { ...message, isRead: true };
              }
              return message;
            }),
          };
        }
        return chat;
      });
    });
  }, []);

  const turnAllMessagesAsRead = opponentId => {
    setChatData(prevChats => {
      return prevChats.map(chat => {
        if (chat.key === opponentId) {
          return {
            ...chat,
            messages: chat.messages.map(message => {
              return { ...message, isRead: true };
            }),
          };
        }
        return chat;
      });
    });
  };

  const updateChatData = (key, message) => {
    setChatData(prevChats => {
      const existingChatIndex = prevChats.findIndex(chat => chat.key === key);

      if (existingChatIndex === -1) {
        return [
          ...prevChats,
          {
            key: key,
            messages: [message],
          },
        ];
      } else {
        const existingChat = prevChats[existingChatIndex];
        const messageExists = existingChat.messages.some(
          msg => msg.id === message.id
        );

        if (!messageExists) {
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            messages: [...updatedChats[existingChatIndex].messages, message],
          };
          return updatedChats;
        }

        // 메시지가 이미 있으면 기존 데이터 반환
        return prevChats;
      }
    });
    setCharacters(prevCharacters => {
      return prevCharacters.map(character => {
        if (character.id === key) {
          return { ...character, lastChatDate: new Date() };
        }
        return character;
      });
    });
  };

  const loadOpponentDialogue = async (data, isRead = false) => {
    const { key: opponentId, partNumber } = data;

    if (!opponentId) return;

    const opponent = characters.find(char => char.id === opponentId);

    if (!opponent.isChatAvailable) {
      turnToChatAvailable(opponentId);
    }

    const dialogue = await getDialogue({
      characterId: opponentId,
      partNumber,
    });

    dialogue.messages.forEach(message => {
      const newMessage = {
        ...message,
        isRead,
      };
      updateChatData(opponentId, newMessage);
    });
  };

  const handleMiniGame = data => {
    console.log('handleMiniGame:', data);
  };

  const moveNextStep = () => {
    setCurrStepKey(currStepData.next);

    const nextStepData =
      chapters[currStepData.next.id][currStepData.next.index];

    switch (nextStepData.type) {
      case 'monologue':
        break;
      case 'chatFromOpponent':
        loadOpponentDialogue(nextStepData.data);
        break;
      case 'chatFromMe':
        break;
      case 'miniGame':
        handleMiniGame(nextStepData.data);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // console.log('----:', currStepData);
    // 테스트: friend를 채팅 가능하게 설정
    // turnToChatAvailable('friend');
  }, [currStepData, turnToChatAvailable]);

  const value = {
    characters,
    currStepKey,
    currStepData,
    chatData,
    setCurrStepKey,
    setCharacters,
    moveNextStep,
    turnToChatAvailable,
    getChatAvailableCharacters,
    getChatsByOpponentId,
    markMessagesAsRead,
    turnAllMessagesAsRead,
    updateChatData,
    loadOpponentDialogue,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlowManager() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlowManager must be used within a FlowProvider');
  }
  return context;
}
