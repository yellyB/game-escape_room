import React, { useState } from 'react';
import styled from 'styled-components';

const LobbyContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 400px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  touch-action: manipulation;
  min-height: 48px;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RoomIdDisplay = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-family: monospace;
  font-size: 1.2rem;
  color: #667eea;
  font-weight: bold;
`;

function GameLobby({ onJoinGame }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('플레이어 이름을 입력해주세요!');
      return;
    }
    
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsCreatingRoom(true);
    
    // 잠시 후 게임에 참가
    setTimeout(() => {
      onJoinGame(newRoomId, playerName);
    }, 1000);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      alert('플레이어 이름과 방 ID를 모두 입력해주세요!');
      return;
    }
    
    onJoinGame(roomId, playerName);
  };

  return (
    <LobbyContainer>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
        🎯 게임에 참가하세요!
      </h2>
      
      <FormGroup>
        <Label>플레이어 이름</Label>
        <Input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="이름을 입력하세요"
          maxLength={20}
        />
      </FormGroup>

      {isCreatingRoom ? (
        <RoomIdDisplay>
          🎉 방이 생성되었습니다!<br/>
          방 ID: {roomId}
        </RoomIdDisplay>
      ) : (
        <>
          <FormGroup>
            <Label>방 ID (기존 방에 참가할 때)</Label>
            <Input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="방 ID를 입력하세요"
              maxLength={6}
            />
          </FormGroup>

          <ButtonContainer>
            <Button 
              onClick={handleCreateRoom}
              style={{ flex: 1 }}
            >
              🆕 새 방 만들기
            </Button>
            <Button 
              onClick={handleJoinRoom}
              style={{ flex: 1 }}
            >
              🚪 방 참가하기
            </Button>
          </ButtonContainer>
        </>
      )}
    </LobbyContainer>
  );
}

export default GameLobby;
