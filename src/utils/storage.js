// 로컬 스토리지 키 관리
export const STORAGE_KEYS = {
  PREFIX: 'escape_game_',
  CHARACTERS: 'characters',
  CHAT_MESSAGE: characterId => `chat_${characterId}`,
  CHAPTER_PROGRESS: 'chapter_progress',
  MESSAGE_PROGRESS: 'message_progress',
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

      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('로컬 스토리지 전체 삭제 실패:', error);
      return false;
    }
  },
};
