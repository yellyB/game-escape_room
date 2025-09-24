// 챕터 데이터 구조 (내부 관리용)
export const chapters = [
  {
    id: 'start',
    monologue: [
      "여기는... 어디지?",
      "분명히 집에서 잠들었는데...",
      "이상한 곳에 와버렸네.",
      "뭔가 무서운 기분이 든다.",
      "일단 주변을 둘러봐야겠어."
    ],
    nextChapter: 'explore',
    isCompleted: false
  },
  {
    id: 'explore',
    monologue: [
      "이곳은 정말 이상한 곳이다.",
      "어디서부터 어디까지가 현실이고 꿈인지 구분이 안 된다.",
      "이곳의 분위기가 너무 어둡고 조용해서 가슴이 두근거린다.",
      "일단 주변을 둘러봐야겠어.",
      "이곳에서 나갈 방법을 찾아야 한다."
    ],
    nextChapter: 'discover',
    isCompleted: false
  },
  {
    id: 'discover',
    monologue: [
      "뭔가 이상한 소리가 들린다.",
      "저기서 빛이 나고 있어.",
      "가까이 가보자.",
      "이것은... 뭔가 중요한 것 같다.",
      "이것으로 뭔가를 할 수 있을 것 같다."
    ],
    nextChapter: 'ending',
    isCompleted: false
  },
  {
    id: 'ending',
    monologue: [
      "이제 모든 것이 이해된다.",
      "이곳은 내 마음속의 어둠이었다.",
      "이제 나갈 수 있다.",
      "더 이상 두려워하지 않겠다.",
      "이제 진정한 나로 돌아갈 수 있다."
    ],
    nextChapter: null,
    isCompleted: false
  }
];

// 챕터 진행 상태 관리 (로컬 스토리지 사용)
const STORAGE_KEY = 'game_chapter_progress';

export const chapterProgress = {
  currentChapterIndex: 0, // 배열 인덱스 (0부터 시작)
  currentChapterId: 'start', // 현재 챕터 ID
  completedChapters: [],
  unlockedChapters: ['start']
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
    console.error('챕터 진행 상황 로드 실패:', error);
  }
};

// 로컬 스토리지에 진행 상황 저장
export const saveChapterProgress = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapterProgress));
  } catch (error) {
    console.error('챕터 진행 상황 저장 실패:', error);
  }
};

// 챕터 관련 유틸리티 함수들
export const chapterUtils = {
  // ID로 챕터 찾기
  findChapterById: (id) => {
    return chapters.find(chapter => chapter.id === id);
  },
  
  // 인덱스로 챕터 찾기
  findChapterByIndex: (index) => {
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
      const nextChapterIndex = chapters.findIndex(chapter => chapter.id === currentChapter.nextChapter);
      if (nextChapterIndex !== -1) {
        chapterProgress.currentChapterIndex = nextChapterIndex;
        chapterProgress.currentChapterId = currentChapter.nextChapter;
        if (!chapterProgress.unlockedChapters.includes(currentChapter.nextChapter)) {
          chapterProgress.unlockedChapters.push(currentChapter.nextChapter);
        }
        saveChapterProgress();
        return true;
      }
    }
    return false;
  },
  
  // 챕터 완료 처리
  completeChapter: (chapterId) => {
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
  goToChapter: (chapterId) => {
    if (chapterProgress.unlockedChapters.includes(chapterId)) {
      const chapterIndex = chapters.findIndex(chapter => chapter.id === chapterId);
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
    return chapterProgress.unlockedChapters.map(id => chapterUtils.findChapterById(id));
  },
  
  // 진행 상황 초기화 (개발자용)
  resetProgress: () => {
    chapterProgress.currentChapterIndex = 0;
    chapterProgress.currentChapterId = 'start';
    chapterProgress.completedChapters = [];
    chapterProgress.unlockedChapters = ['start'];
    chapters.forEach(chapter => {
      chapter.isCompleted = false;
    });
    saveChapterProgress();
  }
};