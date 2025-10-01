import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      duration,
      isVisible: true,
    };

    setToasts(prev => [...prev, newToast]);

    // 자동 제거
    setTimeout(() => {
      setToasts(prev =>
        prev.map(toast =>
          toast.id === id ? { ...toast, isVisible: false } : toast
        )
      );

      // 애니메이션 완료 후 DOM에서 제거
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 300);
    }, duration);
  }, []);

  const hideToast = useCallback(id => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );

    // 애니메이션 완료 후 DOM에서 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 300);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showToast,
    hideToast,
    clearAllToasts,
  };

  // 전역 참조 설정
  React.useEffect(() => {
    setToastContextRef({ showToast });
  }, [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          isVisible={toast.isVisible}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// 전역 message 함수를 위한 컨텍스트 참조
let toastContextRef = null;

export const setToastContextRef = ref => {
  toastContextRef = ref;
};

// 전역 message 함수
export const message = (text, duration = 3000) => {
  if (toastContextRef) {
    toastContextRef.showToast(text, duration);
  } else {
    console.warn(
      'Toast context not available. Make sure ToastProvider is properly set up.'
    );
  }
};
