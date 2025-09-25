// 챕터 데이터 구조 (내부 관리용)
export const chapters = [
  {
    id: 'opening',
    monologue: [
      '…여긴 어디지?',
      '눈을 뜨니 낯선 방. 창문도, 문도 없다.',
      '공기는 텅 비어 있고, 손끝엔 예전부터 사용하던 내 휴대폰 하나.',
      '',
      '기억을 더듬어보니…',
      '',
      '나는 여동생이 너무 미웠다.',
      '',
      '행복하던 그 모습이 꼴 보기 싫어서,',
      '',
      '이 방에 가둬버리고 싶었다.',
      '',
      '그런데 눈을 떠보니',
      '',
      '갇힌 건 내가 되어 있었다.',
      '',
      '어떻게 된 거지?',
      '……일단, 나가야 한다.',
    ],
    nextChapter: 'realization',
    isCompleted: false,
  },
  {
    id: 'realization',
    monologue: [
      '이제 알겠지?',
      '문은 밖에서 잠긴 적 없어.',
      '네가 스스로 잠근 거야.',
      '',
      '……내가, 나를 가둔 거였어.',
      '',
      '그럴수가',
      '',
      '열쇠도 네가 가지고 있어.',
      '그냥 이런 널 받아들여',
      '',
      '흥, 그래.',
      '날 혐오하든 뭐든, 난 네 일부야.',
      '마찬가지로 못난 네 모습도 너이고.',
      '그러니까 자꾸 숨기려고 하지마.',
      '나 없인 네가 네가 아니니까.',
      '',
      '…그래.',
      '이제 도망치지 않을게.',
      '나를 받아들일게.',
    ],
    nextChapter: null,
    isCompleted: false,
  },
];

// 챕터 진행 상태 관리 (로컬 스토리지 사용)
const STORAGE_KEY = 'game_chapter_progress';

export const chapterProgress = {
  currentChapterIndex: 0, // 배열 인덱스 (0부터 시작)
  currentChapterId: 'opening', // 현재 챕터 ID
  completedChapters: [],
  unlockedChapters: ['opening'],
};

// 로컬 스토리지에서 진행 상황 로드
export const loadChapterProgress = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(chapterProgress, data);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('챕터 진행 상황 로드 실패:', error);
  }
};

// 로컬 스토리지에 진행 상황 저장
export const saveChapterProgress = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapterProgress));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('챕터 진행 상황 저장 실패:', error);
  }
};

// 챕터 관련 유틸리티 함수들
export const chapterUtils = {
  // ID로 챕터 찾기
  findChapterById: id => {
    return chapters.find(chapter => chapter.id === id);
  },

  // 인덱스로 챕터 찾기
  findChapterByIndex: index => {
    return chapters[index];
  },

  // 현재 챕터 가져오기
  getCurrentChapter: () => {
    return chapters[chapterProgress.currentChapterIndex];
  },

  // 다음 챕터로 진행
  goToNextChapter: () => {
    const currentChapter = chapters[chapterProgress.currentChapterIndex];
    if (currentChapter && currentChapter.nextChapter) {
      const nextChapterIndex = chapters.findIndex(
        chapter => chapter.id === currentChapter.nextChapter
      );
      if (nextChapterIndex !== -1) {
        chapterProgress.currentChapterIndex = nextChapterIndex;
        chapterProgress.currentChapterId = currentChapter.nextChapter;
        if (
          !chapterProgress.unlockedChapters.includes(currentChapter.nextChapter)
        ) {
          chapterProgress.unlockedChapters.push(currentChapter.nextChapter);
        }
        saveChapterProgress();
        return true;
      }
    }
    return false;
  },

  // 챕터 완료 처리
  completeChapter: chapterId => {
    if (!chapterProgress.completedChapters.includes(chapterId)) {
      chapterProgress.completedChapters.push(chapterId);
    }
    const chapter = chapters.find(ch => ch.id === chapterId);
    if (chapter) {
      chapter.isCompleted = true;
    }
    saveChapterProgress();
  },

  // 특정 챕터로 이동 (개발자용)
  goToChapter: chapterId => {
    if (chapterProgress.unlockedChapters.includes(chapterId)) {
      const chapterIndex = chapters.findIndex(
        chapter => chapter.id === chapterId
      );
      if (chapterIndex !== -1) {
        chapterProgress.currentChapterIndex = chapterIndex;
        chapterProgress.currentChapterId = chapterId;
        saveChapterProgress();
        return true;
      }
    }
    return false;
  },

  // 진행률 계산
  getProgress: () => {
    const totalChapters = chapters.length;
    const completedCount = chapterProgress.completedChapters.length;
    return Math.round((completedCount / totalChapters) * 100);
  },

  // 모든 챕터 목록 가져오기
  getAllChapters: () => {
    return chapters;
  },

  // 잠금 해제된 챕터 목록
  getUnlockedChapters: () => {
    return chapterProgress.unlockedChapters.map(id =>
      chapterUtils.findChapterById(id)
    );
  },

  // 진행 상황 초기화 (개발자용)
  resetProgress: () => {
    chapterProgress.currentChapterIndex = 0;
    chapterProgress.currentChapterId = 'opening';
    chapterProgress.completedChapters = [];
    chapterProgress.unlockedChapters = ['opening'];
    chapters.forEach(chapter => {
      chapter.isCompleted = false;
    });
    saveChapterProgress();
  },
};
