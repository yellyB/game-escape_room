const generateId = () => Math.random().toString(36).substr(2, 9);

// NOTE: chatFromMe의 messages는, 상대의 메시지(api응답)에 형식을 맞추기 위해 이중배열로 작성하였으나, 추후 개선필요
export const chapters = {
  opening: [
    {
      type: 'monologue',
      data: [
        '…여긴 어디지?',
        '눈을 뜨니 낯선 방. 창문도, 문도 없다.',
        '공기는 텅 비어 있고, 손끝엔 예전부터 사용하던 내 휴대폰 하나.',
      ],
      // next: { id: 'opening', index: 1 },
      next: { id: 'conversation_friend', index: 0 },
    },
    // {
    //   type: 'monologue',
    //   data: ['기억을 더듬어보니…'],
    //   next: { id: 'opening', index: 2 },
    // },
    // {
    //   type: 'monologue',
    //   data: [
    //     '나는 여동생이 너무 미웠다.',
    //     '행복하던 그 모습이 꼴 보기 싫어서,',
    //     '이 방에 가둬버리려고 했다.',
    //   ],
    //   next: { id: 'opening', index: 3 },
    // },
    // {
    //   type: 'monologue',
    //   data: [
    //     '그런데 눈을 떠보니',
    //     '갇힌 건 내가 되어 있었다.',
    //     '어떻게 된 거지?',
    //   ],
    //   next: { id: 'opening', index: 4 },
    // },
    // {
    //   type: 'monologue',
    //   data: ['……일단, 나가야 한다.'],
    //   next: { id: 'conversation_friend', index: 0 },
    // },
  ],
  conversation_friend: [
    {
      type: 'chatFromOpponent',
      data: { key: 'friend', partNumber: 1 },
      next: { id: 'conversation_friend', index: 1 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'friend',
        messages: [
          {
            id: generateId(),
            message: '……난 그냥 없어져도 아무도 모를 줄 알았어.',
            isSentFromMe: true,
          },
        ],
      },
      next: { id: 'conversation_friend', index: 2 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'friend', partNumber: 2 },
      next: { id: 'conversation_friend', index: 3 },
    },
    {
      type: 'monologue',
      data: [
        '내가 평소에 잘 웃었던건 진짜로 웃겨서가 아니라',
        '나 같은 애는 웃는거라도 잘해야',
        '다른 사람들이 좋아하기 때문이었어',
      ],
      next: { id: 'conversation_friend', index: 4 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'friend',
        messages: [
          {
            id: generateId(),
            message: '…그게 그렇게 중요했어?',
            isSentFromMe: true,
          },
        ],
      },
      next: { id: 'conversation_friend', index: 5 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'friend', partNumber: 3 },
      next: { id: 'conversation_friend', index: 6 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'friend', partNumber: 4 },
      next: { id: 'conversation_sister_1', index: 0 },
    },
  ],
  conversation_sister_1: [
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 1 },
      next: { id: 'conversation_sister_1', index: 1 },
    },
    {
      type: 'monologue',
      data: ['뭐지? 여동생..?', '어디에 있는거야', '날 보고 있나?'],
      next: { id: 'conversation_sister_1', index: 2 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 2 },
      next: { id: 'conversation_sister_1', index: 3 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 3 },
      next: { id: 'conversation_mother', index: 0 },
    },
  ],
  conversation_mother: [
    {
      type: 'chatFromOpponent',
      data: { key: 'mother', partNumber: 1 },
      next: { id: 'conversation_mother', index: 1 },
    },
    {
      type: 'monologue',
      data: ['또 엄마가 먼저 사과하신다.', '잘못은 내가 먼저 했는데.'],
      next: { id: 'conversation_mother', index: 2 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'mother', partNumber: 2 },
      next: { id: 'conversation_mother', index: 3 },
    },
    {
      type: 'monologue',
      data: [
        '…',
        '난 어렸을때부터 친구가 별로 없어서 혼자 그림을 그리다보니',
        '그림을 잘 그리게 되었다.',
        '그걸 보고 엄마가 자랑스러워하는 모습때문에',
        '더, 더 열심히 하게 되었다.',
        '중간부터는 진짜 내가 그림그리는걸 좋아하는건지, 알수도 없게 되어버렸다.',
      ],
      next: { id: 'conversation_mother', index: 4 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'mother', partNumber: 3 },
      next: { id: 'conversation_mother', index: 5 },
    },
    {
      type: 'monologue',
      data: [
        '아냐 난 너무 외롭고 혼자있는 시간이 불안했어.',
        '하지만 그걸 드러내면 오히려 나를 내칠까봐',
        '티 낼 수 없었어.',
        '매일 괜찮은 척 엄마를 속였어.',
      ],
      next: { id: 'conversation_mother', index: 6 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'mother',
        messages: [{ id: generateId(), message: '엄마..', isSentFromMe: true }],
      },
      next: { id: 'conversation_mother', index: 7 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'mother', partNumber: 4 },
      next: { id: 'conversation_mother', index: 8 },
    },
    {
      type: 'monologue',
      data: [
        '외롭다고 너무나도 말하고 싶은데',
        '엄마한텐 절대 말할수가 없어',
        '괴로워',
      ],
      next: { id: 'conversation_sister_2', index: 0 },
    },
  ],
  conversation_sister_2: [
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 3 },
      next: { id: 'conversation_sister_2', index: 1 },
    },
    {
      type: 'monologue',
      data: ['그만해.. 더 이상 듣고 싶지 않아..'],
      next: { id: 'conversation_sister_2', index: 2 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 4 },
      next: { id: 'conversation_colleague', index: 0 },
    },
  ],
  conversation_colleague: [
    {
      type: 'chatFromOpponent',
      data: { key: 'colleague', partNumber: 1 },
      next: { id: 'conversation_colleague', index: 1 },
    },
    {
      type: 'monologue',
      data: [
        '민영씨..',
        '회사 다니면서 처음으로 생긴 후배라서',
        '잘 챙겨주고 싶었는데.',
      ],
      next: { id: 'conversation_colleague', index: 2 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'mother',
        messages: [
          {
            id: generateId(),
            message: '못 챙겨줘서 미안해요',
            isSentFromMe: true,
          },
        ],
      },
      next: { id: 'conversation_colleague', index: 3 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'colleague', partNumber: 2 },
      next: { id: 'conversation_colleague', index: 4 },
    },
    {
      type: 'monologue',
      data: [
        '그치만 내가 일을 잘하는것도 아니고',
        '날 존경한다거나하는 마음도 전혀 없겠지',
        '괜히 항상 미안한 마음밖에 없다.',
      ],
      next: { id: 'conversation_colleague', index: 5 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'colleague',
        messages: [
          {
            id: generateId(),
            message: '그건 그냥… 습관처럼 한 거였는데.',
            isSentFromMe: true,
          },
        ],
      },
      next: { id: 'conversation_colleague', index: 6 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'colleague', partNumber: 3 },
      next: { id: 'conversation_sister_3', index: 0 },
    },
  ],
  conversation_sister_3: [
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 5 },
      next: { id: 'conversation_sister_3', index: 1 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'future_self',
        messages: [
          {
            id: generateId(),
            message: '알아, 난 쓸모 없어.',
            isSentFromMe: true,
          },
          {
            id: generateId(),
            message: '그냥 죽는게 나을걸.',
            isSentFromMe: true,
          },
        ],
      },
      next: { id: 'conversation_sister_3', index: 2 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 6 },
      next: { id: 'realization', index: 0 },
    },
  ],
  realization: [
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 7 },
      next: { id: 'realization', index: 1 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'sister',
        messages: [
          {
            id: generateId(),
            message: '…맞아. 근데 왜 갇힌 건 나야?',
            isSentFromMe: true,
          },
        ],
      },
      next: { id: 'realization', index: 2 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 8 },
      next: { id: 'realization', index: 3 },
    },
    // todo: 배경 이미지 전환
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 9 },
      next: { id: 'realization', index: 4 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'future_self', partNumber: 1 },
      next: { id: 'realization', index: 5 },
    },
    {
      type: 'monologue',
      data: ['……내가, 나를 가둔 거였어.'],
      next: { id: 'realization', index: 6 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'sister',
        messages: [
          { id: generateId(), message: '그럴수가', isSentFromMe: true },
        ],
      },
      next: { id: 'realization', index: 7 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'future_self', partNumber: 2 },
      next: { id: 'realization', index: 8 },
    },
    {
      type: 'chatFromOpponent',
      data: { key: 'sister', partNumber: 10 },
      next: { id: 'realization', index: 9 },
    },
    {
      type: 'chatFromMe',
      data: {
        key: 'future_self',
        messages: [
          { id: generateId(), message: '…그래.', isSentFromMe: true },
          {
            id: generateId(),
            message: '이제 도망치지 않을게.',
            isSentFromMe: true,
          },
          { id: generateId(), message: '나를 받아들일게.', isSentFromMe: true },
        ],
      },
      next: null,
    },
  ],
};

