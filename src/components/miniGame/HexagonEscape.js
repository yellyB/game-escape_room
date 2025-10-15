import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import colors from '../../styles/colors';

const SEED_BARRICADE_COUNT = 13;

// ===== Game States =====
const GAME = {
  PLAYING: 'playing',
  LOSE: 'lose', // 도망자 탈출 → 패배
  WIN: 'win', // 포획 → 승리
};

// ===== Hex helpers =====
const DIRS = [
  { q: +1, r: 0 },
  { q: +1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: +1 },
  { q: 0, r: +1 },
];

function add(a, b) {
  return { q: a.q + b.q, r: a.r + b.r };
}
function key(c) {
  return `${c.q},${c.r}`;
}
function axialDistance(a, b) {
  const dq = Math.abs(a.q - b.q);
  const dr = Math.abs(a.r - b.r);
  const ds = Math.abs(-a.q - a.r - (-b.q - b.r));
  return Math.max(dq, dr, ds);
}
function neighbors(c) {
  return DIRS.map(d => add(c, d));
}
function generateBoard(radius) {
  const cells = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) cells.push({ q, r });
  }
  return cells;
}
function isInside(c, radius) {
  return axialDistance(c, { q: 0, r: 0 }) <= radius;
}
function isEdge(c, radius) {
  return axialDistance(c, { q: 0, r: 0 }) === radius;
}
function axialToPixel({ q, r }, size) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * ((3 / 2) * r);
  return { x, y };
}
function hexPolygonPoints(cx, cy, size) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = cx + size * Math.cos(angle);
    const y = cy + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

function shortestPathToEdge(start, radius, blockedSet) {
  const startKey = key(start);
  if (isEdge(start, radius)) return 0;
  const visited = new Set([startKey]);
  const q = [{ ...start, d: 0 }];
  while (q.length) {
    const cur = q.shift();
    for (const nb of neighbors(cur)) {
      const nbKey = key(nb);
      if (visited.has(nbKey) || !isInside(nb, radius) || blockedSet.has(nbKey))
        continue;
      const d = cur.d + 1;
      if (isEdge(nb, radius)) return d;
      visited.add(nbKey);
      q.push({ ...nb, d });
    }
  }
  return Infinity;
}

function pickAIMove(from, radius, blockedSet) {
  const options = neighbors(from)
    .filter(nb => isInside(nb, radius) && !blockedSet.has(key(nb)))
    .map(nb => ({
      pos: nb,
      score: shortestPathToEdge(nb, radius, blockedSet),
    }));

  if (options.length === 0) return null;
  let min = Infinity;
  for (const o of options) min = Math.min(min, o.score);
  const best = options.filter(o => o.score === min);
  if (min === Infinity) {
    const withHeuristic = best
      .map(o => ({ ...o, h: axialDistance(o.pos, { q: 0, r: 0 }) }))
      .sort((a, b) => b.h - a.h);
    return withHeuristic[0].pos;
  }
  return best[Math.floor(Math.random() * best.length)].pos;
}

function randomInitialBarricades(cells, count, excludeKey) {
  const pool = cells.map(c => key(c)).filter(k => k !== excludeKey);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return new Set(pool.slice(0, Math.min(count, pool.length)));
}

