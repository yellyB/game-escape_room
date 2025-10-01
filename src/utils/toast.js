import { message } from '../contexts/ToastContext';

// 전역 message 함수를 window 객체에 추가
if (typeof window !== 'undefined') {
  window.message = message;
}

export { message };
