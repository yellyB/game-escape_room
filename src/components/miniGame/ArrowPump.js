'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

const STAGE_LENGTHS = [5, 6, 7, 8];
const DIRECTIONS = ['up', 'down', 'left', 'right'];

export default function ArrowPumpGame() {
  const [gameState, setGameState] = useState('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [wrongIndex, setWrongIndex] = useState(null);

  const dirSymbol = { up: '↑', down: '↓', left: '←', right: '→' };

  const randomSequence = len =>
    Array.from(
      { length: len },
      () => DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
    );

  const initStage = useCallback((idx, keepSeq = false) => {
    setStageIndex(idx);
    if (!keepSeq) setSequence(randomSequence(STAGE_LENGTHS[idx]));
    setInputIndex(0);
    setWrongIndex(null);
    setGameState('playing');
  }, []);

  const restartAll = useCallback(() => {
    setStageIndex(0);
    setSequence([]);
    setInputIndex(0);
    setWrongIndex(null);
    setGameState('idle');
  }, []);

  const handleStageClear = useCallback(() => {
    if (stageIndex >= STAGE_LENGTHS.length - 1) {
      setGameState('win');
    } else {
      setTimeout(() => initStage(stageIndex + 1), 500);
    }
  }, [stageIndex, initStage]);

  const handleInput = useCallback(
    dir => {
      if (gameState !== 'playing') return;
      const expected = sequence[inputIndex];
      if (!expected) return;

      if (dir === expected) {
        const next = inputIndex + 1;
        setInputIndex(next);
        if (next >= sequence.length) handleStageClear();
      } else {
        // 틀린 인덱스 강조 후 순서는 그대로, 처음부터
        setWrongIndex(inputIndex);
        setTimeout(() => setWrongIndex(null), 800);
        setTimeout(() => {
          setInputIndex(0);
          setGameState('playing');
        }, 1000);
      }
    },
    [gameState, sequence, inputIndex, handleStageClear]
  );

  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'ArrowUp') handleInput('up');
      else if (e.key === 'ArrowDown') handleInput('down');
      else if (e.key === 'ArrowLeft') handleInput('left');
      else if (e.key === 'ArrowRight') handleInput('right');
      else if (e.key === 'r' || e.key === 'R') restartAll();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInput, restartAll]);

  const startGame = useCallback(() => initStage(0), [initStage]);

  const stageLabel = useMemo(
    () =>
      `스테이지 ${stageIndex + 1} / 4 (화살표 ${STAGE_LENGTHS[stageIndex]}개)`,
    [stageIndex]
  );

  return (
    <Page>
      <Card>
        <Header>
          <Title>화살표 펌프 🔼🔽◀▶</Title>
          <Subtitle>틀리면 순서 그대로, 처음부터 다시!</Subtitle>
        </Header>

        <TopBar>
          <div>{stageLabel}</div>
          <ButtonOutline onClick={restartAll}>리셋(R)</ButtonOutline>
        </TopBar>

        <PreviewBox>
          <PreviewTitle>입력 순서</PreviewTitle>
          <PreviewGrid>
            {sequence.map((d, i) => {
              const isCurrent = i === inputIndex;
              const isWrong = i === wrongIndex;
              const isDone = i < inputIndex;
              return (
                <Cell
                  key={i}
                  $isCurrent={isCurrent}
                  $isWrong={isWrong}
                  $isDone={isDone}
                >
                  {dirSymbol[d]}
                </Cell>
              );
            })}
          </PreviewGrid>
        </PreviewBox>

        <PadGrid>
          <div />
          <ArrowButton
            dir="up"
            symbol={dirSymbol.up}
            onPress={handleInput}
            disabled={gameState !== 'playing'}
          />
          <div />
          <ArrowButton
            dir="left"
            symbol={dirSymbol.left}
            onPress={handleInput}
            disabled={gameState !== 'playing'}
          />
          <div />
          <ArrowButton
            dir="right"
            symbol={dirSymbol.right}
            onPress={handleInput}
            disabled={gameState !== 'playing'}
          />
          <div />
          <ArrowButton
            dir="down"
            symbol={dirSymbol.down}
            onPress={handleInput}
            disabled={gameState !== 'playing'}
          />
          <div />
        </PadGrid>

        {gameState === 'idle' && (
          <ButtonPrimary onClick={startGame}>게임 시작</ButtonPrimary>
        )}
        {gameState === 'win' && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div style={{ color: '#bbf7d0', fontWeight: 600, marginBottom: 8 }}>
              올클리어! 당신은 반사신경 마왕 ⚡
            </div>
            <ButtonPrimary onClick={restartAll}>다시하기</ButtonPrimary>
          </div>
        )}
      </Card>
    </Page>
  );
}

function ArrowButton({ dir, symbol, onPress, disabled }) {
  return (
    <PadButton onClick={() => onPress(dir)} disabled={disabled}>
      <span style={{ fontSize: 28 }}>{symbol}</span>
    </PadButton>
  );
}

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  color: #e2e8f0;
`;

const Card = styled.div`
  width: 100%;
  max-width: 800px;
  background: #1e293b;
  border-radius: 20px;
  padding: 16px;
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 12px;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 800;
`;

const Subtitle = styled.div`
  color: #94a3b8;
  font-size: 14px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
`;

const PreviewBox = styled.div`
  background: #0f172a;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
`;

const PreviewTitle = styled.div`
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 8px;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
`;

const Cell = styled.div`
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #334155;
  font-size: 18px;
  transition: all 0.2s;
  ${({ $isDone }) =>
    $isDone &&
    css`
      background: #065f46;
    `}
  ${({ $isCurrent }) =>
    $isCurrent &&
    css`
      background: #0c4a6e;
      border: 1px solid #0ea5e9;
    `}
  ${({ $isWrong }) =>
    $isWrong &&
    css`
      background: #7f1d1d;
      border: 1px solid #ef4444;
      animation: ${shake} 0.3s ease;
    `}
`;

const PadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 220px;
  margin: 0 auto 12px;
`;

const PadButton = styled.button`
  border-radius: 12px;
  border: 1px solid #334155;
  background: #1e293b;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.1s;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonPrimary = styled.button`
  background: #0ea5e9;
  color: #0b1220;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
`;

const ButtonOutline = styled.button`
  border: 1px solid #475569;
  background: transparent;
  color: #e2e8f0;
  border-radius: 12px;
  padding: 8px 12px;
`;
