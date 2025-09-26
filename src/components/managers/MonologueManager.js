import { useState, useEffect } from 'react';
import { chapterUtils, loadChapterProgress } from '../../data/monologues';

export default function MonologueManager() {
  const [isMonologueOpen, setIsMonologueOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [currentMonologueIndex, setCurrentMonologueIndex] = useState(0);

  // 컴포넌트 마운트 시 챕터 진행 상황 로드
  useEffect(() => {
    loadChapterProgress();
    setCurrentChapter(chapterUtils.getCurrentChapter());
  }, []);

  // 챕터 변경 시 독백 인덱스 초기화
  useEffect(() => {
    setCurrentMonologueIndex(0);
  }, [currentChapter]);

  // 모놀로그 시작
  const startMonologue = () => {
    setIsMonologueOpen(true);
    setCurrentMonologueIndex(0);
  };

  // 모놀로그 닫기
  const closeMonologue = () => {
    setIsMonologueOpen(false);
  };

  // 다음 모놀로그로 진행
  const goToNextMonologue = () => {
    if (
      currentChapter &&
      currentMonologueIndex < currentChapter.monologue.length - 1
    ) {
      setCurrentMonologueIndex(prev => prev + 1);
    } else {
      // 마지막 모놀로그면 챕터 완료 처리
      if (currentChapter) {
        chapterUtils.completeChapter(currentChapter.id);

        // 다음 챕터로 진행
        const hasNextChapter = chapterUtils.goToNextChapter();
        if (hasNextChapter) {
          setCurrentChapter(chapterUtils.getCurrentChapter());
        } else {
          // 게임 완료
          setIsMonologueOpen(false);
        }
      }
    }
  };

  // 화면 클릭 처리
  const handleScreenClick = () => {
    if (isMonologueOpen && currentChapter) {
      if (currentMonologueIndex < currentChapter.monologue.length - 1) {
        // 다음 모놀로그로 진행
        setCurrentMonologueIndex(prev => prev + 1);
      } else {
        // 마지막 모놀로그면 챕터 완료 처리
        chapterUtils.completeChapter(currentChapter.id);

        // 다음 챕터로 진행
        const hasNextChapter = chapterUtils.goToNextChapter();
        if (hasNextChapter) {
          setCurrentChapter(chapterUtils.getCurrentChapter());
        } else {
          // 게임 완료
          setIsMonologueOpen(false);
        }
      }
    }
  };

  // 현재 모놀로그 텍스트 가져오기
  const getCurrentMonologueText = () => {
    if (currentChapter && currentChapter.monologue[currentMonologueIndex]) {
      return currentChapter.monologue[currentMonologueIndex];
    }
    return [];
  };

  // 모놀로그 진행률 계산
  const getMonologueProgress = () => {
    if (!currentChapter) return 0;
    return Math.round(
      ((currentMonologueIndex + 1) / currentChapter.monologue.length) * 100
    );
  };

  return {
    // 상태
    isMonologueOpen,
    currentChapter,
    currentMonologueIndex,

    // 함수들
    startMonologue,
    closeMonologue,
    goToNextMonologue,
    handleScreenClick,
    getCurrentMonologueText,
    getMonologueProgress,
  };
}
