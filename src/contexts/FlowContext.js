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
  },
  {
    id: 'mother',
    name: '엄마',
    isChatAvailable: false,
  },
  {
    id: 'colleague',
    name: '민영씨',
    isChatAvailable: false,
  },
  {
    id: 'sister',
    name: '여동생',
    isChatAvailable: false,
  },
  {
    id: 'future_self',
    name: '미래의 나',
    isChatAvailable: false,
  },
];

const FlowContext = createContext();

export function FlowProvider({ children }) {
  const [currStepKey, setCurrStepKey] = useState(INITIAL_STEP_KEY);
  const [characters, setCharacters] = useState(INITIAL_CHARACTERS);
  const [readChats, setReadChats] = useState([]);
  const [unReadChats, setUnReadChats] = useState([]);

  const currStepData = useMemo(() => {
    return chapters[currStepKey.id][currStepKey.index];
  }, [currStepKey]);

  const getChatAvailableCharacters = () => {
    return characters.filter(character => character.isChatAvailable);
  };

  const getReadChatMessagesByOpponentId = opponentId => {
    return readChats.find(chat => chat.key === opponentId)?.messages || [];
  };

  const getUnReadChatMessagesByOpponentId = useCallback(
    opponentId => {
      const chat = readChats.find(chat => chat.key === opponentId);
      if (!chat) return [];

      return chat.messages.filter(message => message.isRead === false);
    },
    [readChats]
  );

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

  const setUnReadToRead = useCallback((opponentId, messageData) => {
    setReadChats(prevChats => {
      // 해당 opponentId의 채팅방 찾기
      const existingChatIndex = prevChats.findIndex(
        chat => chat.key === opponentId
      );

      if (existingChatIndex === -1) {
        // 채팅방이 없으면 새로 생성
        return [
          ...prevChats,
          {
            key: opponentId,
            messages: [messageData],
          },
        ];
      } else {
        // 채팅방이 있으면 메시지 확인 후 추가
        const existingChat = prevChats[existingChatIndex];
        const messageExists = existingChat.messages.some(
          msg => msg.id === messageData.id
        );

        if (!messageExists) {
          // 메시지가 없으면 추가
          const updatedChats = [...prevChats];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            messages: [
              ...updatedChats[existingChatIndex].messages,
              messageData,
            ],
          };
          return updatedChats;
        }

        // 메시지가 이미 있으면 기존 데이터 반환
        return prevChats;
      }
    });
  }, []);

  const markMessagesAsRead = useCallback((opponentId, messageId) => {
    setReadChats(prevChats => {
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

  const turnToMessagesAsRead = opponentId => {
    setReadChats(prevChats => {
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

  const startMonologue = () => {
    console.log('=============1:', characters);
  };

  const startChatFromOpponent = async data => {
    const { key: opponentId, partNumber } = data;
    console.log('=============2:', opponentId);
    turnToChatAvailable(opponentId);

    const dialogue = await getDialogue({
      characterId: opponentId,
      partNumber,
    });

    setReadChats(prevChats => {
      const existingChatIndex = prevChats.findIndex(
        chat => chat.key === opponentId
      );

      const newMessages = dialogue.messages.map(message => ({
        ...message,
        isRead: false,
      }));

      if (existingChatIndex === -1) {
        return [
          ...prevChats,
          {
            key: opponentId,
            messages: newMessages,
          },
        ];
      } else {
        const updatedChats = [...prevChats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          messages: [
            ...updatedChats[existingChatIndex].messages,
            ...newMessages,
          ],
        };
        return updatedChats;
      }
    });
  };

  const startChatFromMe = () => {
    console.log('=============3:');
  };

  const moveNextStep = () => {
    setCurrStepKey(currStepData.next);

    const nextStepData =
      chapters[currStepData.next.id][currStepData.next.index];

    switch (nextStepData.type) {
      case 'monologue':
        startMonologue();
        break;
      case 'chatFromOpponent':
        startChatFromOpponent(nextStepData.data);
        break;
      case 'chatFromMe':
        startChatFromMe();
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
    unReadChats,
    readChats,
    setCurrStepKey,
    setCharacters,
    moveNextStep,
    turnToChatAvailable,
    getChatAvailableCharacters,
    getReadChatMessagesByOpponentId,
    markMessagesAsRead,
    setUnReadToRead,
    turnToMessagesAsRead,
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
