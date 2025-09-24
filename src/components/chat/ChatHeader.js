import React from 'react';
import styled from 'styled-components';
import colors from '../../styles/colors';

export default function ChatHeader({ title, onBack }) {
  return (
    <HeaderContainer>
      {onBack && <BackButton onClick={onBack}>←</BackButton>}
      <Title>{title}</Title>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  background: ${colors.darkGray};
  padding: 20px;
  border-bottom: 1px solid ${colors.lightGray};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.white};
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background 0.3s ease;

  &:hover {
    background: ${colors.lightGray};
  }
`;

const Title = styled.h2`
  color: ${colors.white};
  margin: 0;
  font-size: 20px;
`;
