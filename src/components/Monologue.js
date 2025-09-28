import { useEffect, useState } from 'react';
import styled from 'styled-components';
import playerImage from '../images/player.png';
import { colors } from '../styles/colors';

export default function Monologue({ texts, onEnd }) {
  const [isDelaying, setIsDelaying] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const resetMonologue = () => {
    setIsDelaying(true);
    setCurrentTextIndex(0);
  };

  const handleMonologueClick = () => {
    if (currentTextIndex === texts.length - 1) {
      resetMonologue();
      onEnd();
      return;
    }

    setCurrentTextIndex(currentTextIndex + 1);
  };

  useEffect(() => {
    if (isDelaying) {
      setTimeout(() => {
        setIsDelaying(false);
      }, 1000);
    }
  }, [isDelaying]);

  return (
    <>
      {isDelaying ? (
        <DelayOverlay>
          <DelayText>...</DelayText>
        </DelayOverlay>
      ) : (
        <MonologueOverlay>
          <MonologueBox onClick={handleMonologueClick}>
            <MonologueContent>
              <PlayerImage src={playerImage} alt="Player" />
              <MonologueText>
                {texts?.map((text, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '10px',
                      opacity: index <= currentTextIndex ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  >
                    {text}
                  </div>
                ))}
              </MonologueText>
            </MonologueContent>
          </MonologueBox>
        </MonologueOverlay>
      )}
    </>
  );
}

const MonologueOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 100px;
  z-index: 2000;
`;

const MonologueBox = styled.div`
  background: ${colors.darkGray};
  border: 2px solid ${colors.lightGraySecondary};
  border-radius: 15px;
  padding: 30px;
  width: 80%;
  max-width: 600px;
  min-height: 200px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MonologueContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const PlayerImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const MonologueText = styled.div`
  color: white;
  font-size: 18px;
  line-height: 1.6;
  font-weight: 500;
  flex: 1;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
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
