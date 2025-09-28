import styled from 'styled-components';
import phoneIcon from '../images/icon_phone.png';
import { storageUtils } from '../utils/storage';

export default function BottomArea({ onChatOpenClick }) {
  // 로컬 스토리지 데이터 삭제 함수
  const clearLocalStorageData = () => {
    try {
      // 1. 접두어로 시작하는 모든 게임 데이터 삭제
      const success = storageUtils.clearAll();

      if (!success) {
        // eslint-disable-next-line no-console
        console.warn('일반 삭제 실패, 강제 삭제 시도');
        // 2. 강제 삭제: 모든 가능한 키들을 직접 삭제
        const allKeys = [
          'escape_game_characters',
          'escape_game_chapter_progress',
          'escape_game_message_progress',
          'escape_game_step_progress',
        ];

        // 각 채팅방 데이터도 삭제
        const chatIds = [
          'friend',
          'sister',
          'mother',
          'colleague',
          'future_self',
        ];
        chatIds.forEach(chatId => {
          allKeys.push(`escape_game_chat_${chatId}`);
          allKeys.push(`escape_game_unread_${chatId}`);
        });

        allKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`강제 삭제 실패: ${key}`, error);
          }
        });
      }

      // 3. 최종 검증
      const remainingGameKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('escape_game_')) {
          remainingGameKeys.push(key);
        }
      }

      if (remainingGameKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('리셋 후 남은 게임 데이터:', remainingGameKeys);
      } else {
        // eslint-disable-next-line no-console
        console.log('게임 데이터 완전 삭제 완료');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('로컬 스토리지 삭제 중 오류:', error);
    }
  };

  const handleResetGame = () => {
    const confirmed = window.confirm(
      '게임 데이터가 초기화됩니다. 초기화 하시겠습니까?'
    );

    if (confirmed) {
      // 1. 먼저 로컬 스토리지 데이터 완전 삭제
      clearLocalStorageData();

      // todo: 초기화 로직 작성.
      // 2. 잠시 대기 후 상태 초기화 (로컬스토리지 삭제 완료 보장)
      setTimeout(() => {
        // // 게임 데이터 초기화
        // chapterUtils.resetProgress();

        // // 모든 상태 초기화
        // setCurrentChapter(chapterUtils.getCurrentChapter());
        // setCurrentStepIndex(0);
        // setCurrentTextIndex(0);
        // setIsMonologueOpen(false);
        // setIsChatOpen(false);
        // setSelectedChat(null);
        // setAvailableChats([]);
        // setDialogueData({});
        // setHasLocalData({});

        // 페이지 새로고침으로 완전한 초기화 보장
        window.location.reload();
      }, 100);
    }
  };

  return (
    <Container>
      <PhoneIcon src={phoneIcon} alt="Phone Icon" onClick={onChatOpenClick} />
      <ResetButton onClick={handleResetGame}>🔄</ResetButton>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #333;
`;

const PhoneIcon = styled.img`
  width: 40px;
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const MonologueButton = styled.button`
  width: 40px;
  height: 40px;
  background: #28a745;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;

const ResetButton = styled.button`
  width: 40px;
  height: 40px;
  background: #dc3545;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  margin-left: 10px;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.8;
  }
`;
