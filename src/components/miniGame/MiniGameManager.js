import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useFlowManager } from '../../contexts/FlowContext';
import { colors } from '../../styles/colors';
import TrapSister from './TrapSister';
import ArrowPump from './ArrowPump';

export default function MiniGameManager() {
  const { currStepData, moveNextStep } = useFlowManager();
  const [isDelaying, setIsDelaying] = useState(true);
  const [gameType, setGameType] = useState(null);

  const handleWin = () => {
    console.log('win');
    // resetMiniGame();
    setTimeout(() => {
      moveNextStep();
    }, 1000);
  };

  useEffect(() => {
    if (isDelaying) {
      setTimeout(() => {
        setIsDelaying(false);
        setGameType(currStepData.data.type);
      }, 1000);
    }
  }, [isDelaying]);

  return (
    <>
      {isDelaying ? (
        <DelayOverlay>
          <DelayText>미니게임 로딩 중...</DelayText>
        </DelayOverlay>
      ) : (
        <MiniGameOverlay>
          {gameType === 'trap-sister' && <TrapSister onWin={handleWin} />}
          {gameType === 'arrow-pump' && <ArrowPump onWin={handleWin} />}
        </MiniGameOverlay>
      )}
    </>
  );
}

const MiniGameOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const DelayOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  pointer-events: all;
`;

const DelayText = styled.div`
  color: ${colors.white};
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px 40px;
  border-radius: 10px;
  border: 1px solid ${colors.darkGray};
`;
