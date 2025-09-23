# 🎮 Escape Game

파이썬(FastAPI) 서버와 리액트 프론트엔드로 구성된 멀티플레이어 게임 프로젝트입니다.

## 🚀 프로젝트 구조

```
game-escape_game/
├── backend/          # 파이썬 FastAPI 서버
│   ├── main.py      # 메인 서버 파일
│   ├── run.py       # 서버 실행 스크립트
│   ├── requirements.txt
│   └── venv/        # 가상환경
├── frontend/         # 리액트 프론트엔드
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameLobby.js
│   │   │   └── GameRoom.js
│   │   └── App.js
│   └── package.json
└── README.md
```

## 🛠️ 설치 및 실행

### 백엔드 서버 실행

```bash
cd backend
source venv/bin/activate  # 가상환경 활성화
python run.py
```

서버는 `http://localhost:8000`에서 실행됩니다.
- API 문서: `http://localhost:8000/docs`
- WebSocket: `ws://localhost:8000/ws/{room_id}`

### 프론트엔드 실행

```bash
cd frontend
npm start
```

프론트엔드는 `http://localhost:3333`에서 실행됩니다.

## 🎯 게임 기능

- **멀티플레이어 지원**: 여러 플레이어가 같은 방에서 게임
- **실시간 통신**: WebSocket을 통한 실시간 게임 상태 동기화
- **방 시스템**: 플레이어가 방을 만들거나 참가할 수 있음
- **게임 액션**: 이동, 상호작용 등의 게임 액션 지원

## 🛠️ 기술 스택

### 백엔드
- **FastAPI**: 고성능 웹 프레임워크
- **WebSocket**: 실시간 양방향 통신
- **Python 3.9+**: 프로그래밍 언어

### 프론트엔드
- **React**: 사용자 인터페이스 라이브러리
- **Styled Components**: CSS-in-JS 스타일링
- **WebSocket API**: 실시간 통신

## 📝 개발 가이드

### 새로운 게임 기능 추가

1. **백엔드**: `backend/main.py`에서 게임 로직 추가
2. **프론트엔드**: `frontend/src/components/GameRoom.js`에서 UI 업데이트

### WebSocket 메시지 형식

```javascript
// 클라이언트 → 서버
{
  "type": "game_action",
  "action": "move",
  "data": { "direction": "up" }
}

// 서버 → 클라이언트
{
  "type": "game_update",
  "action": "move",
  "player_id": "uuid",
  "data": { "direction": "up" }
}
```

## 🚀 배포

### 프로덕션 빌드

```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 백엔드 서버 실행 (프로덕션)
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📄 라이선스

MIT License
