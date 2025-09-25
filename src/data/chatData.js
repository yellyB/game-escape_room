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
    friend_mina: {
      0: [
        {
          text: '너 왜 동창회 안왔어?',
          isOwn: false,
          timestamp: Date.now() - 10000,
        },
        {
          text: '안온다는거 겨우 설득해놨더니 갑자기 잠수타버려서',
          isOwn: false,
          timestamp: Date.now() - 9900,
        },
        {
          text: '다들 걱정했잖아!',
          isOwn: false,
          timestamp: Date.now() - 9800,
        },
        {
          text: '……난 그냥 없어져도 아무도 모를 줄 알았어.',
          isOwn: true,
          timestamp: Date.now() - 9000,
        },
        {
          text: '엥',
          isOwn: false,
          timestamp: Date.now() - 8000,
        },
        {
          text: '뭔 소리야',
          isOwn: false,
          timestamp: Date.now() - 7900,
        },
        {
          text: '오늘도 주희가 썰렁한 개그 엄청 했는데',
          isOwn: false,
          timestamp: Date.now() - 7800,
        },
        {
          text: '그거 웃기다고 웃어주는 사람이 없어서 반응하느라 힘들었다구ㅠ.ㅠ',
          isOwn: false,
          timestamp: Date.now() - 7700,
        },
        {
          text: '…그게 그렇게 중요했어?',
          isOwn: true,
          timestamp: Date.now() - 7000,
        },
        {
          text: '당연하지',
          isOwn: false,
          timestamp: Date.now() - 6000,
        },
        {
          text: '남 말에 리액션 해주고 들어주는게 얼마나 큰건데',
          isOwn: false,
          timestamp: Date.now() - 5900,
        },
        {
          text: '너는 항상 친구들 고민도 침착하게 잘 들어줘서',
          isOwn: false,
          timestamp: Date.now() - 5800,
        },
        {
          text: '우리가 친해진것도 내가 너한테 고민상담하다가 그런거였잖아',
          isOwn: false,
          timestamp: Date.now() - 5700,
        },
        {
          text: '그래서 암튼',
          isOwn: false,
          timestamp: Date.now() - 5600,
        },
        {
          text: '왜 안온거야? 무슨 일 있던거 아니지?',
          isOwn: false,
          timestamp: Date.now() - 5500,
        },
      ],
    },
    sister: {
      0: [
        {
          text: '풉.',
          isOwn: false,
          timestamp: Date.now() - 10000,
        },
        {
          text: '쟤 참 착하다.',
          isOwn: false,
          timestamp: Date.now() - 9900,
        },
        {
          text: '네 웃음소리가 그리웠대.',
          isOwn: false,
          timestamp: Date.now() - 9800,
        },
        {
          text: '웃기지 않냐? 언니는 제대로 웃은 적도 없는데.',
          isOwn: false,
          timestamp: Date.now() - 9700,
        },
        {
          text: "사랑받으려고 맨날 '인기 많아지는법' 같은거 검색하고",
          isOwn: false,
          timestamp: Date.now() - 9000,
        },
        {
          text: '앞으로 리액션 좋은 사람이 되어야겠다고 하던거',
          isOwn: false,
          timestamp: Date.now() - 8900,
        },
        {
          text: '진짜 찌질이 그자체였는데 말이야.',
          isOwn: false,
          timestamp: Date.now() - 8800,
        },
        {
          text: '가면 쓴 모습으로 받는 사랑이 의미가 있나?',
          isOwn: false,
          timestamp: Date.now() - 8700,
        },
      ],
      1: [
        {
          text: '뭐, 됐고',
          isOwn: false,
          timestamp: Date.now() - 8000,
        },
        {
          text: '여기 들어오기 전에 엄마랑 한바탕 한거 기억나지?',
          isOwn: false,
          timestamp: Date.now() - 7900,
        },
        {
          text: '그것때문에 나한테 "열등감폭발"해서 날 가두려던거잖아',
          isOwn: false,
          timestamp: Date.now() - 7800,
        },
        {
          text: '언니가 그동안 엄마 속였던거, 그건 죄책감 안들어?',
          isOwn: false,
          timestamp: Date.now() - 7700,
        },
        {
          text: '나처럼 엄마한테 기쁨만 주는 착한 딸은',
          isOwn: false,
          timestamp: Date.now() - 7600,
        },
        {
          text: '상상도 못하는 일이네~~',
          isOwn: false,
          timestamp: Date.now() - 7500,
        },
      ],
      2: [
        {
          text: '들었냐?',
          isOwn: false,
          timestamp: Date.now() - 7000,
        },
        {
          text: '엄마는 널 자랑스러웠다고 말하는데 그거 믿는거 아니지?',
          isOwn: false,
          timestamp: Date.now() - 6900,
        },
        {
          text: '너 하나로 충분했으면 왜 날 만들었을까? ㅋㅋ',
          isOwn: false,
          timestamp: Date.now() - 6800,
        },
        {
          text: '답 나왔지? 네 머릿속 환상일 뿐이니까.',
          isOwn: false,
          timestamp: Date.now() - 6700,
        },
        {
          text: '너가 좋은 회사 다닌다고 되게 자랑하고 다니시던데,',
          isOwn: false,
          timestamp: Date.now() - 6500,
        },
        {
          text: '회사에서 맨날 실수하고 인정 못받는 폐급이라는거 알면 어떠시려나?',
          isOwn: false,
          timestamp: Date.now() - 6400,
        },
      ],
      3: [
        {
          text: '웃기지 않냐?',
          isOwn: false,
          timestamp: Date.now() - 6000,
        },
        {
          text: '네가 남긴 쪼가리 종이 하나가 뭐라고.',
          isOwn: false,
          timestamp: Date.now() - 5900,
        },
        {
          text: '그 정도로 보잘것없는 게 네 "성과"야.',
          isOwn: false,
          timestamp: Date.now() - 5800,
        },
        {
          text: '대~~단하다, 진짜. ㅋㅋ',
          isOwn: false,
          timestamp: Date.now() - 5700,
        },
        {
          text: '근데 말이야, 네가 그렇게 대단하다면',
          isOwn: false,
          timestamp: Date.now() - 5500,
        },
        {
          text: '왜 스스로는 못 살리냐?',
          isOwn: false,
          timestamp: Date.now() - 5400,
        },
        {
          text: '고작 이 작은 방 하나도 나가지 못하는데',
          isOwn: false,
          timestamp: Date.now() - 5300,
        },
        {
          text: '넌 날 미워했잖아.',
          isOwn: false,
          timestamp: Date.now() - 5000,
        },
        {
          text: '내가 행복하던 시절이 네겐 꼴 보기 싫었지.',
          isOwn: false,
          timestamp: Date.now() - 4900,
        },
        {
          text: '그래서 날 가두려고 했잖아.',
          isOwn: false,
          timestamp: Date.now() - 4800,
        },
        {
          text: '…맞아. 근데 왜 갇힌 건 나야?',
          isOwn: true,
          timestamp: Date.now() - 4500,
        },
        {
          text: '간단하지.',
          isOwn: false,
          timestamp: Date.now() - 4000,
        },
        {
          text: '난 네 머릿속에만 있으니까.',
          isOwn: false,
          timestamp: Date.now() - 3900,
        },
        {
          text: '넌 나를 버리고, 미워하고, 저주했어.',
          isOwn: false,
          timestamp: Date.now() - 3800,
        },
        {
          text: '그래서 너 스스로를 가둔 거야.',
          isOwn: false,
          timestamp: Date.now() - 3700,
        },
        {
          text: '난 네 어린 날이야.',
          isOwn: false,
          timestamp: Date.now() - 3500,
        },
        {
          text: '네가 제일 부러워했고, 제일 싫어했던…',
          isOwn: false,
          timestamp: Date.now() - 3400,
        },
        {
          text: '너 자신.',
          isOwn: false,
          timestamp: Date.now() - 3300,
        },
        {
          text: '이제 알겠지?',
          isOwn: false,
          timestamp: Date.now() - 3000,
        },
        {
          text: '문은 밖에서 잠긴 적 없어.',
          isOwn: false,
          timestamp: Date.now() - 2900,
        },
        {
          text: '네가 스스로 잠근 거야.',
          isOwn: false,
          timestamp: Date.now() - 2800,
        },
        {
          text: '……내가, 나를 가둔 거였어.',
          isOwn: true,
          timestamp: Date.now() - 2500,
        },
        {
          text: '그럴수가',
          isOwn: true,
          timestamp: Date.now() - 2000,
        },
        {
          text: '열쇠도 네가 가지고 있어.',
          isOwn: false,
          timestamp: Date.now() - 1500,
        },
        {
          text: '그냥 이런 널 받아들여',
          isOwn: false,
          timestamp: Date.now() - 1400,
        },
        {
          text: '흥, 그래.',
          isOwn: false,
          timestamp: Date.now() - 1000,
        },
        {
          text: '날 혐오하든 뭐든, 난 네 일부야.',
          isOwn: false,
          timestamp: Date.now() - 900,
        },
        {
          text: '마찬가지로 못난 네 모습도 너이고.',
          isOwn: false,
          timestamp: Date.now() - 800,
        },
        {
          text: '그러니까 자꾸 숨기려고 하지마.',
          isOwn: false,
          timestamp: Date.now() - 700,
        },
        {
          text: '나 없인 네가 네가 아니니까.',
          isOwn: false,
          timestamp: Date.now() - 600,
        },
        {
          text: '…그래.',
          isOwn: true,
          timestamp: Date.now() - 500,
        },
        {
          text: '이제 도망치지 않을게.',
          isOwn: true,
          timestamp: Date.now() - 400,
        },
        {
          text: '나를 받아들일게.',
          isOwn: true,
          timestamp: Date.now() - 300,
        },
      ],
    },
    mom: {
      0: [
        {
          text: '딸',
          isOwn: false,
          timestamp: Date.now() - 10000,
        },
        {
          text: '생각해보니까 요즘에 엄마가 잘 못챙겨준것 같네',
          isOwn: false,
          timestamp: Date.now() - 9900,
        },
        {
          text: '자취하면서 밥은 잘 챙겨 먹고 있니?',
          isOwn: false,
          timestamp: Date.now() - 9800,
        },
        {
          text: '엄마 난 아무것도 아닌 것 같아.',
          isOwn: true,
          timestamp: Date.now() - 9000,
        },
        {
          text: '그런 소리 말아.',
          isOwn: false,
          timestamp: Date.now() - 8000,
        },
        {
          text: '재능도 있는데 열심히 노력해서',
          isOwn: false,
          timestamp: Date.now() - 7900,
        },
        {
          text: '원하는 학과 진학하고 좋은 디자인 회사에서 일하는데',
          isOwn: false,
          timestamp: Date.now() - 7800,
        },
        {
          text: '그게 어떻게 아무것도 아니니?',
          isOwn: false,
          timestamp: Date.now() - 7700,
        },
        {
          text: '나랑 아빠랑 둘다 맞벌이하느라 집에 없을때가 대부분이었는데',
          isOwn: false,
          timestamp: Date.now() - 7000,
        },
        {
          text: '다 클때까지 불만도 한번 없이',
          isOwn: false,
          timestamp: Date.now() - 6900,
        },
        {
          text: '외로울텐데도 혼자서도 몇 시간을 꼬박 앉아 있던 네 모습',
          isOwn: false,
          timestamp: Date.now() - 6800,
        },
        {
          text: '엄마한텐 너무 든든했어.',
          isOwn: false,
          timestamp: Date.now() - 6700,
        },
        {
          text: '하나밖에 없는 딸이 이렇게 잘 커줘서',
          isOwn: false,
          timestamp: Date.now() - 6000,
        },
        {
          text: '엄마는 너무 자랑스러워',
          isOwn: false,
          timestamp: Date.now() - 5900,
        },
        {
          text: '너는 아무것도 아닌게 아니야',
          isOwn: false,
          timestamp: Date.now() - 5800,
        },
        {
          text: '절대로',
          isOwn: false,
          timestamp: Date.now() - 5700,
        },
        {
          text: '엄마..',
          isOwn: true,
          timestamp: Date.now() - 5000,
        },
      ],
    },
    junior: {
      0: [
        {
          text: '선배?!',
          isOwn: false,
          timestamp: Date.now() - 10000,
        },
        {
          text: '왜이렇게 길게 휴가를 쓰셨어요?',
          isOwn: false,
          timestamp: Date.now() - 9900,
        },
        {
          text: '휴가는 하루 이상으로 절대 안쓰시던분이..',
          isOwn: false,
          timestamp: Date.now() - 9800,
        },
        {
          text: '민영씨..',
          isOwn: true,
          timestamp: Date.now() - 9000,
        },
        {
          text: '회사 다니면서 처음으로 생긴 후배라서',
          isOwn: true,
          timestamp: Date.now() - 8900,
        },
        {
          text: '잘 챙겨주고 싶었는데.',
          isOwn: true,
          timestamp: Date.now() - 8800,
        },
        {
          text: '그치만 내가 일을 잘하는것도 아니고',
          isOwn: true,
          timestamp: Date.now() - 8700,
        },
        {
          text: '날 존경한다거나 그런 마음이 전혀 없겠지',
          isOwn: true,
          timestamp: Date.now() - 8600,
        },
        {
          text: '괜히 항상 미안한 마음밖에 없다.',
          isOwn: true,
          timestamp: Date.now() - 8500,
        },
        {
          text: '못 챙겨줘서 미안해요',
          isOwn: true,
          timestamp: Date.now() - 8000,
        },
        {
          text: '네?? 갑자기요??!!',
          isOwn: false,
          timestamp: Date.now() - 7000,
        },
        {
          text: '저한텐요.',
          isOwn: false,
          timestamp: Date.now() - 6900,
        },
        {
          text: '선배가 제 얘기 들어주고,',
          isOwn: false,
          timestamp: Date.now() - 6800,
        },
        {
          text: '제가 실수라도 하면, 그럴수도 있다면서',
          isOwn: false,
          timestamp: Date.now() - 6700,
        },
        {
          text: '몰래 책상에 응원 포스트잇 붙여주던 거…',
          isOwn: false,
          timestamp: Date.now() - 6600,
        },
        {
          text: '그 덕분에 버틴 날이 얼마나 많은데요.',
          isOwn: false,
          timestamp: Date.now() - 6500,
        },
        {
          text: '그건 그냥… 습관처럼 한 거였는데.',
          isOwn: true,
          timestamp: Date.now() - 6000,
        },
        {
          text: '작은 거라도 누군가한테는 세상을 버티게 하는 이유가 돼요.',
          isOwn: false,
          timestamp: Date.now() - 5000,
        },
      ],
    },
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
