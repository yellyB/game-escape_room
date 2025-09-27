// 로컬 스토리지 키 관리
export const STORAGE_KEYS = {
  PREFIX: 'escape_game_',
  CHARACTERS: 'characters',
  CHAT_MESSAGE: characterId => `chat_${characterId}`,
  CHAPTER_PROGRESS: 'chapter_progress',
  MESSAGE_PROGRESS: 'message_progress',
  STEP_PROGRESS: 'step_progress',
  UNREAD_MESSAGE: characterId => `unread_${characterId}`,
};

// 로컬 스토리지 키 생성 헬퍼
export const getStorageKey = key => `${STORAGE_KEYS.PREFIX}${key}`;

// 로컬 스토리지 데이터 관리 유틸 함수들
export const storageUtils = {
  // 데이터 저장
  set: (key, data) => {
    try {
      const storageKey = getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 저장 실패:', error);
      return false;
    }
  },

  // 데이터 불러오기
  get: (key, defaultValue = null) => {
    try {
      const storageKey = getStorageKey(key);
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 불러오기 실패:', error);
      return defaultValue;
    }
  },

  // 데이터 존재 여부 확인
  has: key => {
    try {
      const storageKey = getStorageKey(key);
      return localStorage.getItem(storageKey) !== null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 확인 실패:', error);
      return false;
    }
  },

  // 데이터 삭제
  remove: key => {
    try {
      const storageKey = getStorageKey(key);
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 삭제 실패:', error);
      return false;
    }
  },

  // 모든 게임 데이터 삭제
  clearAll: () => {
    try {
      // 모든 게임 관련 키 찾아서 삭제
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.PREFIX)) {
          keysToRemove.push(key);
        }
      }

      // 각 키를 개별적으로 삭제
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`키 삭제 실패: ${key}`, error);
        }
      });

      // 추가 검증: 남은 게임 관련 키가 있는지 확인
      const remainingKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.PREFIX)) {
          remainingKeys.push(key);
        }
      }

      if (remainingKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('일부 게임 데이터가 남아있습니다:', remainingKeys);
        // 강제로 남은 키들도 삭제
        remainingKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`강제 삭제 실패: ${key}`, error);
          }
        });
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 전체 삭제 실패:', error);
      return false;
    }
  },

  // 특정 캐릭터의 대화 데이터 삭제
  removeChatData: characterId => {
    return storageUtils.remove(STORAGE_KEYS.CHAT_MESSAGE(characterId));
  },

  // 캐릭터 데이터 삭제
  removeCharacters: () => {
    return storageUtils.remove(STORAGE_KEYS.CHARACTERS);
  },

  // 챕터 진행 데이터 삭제
  removeChapterProgress: () => {
    return storageUtils.remove(STORAGE_KEYS.CHAPTER_PROGRESS);
  },

  // 메시지 진행 데이터 삭제
  removeMessageProgress: () => {
    return storageUtils.remove(STORAGE_KEYS.MESSAGE_PROGRESS);
  },
};
