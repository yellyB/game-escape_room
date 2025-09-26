// 챕터 데이터 구조 (내부 관리용)
export const chapters = [
  {
    id: 'opening',
    monologue: [
      [
        '…여긴 어디지?',
        '눈을 뜨니 낯선 방. 창문도, 문도 없다.',
        '공기는 텅 비어 있고, 손끝엔 예전부터 사용하던 내 휴대폰 하나.',
      ],
      [
        '기억을 더듬어보니…',
        '나는 여동생이 너무 미웠다.',
        '행복하던 그 모습이 꼴 보기 싫어서,',
        '이 방에 가둬버리고 싶었다.',
      ],
      [
        '그런데 눈을 떠보니',
        '갇힌 건 내가 되어 있었다.',
        '어떻게 된 거지?',
        '……일단, 나가야 한다.',
      ],
    ],
    nextChapter: 'conversation_friend',
    isCompleted: false,
  },
  {
    id: 'conversation_friend',
    monologue: [
      [
        '내가 평소에 잘 웃었던건 진짜로 웃겨서가 아니라',
        '나 같은 애는 웃는거라도 잘해야',
        '다른 사람들이 좋아하기 때문이었어',
      ],
    ],
    nextChapter: 'conversation_sister',
    isCompleted: false,
  },
  {
    id: 'conversation_sister',
    monologue: [['뭐지? 여동생..?', '어디에 있는거야', '날 보고 있나?']],
    nextChapter: 'conversation_mother',
    isCompleted: false,
  },
  {
    id: 'conversation_mother',
    monologue: [
      ['또 엄마가 먼저 사과하신다.', '잘못은 내가 먼저 했는데.'],
      [
        '…',
        '난 어렸을때부터 친구가 별로 없어서 혼자 그림을 그리다보니',
        '그림을 잘 그리게 되었다.',
        '그걸 보고 엄마가 자랑스러워하는 모습때문에',
        '더, 더 열심히 하게 되었다.',
        '중간부터는 진짜 내가 그림그리는걸 좋아하는건지, 알수도 없게 되어버렸다.',
      ],
      [
        '아냐 난 너무 외롭고 혼자있는 시간이 불안했어.',
        '하지만 그걸 드러내면 오히려 나를 내칠까봐',
        '티 낼 수 없었어.',
        '매일 괜찮은 척 엄마를 속였어.',
      ],
      [
        '외롭다고 너무나도 말하고 싶은데',
        '엄마한텐 절대 말할수가 없어',
        '괴로워',
      ],
    ],
    nextChapter: 'conversation_colleague',
    isCompleted: false,
  },
  {
    id: 'conversation_colleague',
    monologue: [
      [
        '민영씨..',
        '회사 다니면서 처음으로 생긴 후배라서',
        '잘 챙겨주고 싶었는데.',
        '그치만 내가 일을 잘하는것도 아니고',
        '날 존경한다거나 그런 마음이 전혀 없겠지',
        '괜히 항상 미안한 마음밖에 없다.',
      ],
    ],
    nextChapter: 'realization',
    isCompleted: false,
  },
  {
    id: 'realization',
    monologue: [['……내가, 나를 가둔 거였어.']],
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
  unlockedChapters: [
    'opening',
    'conversation_friend',
    'conversation_sister',
    'conversation_mother',
    'conversation_colleague',
  ],
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
    chapterProgress.unlockedChapters = [
      'opening',
      'conversation_friend',
      'conversation_sister',
      'conversation_mother',
      'conversation_colleague',
    ];
    chapters.forEach(chapter => {
      chapter.isCompleted = false;
    });
    saveChapterProgress();
  },
};
