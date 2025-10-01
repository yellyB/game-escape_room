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

const blink = keyframes`
  0% {
    background: ${colors.lightGray};
  }
  50% {
    background: ${colors.darkGray};
  }
  100% {
    background: ${colors.lightGray};
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
  background: ${colors.darkGray};
  color: ${colors.white};
  padding: 14px 28px;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.6),
    0 0 0 3px ${colors.point},
    0 0 20px rgba(255, 152, 0, 0.3);
  border: 2px solid ${colors.point};
  max-width: 400px;
  word-wrap: break-word;
  position: relative;
  overflow: hidden;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  animation: ${blink} 0.8s infinite;
`;

export default function Toast({ message, isVisible }) {
  if (!message) return null;

  return (
    <ToastContainer isVisible={isVisible}>
      <ToastMessage>{message}</ToastMessage>
    </ToastContainer>
  );
}
