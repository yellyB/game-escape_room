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
  const [chats, setChats] = useState([]);

  const currStepData = useMemo(() => {
    return chapters[currStepKey.id][currStepKey.index];
  }, [currStepKey]);

  const getChatAvailableCharacters = () => {
    return characters.filter(character => character.isChatAvailable);
  };

  const getChatMessagesByOpponentId = opponentId => {
    return chats.find(chat => chat.key === opponentId)?.messages || [];
  };

  const turnToChatAvailable = useCallback(id => {
    console.log('turnToChatAvailable 호출됨, id:', id);
    setCharacters(prevCharacters => {
      const updated = prevCharacters.map(character => {
        return character.id === id
          ? { ...character, isChatAvailable: true }
          : character;
      });
      console.log('업데이트된 캐릭터들:', updated);
      return updated;
    });
  }, []);

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
    console.log('1111111111 dialogue:', dialogue);

    const temp = { key: opponentId, messages: dialogue.messages };
    console.log('1111111111 temp:', temp);

    setChats(prevChats => {
      const existingChatIndex = prevChats.findIndex(
        chat => chat.key === opponentId
      );

      if (existingChatIndex === -1) {
        return [...prevChats, { key: opponentId, messages: dialogue.messages }];
      } else {
        const updatedChats = [...prevChats];
        updatedChats[existingChatIndex] = {
          ...updatedChats[existingChatIndex],
          messages: [
            ...updatedChats[existingChatIndex].messages,
            ...dialogue.messages,
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
    console.log(currStepData, nextStepData);

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
    console.log('----:', currStepData);
    // 테스트: friend를 채팅 가능하게 설정
    turnToChatAvailable('friend');
  }, [currStepData, turnToChatAvailable]);

  const value = {
    characters,
    currStepKey,
    currStepData,
    setCurrStepKey,
    setCharacters,
    moveNextStep,
    turnToChatAvailable,
    getChatAvailableCharacters,
    getChatMessagesByOpponentId,
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
