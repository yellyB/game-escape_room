// 간단한 ID 생성 함수
const generateId = () => Math.random().toString(36).substr(2, 9);

// 스토리 캐릭터들과의 채팅 데이터
export const chatRooms = [
  {
    id: 'friend_mina',
    name: '👭 친구 (민아)',
    lastMessage: '너 왜 동창회 안왔어?',
    time: '오후 2:30',
    unread: 1,
  },
  {
    id: 'sister',
    name: '👧 여동생 (과거의 나)',
    lastMessage: '풉. 쟤 참 착하다.',
    time: '오후 2:25',
    unread: 2,
  },
  {
    id: 'mom',
    name: '👩 엄마',
    lastMessage: '딸 생각해보니까 요즘에 엄마가 잘 못챙겨준것 같네',
    time: '오후 2:20',
    unread: 1,
  },
  {
    id: 'junior',
    name: '🧑‍💻 회사 후배',
    lastMessage: '선배?! 왜이렇게 길게 휴가를 쓰셨어요?',
    time: '오후 2:15',
    unread: 1,
  },
];

// 메시지 진행 상태 관리
export const messageProgress = {
  friend_mina: 0,
  sister: 0,
  mom: 0,
  junior: 0,
};

// 각 채팅방의 단계별 메시지 데이터
export const getChatMessages = (chatId, phase = 0) => {
  const phaseMessages = {
    friend: [
      [
        {
          id: generateId(),
          text: '……난 그냥 없어져도 아무도 모를 줄 알았어.',
        },
      ],
      [
        {
          id: generateId(),
          text: '…그게 그렇게 중요했어?',
        },
      ],
    ],
    mother: [
      [
        {
          id: generateId(),
          text: '엄마 난 아무것도 아닌 것 같아.',
        },
      ],
      [
        {
          id: generateId(),
          text: '엄마..',
        },
      ],
    ],
    colleague: [
      [
        {
          id: generateId(),
          text: '못 챙겨줘서 미안해요',
        },
      ],
      [
        {
          id: generateId(),
          text: '그건 그냥… 습관처럼 한 거였는데.',
        },
      ],
    ],
    future_self: [
      [
        {
          id: generateId(),
          text: '그럴수가',
        },
      ],
      [
        {
          id: generateId(),
          text: '…그래.',
        },
        {
          id: generateId(),
          text: '이제 도망치지 않을게.',
        },
        {
          id: generateId(),
          text: '나를 받아들일게.',
        },
      ],
    ],
  };

  return phaseMessages[chatId]?.[phase] || [];
};

// 메시지 진행 상태 관리 함수들
export const messageProgressUtils = {
  // 특정 채팅방의 현재 단계 가져오기
  getCurrentPhase: chatId => {
    return messageProgress[chatId] || 0;
  },

  // 특정 채팅방의 단계 증가
  incrementPhase: chatId => {
    if (messageProgress[chatId] !== undefined) {
      messageProgress[chatId]++;
      // 로컬 스토리지에 저장
      localStorage.setItem('messageProgress', JSON.stringify(messageProgress));
    }
  },

  // 메시지 진행 상태 초기화
  resetProgress: () => {
    Object.keys(messageProgress).forEach(key => {
      messageProgress[key] = 0;
    });
    localStorage.setItem('messageProgress', JSON.stringify(messageProgress));
  },

  // 로컬 스토리지에서 진행 상태 로드
  loadProgress: () => {
    try {
      const saved = localStorage.getItem('messageProgress');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(messageProgress, data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('메시지 진행 상태 로드 실패:', error);
    }
  },
};
