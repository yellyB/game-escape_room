import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getCharacters, getDialogue } from '../services/api';
import phoneIcon from '../images/icon_phone.png';
import backgroundImage from '../images/background.png';
import playerImage from '../images/player.png';
import { chapterUtils, loadChapterProgress } from '../data/gameFlow';
import ChatList from './chat/ChatList';
import ChatRoom from './chat/ChatRoom';
import { STORAGE_KEYS, storageUtils } from '../utils/storage';
import '../utils/debug'; // 개발자 디버그 기능 로드

export default function GameContainer() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [dialogueData, setDialogueData] = useState({});
  const [hasLocalData, setHasLocalData] = useState({});
  const [availableChats, setAvailableChats] = useState([]);
  const [isDelayActive, setIsDelayActive] = useState(false);

  const [characters, setCharacters] = useState([]);
  const [chats, setChats] = useState([]);

  const handlePhoneClick = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setSelectedChat(null);
    }
  };

  const handleChatSelect = async chatId => {
    setSelectedChat(chatId);

    // 현재 스텝이 chatFromOpponent인 경우 해당 채팅방에 들어갔을 때 처리
    if (
      currentChapter &&
      currentChapter.step[currentStepIndex]?.type === 'chatFromOpponent'
    ) {
      const currentStep = currentChapter.step[currentStepIndex];
      if (currentStep.data.key === chatId) {
        // 4. 플레이어가 해당 채팅방에 입장했다면, 불러왔던 메시지를 로컬스토리지에 저장
        // eslint-disable-next-line no-console
        console.log(
          `🎯 ${chatId} 채팅방에 들어감 - 메시지 로컬스토리지 저장 및 순차 표시 시작`
        );
        await handleChatRoomEntry(chatId, currentStep.data);
        return;
      }
    }

    // 1. 먼저 로컬 스토리지에서 기존 데이터 확인
    const savedMessages = storageUtils.get(
      STORAGE_KEYS.CHAT_MESSAGE(chatId),
      []
    );

    // 2. 안읽은 메시지가 있는지 확인
    const hasUnreadMessages = storageUtils.get(
      STORAGE_KEYS.UNREAD_MESSAGE(chatId),
      false
    );

    // 3. 로컬 스토리지 데이터 여부 저장
    const hasLocal = savedMessages.length > 0;
    setHasLocalData(prev => ({
      ...prev,
      [chatId]: hasLocal,
    }));

    // 4. 안읽은 메시지가 있으면 플래그 해제 (최초 읽음 처리)
    if (hasUnreadMessages) {
      storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(chatId), false);

      // 채팅방 목록에서 안읽음 상태 업데이트
      setAvailableChats(prev =>
        prev.map(chat =>
          chat.id === chatId
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

      // 대기 중인 채팅 스텝이 있고, 해당 채팅방을 읽은 경우 다음 스텝으로 진행 (제거됨)
      // if (pendingChatStep && pendingChatStep.key === chatId) {
      //   setPendingChatStep(null);
      //   goToNextStep();
      // }
    }

    // 현재 스텝이 chatFromOpponent이고 해당 채팅방인 경우, 메시지를 읽었을 때만 다음 스텝으로 진행
    // 이 로직은 handleMessageRead에서 처리하므로 제거
    // if (
    //   currentChapter &&
    //   currentChapter.step[currentStepIndex]?.type === 'chatFromOpponent' &&
    //   currentChapter.step[currentStepIndex].data.key === chatId &&
    //   hasUnreadMessages
    // ) {
    //   // 메시지를 읽었으므로 다음 스텝으로 진행
    //   goToNextStep();
    // }

    // 5. 로컬 스토리지에 데이터가 있으면 API 호출하지 않음
    if (hasLocal) {
      return;
    }

    // 6. 로컬 스토리지에 데이터가 없으면 API에서 가져오기
    if (!dialogueData[chatId]) {
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`${chatId} 캐릭터 대화 데이터 로딩 실패:`, error);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = (chatId, message) => {
    const newMessage = {
      text: message,
      isOwn: true,
      timestamp: Date.now(),
    };

    // 로컬 스토리지에 사용자 메시지 추가
    const messages = storageUtils.get(STORAGE_KEYS.CHAT_MESSAGE(chatId), []);
    messages.push(newMessage);
    storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(chatId), messages);
  };

  const handleScreenClick = () => {
    // 딜레이 중이면 클릭 무시
    if (isDelayActive) {
      return;
    }

    if (!currentChapter || currentStepIndex >= currentChapter.step.length) {
      return;
    }

    const currentStep = currentChapter.step[currentStepIndex];

    // 독백이 아닌 경우에만 화면 클릭 처리
    if (currentStep.type !== 'monologue') {
      if (currentStep.type === 'chatFromMe') {
        // 내 메시지 처리
        handleMyMessage(currentStep.data);
      } else if (currentStep.type === 'chatFromOpponent') {
        // 상대방 메시지 처리 - API 호출 및 채팅방 목록 업데이트
        handleChatFromOpponentStep(currentStep.data);
      }
    } else if (currentStep.type === 'monologue' && !isMonologueOpen) {
      // 독백이 아직 시작되지 않은 경우에만 처리
      handleMonologueClick();
    }
  };

  // 딜레이 시작
  const startDelay = useCallback(callback => {
    setIsDelayActive(true);
    setTimeout(() => {
      setIsDelayActive(false);
      callback();
    }, 1000);
  }, []);

  // 독백 상자 클릭 처리
  const handleMonologueClick = () => {
    if (!currentChapter || currentStepIndex >= currentChapter.step.length) {
      return;
    }

    const currentStep = currentChapter.step[currentStepIndex];

    if (currentStep.type === 'monologue') {
      if (isMonologueOpen) {
        // 현재 독백 그룹 내에서 더 표시할 텍스트가 있는지 확인
        if (currentTextIndex < currentStep.data.length - 1) {
          // 같은 그룹 내에서 다음 텍스트로
          setCurrentTextIndex(currentTextIndex + 1);
        } else {
          // 현재 독백 그룹이 끝났으므로 다음 스텝으로
          goToNextStep();
        }
      } else {
        // 독백 시작 (1초 딜레이)
        startDelay(() => {
          setIsMonologueOpen(true);
          setCurrentTextIndex(0);
        });
      }
    }
  };

  // 스텝 진행상황 저장
  const saveStepProgress = useCallback(() => {
    const progressData = {
      currentChapterId: currentChapter?.id,
      currentStepIndex: currentStepIndex,
      currentTextIndex: currentTextIndex,
      timestamp: Date.now(),
    };
    storageUtils.set(STORAGE_KEYS.STEP_PROGRESS, progressData);
  }, [currentChapter?.id, currentStepIndex, currentTextIndex]);

  // 캐릭터 이름 매핑
  const getCharacterName = useCallback(chatId => {
    const nameMap = {
      friend: '👭 친구 (민아)',
      sister: '👧 여동생 (과거의 나)',
      mother: '👩 엄마',
      colleague: '🧑‍💻 회사 후배',
      future_self: '🔮 미래의 나',
    };
    return nameMap[chatId] || chatId;
  }, []);

  const handleMyMessage = useCallback(
    data => {
      // eslint-disable-next-line no-console
      console.log('💬 handleMyMessage 호출:', data);

      // 새로운 형식: { messages: [...] } 또는 { key, messages: [...] }
      const { key, messages } = data;

      // key를 채팅방 ID로 사용
      const chatId = key;

      // 1.5초 딜레이 후 메시지를 화면에 표시
      setTimeout(() => {
        // 내 메시지들을 로컬 스토리지에 저장
        const existingMessages = storageUtils.get(
          STORAGE_KEYS.CHAT_MESSAGE(chatId),
          []
        );

        const newMessages = messages.map(msg => ({
          id: msg.id,
          text: msg.message,
          isOwn: true,
          timestamp: Date.now(),
        }));

        const updatedMessages = [...existingMessages, ...newMessages];
        storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(chatId), updatedMessages);

        // 채팅방 목록 업데이트
        setAvailableChats(prev => {
          const existingChat = prev.find(chat => chat.id === chatId);
          const lastMessage =
            newMessages[newMessages.length - 1]?.text || '메시지를 보냈습니다';

          if (existingChat) {
            // 기존 채팅방 업데이트
            return prev.map(chat =>
              chat.id === chatId
                ? {
                    ...chat,
                    lastMessage: lastMessage,
                    time: '방금 전',
                  }
                : chat
            );
          } else {
            // 새 채팅방 추가
            return [
              ...prev,
              {
                id: chatId,
                name: getCharacterName(key),
                lastMessage: lastMessage,
                time: '방금 전',
                unread: 0,
              },
            ];
          }
        });

        // eslint-disable-next-line no-console
        console.log(
          `💬 ${chatId}에게 메시지 전송: ${newMessages.map(m => m.text).join(', ')}`
        );
      }, 1500); // 1.5초 딜레이
    },
    [getCharacterName]
  );

  const goToNextStep = useCallback(() => {
    // 현재 스텝 진행상황 저장
    saveStepProgress();

    if (currentStepIndex < currentChapter.step.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = currentChapter.step[nextStepIndex];

      setCurrentStepIndex(nextStepIndex);
      setCurrentTextIndex(0);
      setIsMonologueOpen(false);

      // 다음 스텝 타입에 따른 처리
      if (nextStep.type === 'monologue') {
        // 독백인 경우 1초 딜레이 후 자동으로 시작
        startDelay(() => {
          setIsMonologueOpen(true);
        });
      } else if (nextStep.type === 'chatFromMe') {
        // 내 메시지인 경우 즉시 처리
        handleMyMessage(nextStep.data);
      }
    } else {
      // 챕터 완료 처리
      chapterUtils.completeChapter(currentChapter.id);

      // 다음 챕터로 진행
      if (chapterUtils.goToNextChapter()) {
        const nextChapter = chapterUtils.getCurrentChapter();
        setCurrentChapter(nextChapter);
        setCurrentStepIndex(0);
        setCurrentTextIndex(0);
        setIsMonologueOpen(false);

        // 다음 챕터의 첫 스텝 타입에 따른 처리
        const firstStep = nextChapter.step[0];
        if (firstStep?.type === 'monologue') {
          // 독백인 경우 1초 딜레이 후 자동으로 시작
          startDelay(() => {
            setIsMonologueOpen(true);
          });
        } else if (firstStep?.type === 'chatFromMe') {
          // 내 메시지인 경우 즉시 처리
          handleMyMessage(firstStep.data);
        }
      }
    }
  }, [
    currentStepIndex,
    currentChapter,
    saveStepProgress,
    startDelay,
    handleMyMessage,
  ]);

  // 스텝 진행상황 로드 (현재 사용하지 않음)
  // const loadStepProgress = () => {
  //   const savedProgress = storageUtils.get(STORAGE_KEYS.STEP_PROGRESS, null);
  //   if (savedProgress && savedProgress.currentChapterId === currentChapter?.id) {
  //     setCurrentStepIndex(savedProgress.currentStepIndex || 0);
  //     setCurrentTextIndex(savedProgress.currentTextIndex || 0);
  //   }
  // };

  // chatFromOpponent 스텝 처리 - 요구사항에 따른 단계별 처리
  const handleChatFromOpponentStep = async data => {
    const { key, partNumber } = data;

    try {
      // 1. API에서 데이터 불러오기 (로컬스토리지 저장 전)
      // eslint-disable-next-line no-console
      console.log(`📡 API 호출: ${key} 파트 ${partNumber} 데이터 요청`);
      const dialogue = await getDialogue({
        characterId: key,
        partNumber: partNumber,
      });

      // 2. 불러온 데이터에 읽지않음 플래그값을 넣는다
      // eslint-disable-next-line no-unused-vars
      const newMessages = dialogue.messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        isOwn: false,
        timestamp: Date.now(),
        partNumber: partNumber,
        isUnread: true, // 읽지않음 플래그 추가
      }));

      // 3. 채팅방 리스트를 보여주는 데이터에 읽지않은 메시지가 있는지 값을 보여주는 데이터를 추가
      const existingChat = availableChats.find(chat => chat.id === key);
      if (existingChat) {
        // 기존 채팅방 업데이트
        setAvailableChats(prev =>
          prev.map(chat =>
            chat.id === key
              ? {
                  ...chat,
                  lastMessage: '새로운 메시지가 있습니다',
                  unread: 1, // 안읽음이 있다는 정보만 표시
                }
              : chat
          )
        );
      } else {
        // 새 채팅방 추가
        setAvailableChats(prev => [
          ...prev,
          {
            id: key,
            name: getCharacterName(key),
            lastMessage: '새로운 메시지가 있습니다',
            time: '방금 전',
            unread: 1, // 안읽음이 있다는 정보만 표시
          },
        ]);
      }

      // 안읽은 메시지 플래그 설정
      storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(key), true);

      // eslint-disable-next-line no-console
      console.log(
        `✅ ${key} 파트 ${partNumber} 처리 완료 - 채팅방 목록 업데이트됨`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`${key} 캐릭터 대화 데이터 로딩 실패:`, error);
      goToNextStep();
    }
  };

  // 채팅방 입장 시 메시지 처리 - 4, 5, 6단계
  const handleChatRoomEntry = async (chatId, stepData) => {
    const { key, partNumber } = stepData;

    try {
      // API에서 데이터 다시 불러오기 (캐시된 데이터 사용)
      const dialogue = await getDialogue({
        characterId: key,
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

  const handleMessageRead = useCallback(
    chatId => {
      // 현재 스텝이 chatFromOpponent 또는 chatFromMe이고 해당 채팅방인 경우, 메시지를 읽었을 때만 다음 스텝으로 진행
      const currentStep = currentChapter?.step[currentStepIndex];
      const isChatFromOpponent = currentStep?.type === 'chatFromOpponent';
      const isChatFromMe = currentStep?.type === 'chatFromMe';

      const isMatchingChat =
        (isChatFromOpponent && currentStep.data.key === chatId) ||
        (isChatFromMe && currentStep.data.key === chatId);

      if (
        currentChapter &&
        (isChatFromOpponent || isChatFromMe) &&
        isMatchingChat
      ) {
        const partNumber = currentStep.data.partNumber;

        if (currentStep.type === 'chatFromOpponent') {
          // 상대방 메시지인 경우 읽음 처리
          const messages = storageUtils.get(
            STORAGE_KEYS.CHAT_MESSAGE(chatId),
            []
          );
          const updatedMessages = messages.map(msg => {
            if (msg.partNumber === partNumber && msg.isUnread) {
              return { ...msg, isUnread: false }; // 읽음으로 변경
            }
            return msg;
          });
          storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(chatId), updatedMessages);

          // 채팅방 목록에서 안읽음 상태 업데이트
          setAvailableChats(prev =>
            prev.map(chat =>
              chat.id === chatId
                ? {
                    ...chat,
                    unread: 0, // 안읽음 없음
                    lastMessage:
                      updatedMessages[updatedMessages.length - 1]?.text ||
                      '대화를 시작하세요',
                  }
                : chat
            )
          );

          // 안읽은 메시지 플래그 해제
          storageUtils.set(STORAGE_KEYS.UNREAD_MESSAGE(chatId), false);
        }
        // 내 메시지인 경우 별도 처리 없이 바로 다음 스텝으로 진행

        // 6. 다음 순서로 넘어간다
        goToNextStep();
      }
    },
    [currentChapter, currentStepIndex, goToNextStep]
  );

  const startMonologue = () => {
    if (
      currentChapter &&
      currentChapter.step[currentStepIndex]?.type === 'monologue'
    ) {
      // 1초 딜레이 후 독백 시작
      startDelay(() => {
        setIsMonologueOpen(true);
        setCurrentTextIndex(0);
      });
    }
  };

  // 로컬 스토리지 데이터 삭제 함수
  const clearLocalStorageData = () => {
    try {
      // 1. 접두어로 시작하는 모든 게임 데이터 삭제
      const success = storageUtils.clearAll();

      if (!success) {
        // eslint-disable-next-line no-console
        console.warn('일반 삭제 실패, 강제 삭제 시도');
        // 2. 강제 삭제: 모든 가능한 키들을 직접 삭제
        const allKeys = [
          'escape_game_characters',
          'escape_game_chapter_progress',
          'escape_game_message_progress',
          'escape_game_step_progress',
        ];

        // 각 채팅방 데이터도 삭제
        const chatIds = [
          'friend',
          'sister',
          'mother',
          'colleague',
          'future_self',
        ];
        chatIds.forEach(chatId => {
          allKeys.push(`escape_game_chat_${chatId}`);
          allKeys.push(`escape_game_unread_${chatId}`);
        });

        allKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`강제 삭제 실패: ${key}`, error);
          }
        });
      }

      // 3. 최종 검증
      const remainingGameKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('escape_game_')) {
          remainingGameKeys.push(key);
        }
      }

      if (remainingGameKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('리셋 후 남은 게임 데이터:', remainingGameKeys);
      } else {
        // eslint-disable-next-line no-console
        console.log('게임 데이터 완전 삭제 완료');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 삭제 중 오류:', error);
    }
  };

  const handleResetGame = () => {
    const confirmed = window.confirm(
      '게임 데이터가 초기화됩니다. 초기화 하시겠습니까?'
    );

    if (confirmed) {
      // 1. 먼저 로컬 스토리지 데이터 완전 삭제
      clearLocalStorageData();

      // 2. 잠시 대기 후 상태 초기화 (로컬스토리지 삭제 완료 보장)
      setTimeout(() => {
        // 게임 데이터 초기화
        chapterUtils.resetProgress();

        // 모든 상태 초기화
        setCurrentChapter(chapterUtils.getCurrentChapter());
        setCurrentStepIndex(0);
        setCurrentTextIndex(0);
        setIsMonologueOpen(false);
        setIsChatOpen(false);
        setSelectedChat(null);
        setAvailableChats([]);
        setDialogueData({});
        setHasLocalData({});

        // 페이지 새로고침으로 완전한 초기화 보장
        window.location.reload();
      }, 100);
    }
  };

  useEffect(() => {
    loadChapterProgress();
    const chapter = chapterUtils.getCurrentChapter();
    setCurrentChapter(chapter);

    // 스텝 진행상황 로드
    const savedProgress = storageUtils.get(STORAGE_KEYS.STEP_PROGRESS, null);
    if (savedProgress && savedProgress.currentChapterId === chapter?.id) {
      setCurrentStepIndex(savedProgress.currentStepIndex || 0);
      setCurrentTextIndex(savedProgress.currentTextIndex || 0);
    } else {
      setCurrentStepIndex(0);
      setCurrentTextIndex(0);
    }

    // 기존 채팅방들 로드
    const chatIds = ['friend', 'sister', 'mother', 'colleague', 'future_self'];
    const existingChats = [];

    chatIds.forEach(chatId => {
      const messages = storageUtils.get(STORAGE_KEYS.CHAT_MESSAGE(chatId), []);
      const hasUnreadMessages = storageUtils.get(
        STORAGE_KEYS.UNREAD_MESSAGE(chatId),
        false
      );

      if (messages.length > 0) {
        const nameMap = {
          friend: '👭 친구 (민아)',
          sister: '👧 여동생',
          mother: '👩 엄마',
          colleague: '🧑‍💻 회사 후배',
          future_self: '🔮 미래의 나',
        };

        existingChats.push({
          id: chatId,
          name: nameMap[chatId] || chatId,
          lastMessage: hasUnreadMessages
            ? '새로운 메시지가 있습니다'
            : messages[messages.length - 1]?.text || '대화를 시작하세요',
          time: '방금 전',
          unread: hasUnreadMessages ? 1 : 0,
        });
      }
    });

    setAvailableChats(existingChats);

    // 첫 스텝 타입에 따른 처리
    const currentStep = chapter?.step[0];
    if (currentStep?.type === 'monologue') {
      // 독백인 경우 1초 딜레이 후 자동으로 시작
      startDelay(() => {
        setIsMonologueOpen(true);
      });
    } else if (currentStep?.type === 'chatFromMe') {
      // 내 메시지인 경우 즉시 처리
      handleMyMessage(currentStep.data);
    }
  }, [startDelay, handleMyMessage]);

  // 챕터 변경 시 스텝 인덱스 초기화
  useEffect(() => {
    setCurrentStepIndex(0);
    setCurrentTextIndex(0);
    setIsMonologueOpen(false);
  }, [currentChapter]);

  // 사용 가능한 채팅방 목록 반환
  const getChatRoomsFromCharacters = () => {
    return availableChats;
  };

  // 대화 데이터를 가져오는 함수
  const getChatMessagesForRoom = chatId => {
    // 로컬 스토리지에서 메시지 불러오기
    const savedMessages = storageUtils.get(
      STORAGE_KEYS.CHAT_MESSAGE(chatId),
      []
    );

    return savedMessages;
  };

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

  useEffect(() => {
    const temp = storageUtils.get('escape_game_chat_friend');
    console.log('temp:', temp);
    setChats();
  }, []);

  return (
    <GameContainerWrapper
      onClick={handleScreenClick}
      backgroundImage={backgroundImage}
    >
      <BottomFixedArea>
        <PhoneIcon
          src={phoneIcon}
          alt="Phone Icon"
          onClick={handlePhoneClick}
        />
        <MonologueButton onClick={startMonologue}>💭</MonologueButton>
        <ResetButton onClick={handleResetGame}>🔄</ResetButton>
      </BottomFixedArea>

      {isChatOpen &&
        (selectedChat ? (
          <ChatRoom
            chatId={selectedChat}
            messages={getChatMessagesForRoom(selectedChat)}
            onBack={handleBackToList}
            onSendMessage={handleSendMessage}
            isLocalData={hasLocalData[selectedChat] || false}
            isFirstRead={storageUtils.get(
              STORAGE_KEYS.UNREAD_MESSAGE(selectedChat),
              false
            )}
            onMessageRead={handleMessageRead}
          />
        ) : (
          <ChatList
            chatRooms={getChatRoomsFromCharacters()}
            onChatSelect={handleChatSelect}
          />
        ))}

      {/* 딜레이 중일 때 dim 처리 */}
      {isDelayActive && (
        <DelayOverlay>
          <DelayText>잠시만요...</DelayText>
        </DelayOverlay>
      )}

      {/* 현재 스텝이 chatFromOpponent인 경우 안내 메시지 */}
      {currentChapter &&
        currentChapter.step[currentStepIndex]?.type === 'chatFromOpponent' && (
          <PendingChatOverlay>
            <PendingChatMessage>
              {getCharacterName(currentChapter.step[currentStepIndex].data.key)}
              의 메시지를 확인해주세요
            </PendingChatMessage>
          </PendingChatOverlay>
        )}

      {isMonologueOpen &&
        currentChapter &&
        currentChapter.step[currentStepIndex]?.type === 'monologue' &&
        currentTextIndex >= 0 && (
          <MonologueOverlay>
            <MonologueBox onClick={handleMonologueClick}>
              <MonologueContent>
                <PlayerImage src={playerImage} alt="Player" />
                <MonologueText>
                  {currentChapter.step[currentStepIndex].data?.map(
                    (text, index) => (
                      <div
                        key={index}
                        style={{
                          marginBottom: '10px',
                          opacity: index <= currentTextIndex ? 1 : 0,
                          transition: 'opacity 0.3s ease-in-out',
                          visibility:
                            index <= currentTextIndex ? 'visible' : 'hidden',
                        }}
                      >
                        {text}
                      </div>
                    )
                  )}
                </MonologueText>
              </MonologueContent>
              <MonologueProgress>
                {currentStepIndex + 1} / {currentChapter.step.length}
              </MonologueProgress>
            </MonologueBox>
          </MonologueOverlay>
        )}
    </GameContainerWrapper>
  );
}

const GameContainerWrapper = styled.div`
  min-height: 100vh;
  background: #000000;
  background-image: url(${props => props.backgroundImage});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const BottomFixedArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #333;
`;

const PhoneIcon = styled.img`
  width: 40px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const MonologueButton = styled.button`
  width: 40px;
  height: 40px;
  background: #28a745;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const ResetButton = styled.button`
  width: 40px;
  height: 40px;
  background: #dc3545;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const MonologueOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 100px;
  z-index: 2000;
`;

const MonologueBox = styled.div`
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 15px;
  padding: 30px;
  width: 80%;
  max-width: 600px;
  min-height: 200px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MonologueContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const PlayerImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const MonologueText = styled.div`
  color: white;
  font-size: 18px;
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const MonologueProgress = styled.div`
  color: #888;
  font-size: 14px;
`;

const DelayOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  pointer-events: all;
`;

const DelayText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px 40px;
  border-radius: 10px;
  border: 1px solid #333;
`;

const PendingChatOverlay = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1400;
  pointer-events: none;
`;

const PendingChatMessage = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 30px;
  border-radius: 25px;
  border: 2px solid #4caf50;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.7;
    }
  }
`;