// 챕터 메타데이터 (nextChapter 정보 포함)
export const chapterMetadata = {
  opening: { nextChapter: 'conversation_friend' },
  conversation_friend: { nextChapter: 'conversation_sister_1' },
  conversation_sister_1: { nextChapter: 'conversation_mother' },
  conversation_mother: { nextChapter: 'conversation_sister_2' },
  conversation_sister_2: { nextChapter: 'conversation_colleague' },
  conversation_colleague: { nextChapter: 'conversation_sister_3' },
  conversation_sister_3: { nextChapter: 'realization' },
  realization: { nextChapter: null },
};

// 챕터 진행 상태 관리 (로컬 스토리지 사용)
const STORAGE_KEY = 'game_chapter_progress';

export const chapterProgress = {
  currentChapterId: 'opening', // 현재 챕터 ID
  completedChapters: [],
  unlockedChapters: [
    'opening',
    'conversation_friend',
    'conversation_sister_1',
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
    return chapters[id] ? { id, steps: chapters[id] } : null;
  },

  // 챕터의 특정 스텝 가져오기
  getChapterStep: (chapterId, stepIndex) => {
    return chapters[chapterId] && chapters[chapterId][stepIndex]
      ? chapters[chapterId][stepIndex]
      : null;
  },

  // 현재 챕터 가져오기
  getCurrentChapter: () => {
    const currentChapterId = chapterProgress.currentChapterId;
    return chapters[currentChapterId]
      ? { id: currentChapterId, steps: chapters[currentChapterId] }
      : null;
  },

  // 다음 챕터로 진행
  goToNextChapter: () => {
    const currentChapterId = chapterProgress.currentChapterId;
    const metadata = chapterMetadata[currentChapterId];

    if (metadata && metadata.nextChapter) {
      const nextChapterId = metadata.nextChapter;
      if (chapters[nextChapterId]) {
        chapterProgress.currentChapterId = nextChapterId;
        if (!chapterProgress.unlockedChapters.includes(nextChapterId)) {
          chapterProgress.unlockedChapters.push(nextChapterId);
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
    saveChapterProgress();
  },

  // 특정 챕터로 이동 (개발자용)
  goToChapter: chapterId => {
    if (
      chapterProgress.unlockedChapters.includes(chapterId) &&
      chapters[chapterId]
    ) {
      chapterProgress.currentChapterId = chapterId;
      saveChapterProgress();
      return true;
    }
    return false;
  },

  // 진행률 계산
  getProgress: () => {
    const totalChapters = Object.keys(chapters).length;
    const completedCount = chapterProgress.completedChapters.length;
    return Math.round((completedCount / totalChapters) * 100);
  },

  // 모든 챕터 목록 가져오기
  getAllChapters: () => {
    return Object.keys(chapters).map(id => ({ id, steps: chapters[id] }));
  },

  // 잠금 해제된 챕터 목록
  getUnlockedChapters: () => {
    return chapterProgress.unlockedChapters.map(id => ({
      id,
      steps: chapters[id],
    }));
  },

  // 챕터의 스텝 개수 가져오기
  getChapterStepCount: chapterId => {
    return chapters[chapterId] ? chapters[chapterId].length : 0;
  },

  // 챕터 메타데이터 가져오기
  getChapterMetadata: chapterId => {
    return chapterMetadata[chapterId] || null;
  },

  // 진행 상황 초기화 (개발자용)
  resetProgress: () => {
    chapterProgress.currentChapterId = 'opening';
    chapterProgress.completedChapters = [];
    chapterProgress.unlockedChapters = [
      'opening',
      'conversation_friend',
      'conversation_sister_1',
      'conversation_mother',
      'conversation_colleague',
    ];
    saveChapterProgress();
  },
};