export default function HexagonEscape({ onWin }) {
  const radius = 7; // fixed densest map
  const size = 28; // fixed zoom

  const cells = useMemo(() => generateBoard(radius), [radius]);
  const center = useMemo(() => ({ q: 0, r: 0 }), []);
  const centerKey = key(center);

  // ===== State =====
  const [gameState, setGameState] = useState(GAME.PLAYING);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [seedBarricades, setSeedBarricades] = useState(() => new Set()); // pre-placed (different color)
  const [barricades, setBarricades] = useState(() => new Set()); // player placed
  const [runner, setRunner] = useState(center);
  const [lockInput, setLockInput] = useState(false);
  const [moves, setMoves] = useState(0);
  const svgRef = useRef(null);

  const blockedSet = useMemo(
    () => new Set([...seedBarricades, ...barricades]),
    [seedBarricades, barricades]
  );

  // ===== Init seeds on first mount =====
  useEffect(() => {
    const seeds = randomInitialBarricades(
      cells,
      SEED_BARRICADE_COUNT,
      centerKey
    );
    setSeedBarricades(seeds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setBarricades(new Set());
    setRunner(center);
    setMoves(0);
    setLockInput(false);
    setPlayerTurn(true);
    setGameState(GAME.PLAYING);
    const seeds = randomInitialBarricades(
      cells,
      SEED_BARRICADE_COUNT,
      centerKey
    );
    setSeedBarricades(seeds);
  };

  // ===== Win/Lose detection =====
  useEffect(() => {
    if (gameState !== GAME.PLAYING) return;

    if (isEdge(runner, radius)) {
      setGameState(GAME.LOSE);
      setPlayerTurn(false);
      setLockInput(true);
      onWin(); // todo: 테스트를 위해 실패여도 성공처리
      return;
    }

    const anyMove = neighbors(runner).some(
      nb => isInside(nb, radius) && !blockedSet.has(key(nb))
    );
    if (!anyMove) {
      setGameState(GAME.WIN);
      setPlayerTurn(false);
      setLockInput(true);
      if (typeof onWin === 'function') onWin({ moves, runner });
    }
  }, [runner, radius, blockedSet, moves, onWin, gameState]);

  const onCellClick = cell => {
    if (gameState !== GAME.PLAYING) return; // game over guard
    if (lockInput) return; // ignore during AI turn
    if (!playerTurn) return;

    const k = key(cell);
    if (k === key(runner) || blockedSet.has(k)) return; // cannot place on runner or existing block

    setBarricades(prev => new Set(prev).add(k));
    setPlayerTurn(false);

    // AI move with slight delay for UX
    setLockInput(true);
    setTimeout(() => {
      setMoves(m => m + 1);
      const next = pickAIMove(runner, radius, new Set([...blockedSet, k]));
      if (!next) {
        // No legal move left → win
        setGameState(GAME.WIN);
        setLockInput(true);
        setPlayerTurn(false);
        if (typeof onWin === 'function') onWin({ moves: moves + 1, runner });
      } else {
        setRunner(next);
        setPlayerTurn(true);
        setLockInput(false);
      }
    }, 300);
  };

  // ===== Layout calculations =====
  const positions = useMemo(() => {
    const pts = cells.map(c => axialToPixel(c, size));
    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);
    const minX = Math.min(...xs) - size * 1.2;
    const maxX = Math.max(...xs) + size * 1.2;
    const minY = Math.min(...ys) - size * 1.2;
    const maxY = Math.max(...ys) + size * 1.2;
    return { minX, minY, width: maxX - minX, height: maxY - minY };
  }, [cells, size]);

  const runnerPixel = axialToPixel(runner, size);

  // ===== Derived UI texts by state =====
  const statusText = useMemo(() => {
    if (gameState === GAME.LOSE) return '⚠️ 놓쳐버렸다! 재도전?';
    if (gameState === GAME.WIN) return '🎉 잡았다! 당신의 승리!';
    // playing
    if (lockInput || !playerTurn) return '상대의 턴: 여동생 도망 중…';
    return '당신의 차례: 막을 칸을 선택하세요';
  }, [gameState, playerTurn, lockInput]);

  return (
    <Page>
      <Header>
        <Title>여동생 가두기</Title>
        <Controls>
          <Button onClick={reset}>재시도</Button>
        </Controls>
      </Header>

      <Card>
        <Info>
          <p>
            시작 시 무작위로 {SEED_BARRICADE_COUNT}개의 바리케이드가
            배치됩니다(연한 청회색). 당신은 빈 칸을 클릭해 진한 회색
            바리케이드를 추가하세요. 검정이는 가장 탈출 가능성이 높은 방향으로
            한 칸 이동합니다. 검정이가 테두리에 닿으면 <b>lose</b>, 더 이상
            움직일 곳이 없으면 <b>win</b>입니다.
          </p>
        </Info>
        <Bar>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>이동 수: {moves}</span>
            <span>
              턴: {playerTurn ? '당신' : '여동생'}
              {lockInput ? ' (대기)' : ''}
            </span>
          </div>
        </Bar>
        <BoardWrap>
          <Svg
            ref={svgRef}
            $lose={gameState === GAME.LOSE}
            $win={gameState === GAME.WIN}
            viewBox={`${positions.minX} ${positions.minY} ${positions.width} ${positions.height}`}
          >
            {cells.map(c => {
              const { x, y } = axialToPixel(c, size);
              const k = key(c);
              const isSeed = seedBarricades.has(k);
              const isPlayer = barricades.has(k);
              const centerCell = k === centerKey;
              const edge = isEdge(c, radius);
              const fill = isSeed
                ? '#94a3b8' // seed barricade: slate-400
                : isPlayer
                  ? '#6b7280' // player barricade: slate-500
                  : centerCell
                    ? '#e5e7eb'
                    : edge
                      ? '#f3f4f6'
                      : '#ffffff';
              const stroke = edge ? '#d1d5db' : '#e5e7eb';
              return (
                <polygon
                  key={k}
                  points={hexPolygonPoints(x, y, size)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                  onClick={() => onCellClick(c)}
                  style={{
                    cursor:
                      gameState === GAME.PLAYING &&
                      playerTurn &&
                      !isSeed &&
                      !isPlayer &&
                      k !== key(runner) &&
                      !lockInput
                        ? 'pointer'
                        : 'default',
                    transition: 'fill 120ms',
                  }}
                />
              );
            })}

            {/* Runner (black square) */}
            <g transform={`translate(${runnerPixel.x}, ${runnerPixel.y})`}>
              <rect
                x={-size * 0.4}
                y={-size * 0.4}
                width={size * 0.8}
                height={size * 0.8}
                fill="#111827"
                rx={2}
              />
            </g>
          </Svg>
        </BoardWrap>
        <LabelStrong>상태:</LabelStrong> {statusText}
      </Card>
    </Page>
  );
}

const shake = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  100% { transform: translateX(0); }
`;

const Page = styled.div`
  height: 96vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${colors.paleGray};
`;

const Header = styled.header`
  width: 100%;
  max-width: 960px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  background: ${colors.darkGray};
  color: ${colors.white};
  border: none;
  cursor: pointer;
  transition: opacity 0.15s ease;
  &:hover {
    opacity: 0.9;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 960px;
  background: ${colors.white};
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  padding: 12px;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: ${colors.lightGray};
`;

const LabelStrong = styled.span`
  font-weight: 600;
`;

const BoardWrap = styled.div`
  margin-top: 12px;
  width: 100%;
  overflow: auto;
`;

const Svg = styled.svg`
  width: 100%;
  height: 70vh;
  background: ${({ $lose, $win }) =>
    $lose ? '#ffe2e2' : $win ? '#e9ffea' : '#fafafa'};
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: background 240ms ease;
  ${({ $lose }) =>
    $lose &&
    css`
      animation: ${shake} 0.35s linear 2;
      box-shadow: 0 0 0 4px #ffe2e2 inset;
    `}
`;

const Info = styled.div`
  margin-top: 12px;
  color: ${colors.lightGray};
  font-size: 12px;
  line-height: 1.6;
`;
