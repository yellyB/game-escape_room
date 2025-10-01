import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getDialogue } from '../services/api';
import backgroundImage from '../images/background.png';
import { chapterUtils, loadChapterProgress } from '../data/gameFlow';
import ChatContainer from './chat/ChatContainer';
import { STORAGE_KEYS, storageUtils } from '../utils/storage';
import { useFlowManager } from '../contexts/FlowContext';
import Monologue from './Monologue';
import BottomArea from './BottomArea';

export default function GameContainer() {
  const { currStepData, moveNextStep } = useFlowManager();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [isDelayActive, setIsDelayActive] = useState(false);

  const handlePhoneClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleMonologueEnd = () => {
    moveNextStep();
  };

  const handleScreenClick = () => {
    // 딜레이 중이면 클릭 무시
    if (isDelayActive) {
      return;
    }

    if (!currentChapter || currentStepIndex >= currentChapter.steps.length) {
      return;
    }

    const currentStep = currentChapter.steps[currentStepIndex];

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
      // handleMonologueClick();
    }
  };

  // 토스트 테스트 함수
  const testToast = () => {
    if (typeof window !== 'undefined' && window.message) {
      window.message('토스트 메시지 테스트입니다!');
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
  const getCharacterName = useCallback(opponentId => {
    const nameMap = {
      friend: '👭 친구 (수정)',
      sister: '👧 여동생 (과거의 나)',
      mother: '👩 엄마',
      colleague: '🧑‍💻 회사 후배',
      future_self: '🔮 미래의 나',
    };
    return nameMap[opponentId] || opponentId;
  }, []);

  const handleMyMessage = useCallback(data => {
    // eslint-disable-next-line no-console
    console.log('💬 handleMyMessage 호출:', data);

    // 새로운 형식: { messages: [...] } 또는 { key, messages: [...] }
    const { key, messages } = data;

    // key를 채팅방 ID로 사용
    const opponentId = key;

    // 1.5초 딜레이 후 메시지를 화면에 표시
    setTimeout(() => {
      // 내 메시지들을 로컬 스토리지에 저장
      const existingMessages = storageUtils.get(
        STORAGE_KEYS.CHAT_MESSAGE(opponentId),
        []
      );

      const newMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        isOwn: true,
        timestamp: Date.now(),
      }));

      const updatedMessages = [...existingMessages, ...newMessages];
      storageUtils.set(STORAGE_KEYS.CHAT_MESSAGE(opponentId), updatedMessages);

      // eslint-disable-next-line no-console
      console.log(
        `💬 ${opponentId}에게 메시지 전송: ${newMessages.map(m => m.text).join(', ')}`
      );
    }, 1500); // 1.5초 딜레이
  }, []);

  const goToNextStep = useCallback(() => {
    // 현재 스텝 진행상황 저장
    saveStepProgress();

    if (currentStepIndex < currentChapter.steps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      const nextStep = currentChapter.steps[nextStepIndex];

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
        const firstStep = nextChapter.steps[0];
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
        opponentId: key,
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

    // 첫 스텝 타입에 따른 처리
    const currentStep = chapter?.steps[0];
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

  return (
    <GameContainerWrapper
      onClick={handleScreenClick}
      backgroundImage={backgroundImage}
    >
      <BottomArea onChatOpenClick={handlePhoneClick} />
      {isChatOpen && (
        <ChatContainer
          currentChapter={currentChapter}
          currentStepIndex={currentStepIndex}
          goToNextStep={goToNextStep}
        />
      )}
      {/* 현재 스텝이 chatFromOpponent인 경우 안내 메시지 */}
      {currentChapter &&
        currentChapter.steps[currentStepIndex]?.type === 'chatFromOpponent' && (
          <PendingChatOverlay>
            <PendingChatMessage>
              {getCharacterName(
                currentChapter.steps[currentStepIndex].data.key
              )}
              의 메시지를 확인해주세요
            </PendingChatMessage>
          </PendingChatOverlay>
        )}
      {currStepData.type === 'monologue' && (
        <Monologue texts={currStepData.data} onEnd={handleMonologueEnd} />
      )}
      {/* 토스트 테스트 버튼 (개발용) */}
      <TestToastButton onClick={testToast}>토스트 테스트</TestToastButton>
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

const TestToastButton = styled.button`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(76, 175, 80, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;
