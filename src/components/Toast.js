import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../styles/colors';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const pulse = keyframes`
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  animation: ${props => (props.isVisible ? fadeIn : fadeOut)} 0.3s ease-in-out;
`;

const ToastMessage = styled.div`
  color: ${colors.white};
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  background: ${colors.darkGray};
  padding: 15px 30px;
  border-radius: 24px;
  border: 2px solid ${colors.point};
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.6),
    0 0 0 3px ${colors.point},
    0 0 20px rgba(255, 152, 0, 0.3);
  animation: ${pulse} 2s infinite;
`;

export default function Toast({ message, isVisible }) {
  if (!message) return null;

  return (
    <ToastContainer isVisible={isVisible}>
      <ToastMessage>{message}</ToastMessage>
    </ToastContainer>
  );
}
