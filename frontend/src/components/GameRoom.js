import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  background: #000000;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 400px;
  margin: 0 auto;
  min-height: 500px;
  color: white;
`;

const GameHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
`;

const RoomInfo = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
`;

const BackButton = styled.button`
  padding: 0.75rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  touch-action: manipulation;
  min-height: 44px;
  font-size: 1rem;
  
  &:hover {
    background: #c82333;
  }
  
  &:active {
    background: #bd2130;
  }
`;

const GameArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GameCanvas = styled.div`
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: white;
`;

const PlayerList = styled.div`
  background: #1a1a1a;
  border: 2px solid #333;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 1rem;
  color: white;
`;

const PlayerItem = styled.div`
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: #333;
  border-radius: 5px;
  border-left: 4px solid #667eea;
  color: white;
`;

const GameMessage = styled.div`
  background: #333;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  color: #ffffff;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  margin: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  touch-action: manipulation;
  min-height: 48px;
  min-width: 48px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin: 0.25rem;
    font-size: 1.1rem;
    min-height: 56px;
    min-width: 56px;
  }
`;

const GameControls = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
`;

const ControlButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.5rem;
  touch-action: manipulation;
  min-height: 60px;
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.95);
  }
  
  &:nth-child(1) { 
    grid-column: 2; 
    grid-row: 1; 
  } /* 위 */
  &:nth-child(2) { 
    grid-column: 1; 
    grid-row: 2; 
  } /* 왼쪽 */
  &:nth-child(3) { 
    grid-column: 3; 
    grid-row: 2; 
  } /* 오른쪽 */
  &:nth-child(4) { 
    grid-column: 2; 
    grid-row: 3; 
  } /* 아래 */
  &:nth-child(5) { 
    grid-column: 1 / 4; 
    grid-row: 4; 
    border-radius: 8px;
    min-height: 50px;
  } /* 상호작용 */
`;

function GameRoom({ onBackToStart }) {
  const [ws, setWs] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameStatus, setGameStatus] = useState('connecting');
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    // WebSocket 연결
    const roomId = 'default-room';
    const playerName = 'Player';
    const websocket = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
    wsRef.current = websocket;

    websocket.onopen = () => {
      console.log('WebSocket 연결됨');
      setGameStatus('connected');
      
      // 플레이어 정보 전송
      websocket.send(JSON.stringify({
        player_name: playerName
      }));
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('받은 메시지:', message);
      
      switch (message.type) {
        case 'player_joined':
          setPlayers(message.room_info.players || []);
          setMessages(prev => [...prev, `${message.player_name}님이 참가했습니다!`]);
          break;
        case 'player_left':
          setPlayers(message.room_info.players || []);
          setMessages(prev => [...prev, `플레이어가 떠났습니다.`]);
          break;
        case 'game_update':
          setMessages(prev => [...prev, `게임 업데이트: ${message.action}`]);
          break;
        default:
          console.log('알 수 없는 메시지 타입:', message.type);
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket 연결 종료');
      setGameStatus('disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      setGameStatus('error');
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const sendGameAction = (action, data = {}) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'game_action',
        action: action,
        data: data
      }));
    }
  };

  const handleMove = (direction) => {
    sendGameAction('move', { direction });
  };

  const handleInteract = () => {
    sendGameAction('interact');
  };

  return (
    <GameContainer>
      <GameHeader>
        <RoomInfo>
          🎮 방 ID: default-room | 플레이어: Player
        </RoomInfo>
        <BackButton onClick={onBackToStart}>
          ← 방에서 나가기
        </BackButton>
      </GameHeader>

      <GameArea>
        <GameCanvas>
          <h3>🎯 게임 영역</h3>
          <div style={{ marginBottom: '1rem' }}>
            <p>상태: {gameStatus}</p>
            {gameStatus === 'connected' && (
              <GameControls>
                <ControlButton onClick={() => handleMove('up')}>↑</ControlButton>
                <ControlButton onClick={() => handleMove('left')}>←</ControlButton>
                <ControlButton onClick={() => handleMove('right')}>→</ControlButton>
                <ControlButton onClick={() => handleMove('down')}>↓</ControlButton>
                <ControlButton 
                  onClick={handleInteract}
                  style={{ background: '#28a745' }}
                >
                  🔍 상호작용
                </ControlButton>
              </GameControls>
            )}
          </div>
        </GameCanvas>

        <PlayerList>
          <h4>👥 플레이어 목록 ({players.length}명)</h4>
          {players.map((player, index) => (
            <PlayerItem key={index}>
              {player.name} {player.name === 'Player' ? '(나)' : ''}
            </PlayerItem>
          ))}
          
          {messages.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>📢 게임 메시지</h4>
              {messages.slice(-5).map((msg, index) => (
                <GameMessage key={index} style={{ fontSize: '0.9rem', margin: '0.25rem 0' }}>
                  {msg}
                </GameMessage>
              ))}
            </div>
          )}
        </PlayerList>
      </GameArea>
    </GameContainer>
  );
}

export default GameRoom;
