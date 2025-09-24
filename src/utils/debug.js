// 개발자용 디버그 유틸리티
import { chapterUtils } from '../data/monologues';

// 개발자 콘솔에서 사용할 수 있는 전역 함수들
window.debugGame = {
  // 현재 챕터 정보 보기
  getCurrentChapter: () => {
    const chapter = chapterUtils.getCurrentChapter();
    console.log('현재 챕터:', chapter);
    return chapter;
  },
  
  // 모든 챕터 목록 보기
  getAllChapters: () => {
    const chapters = chapterUtils.getAllChapters();
    console.log('모든 챕터:', chapters);
    return chapters;
  },
  
  // 진행률 보기
  getProgress: () => {
    const progress = chapterUtils.getProgress();
    console.log(`진행률: ${progress}%`);
    return progress;
  },
  
  // 특정 챕터로 이동
  goToChapter: (chapterId) => {
    const success = chapterUtils.goToChapter(chapterId);
    if (success) {
      console.log(`챕터 ${chapterId}로 이동 완료`);
      window.location.reload(); // 페이지 새로고침으로 상태 업데이트
    } else {
      console.log(`챕터 ${chapterId}로 이동 실패 (잠금 상태)`);
    }
    return success;
  },
  
  // 진행 상황 초기화
  resetProgress: () => {
    chapterUtils.resetProgress();
    console.log('진행 상황 초기화 완료');
    window.location.reload();
  },
  
  // 다음 챕터로 이동
  nextChapter: () => {
    const success = chapterUtils.goToNextChapter();
    if (success) {
      console.log('다음 챕터로 이동 완료');
      window.location.reload();
    } else {
      console.log('다음 챕터가 없습니다');
    }
    return success;
  },
  
  // 도움말
  help: () => {
    console.log(`
🎮 게임 디버그 명령어:

debugGame.getCurrentChapter() - 현재 챕터 정보
debugGame.getAllChapters() - 모든 챕터 목록
debugGame.getProgress() - 진행률 확인
debugGame.goToChapter('explore') - 특정 챕터로 이동
debugGame.nextChapter() - 다음 챕터로 이동
debugGame.resetProgress() - 진행 상황 초기화
debugGame.help() - 이 도움말 보기

사용 예시:
debugGame.goToChapter('discover')
debugGame.resetProgress()
    `);
  }
};

// 개발 환경에서만 콘솔에 안내 메시지 표시
if (process.env.NODE_ENV === 'development') {
  console.log(`
🎮 게임 디버그 모드 활성화
브라우저 콘솔에서 debugGame.help()를 입력하여 사용 가능한 명령어를 확인하세요.
  `);
}
