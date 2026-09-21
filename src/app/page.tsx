'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

type GameState = 'menu' | 'playing' | 'gameOver';
type ObjectType = 'coin' | 'gem' | 'bomb' | 'star';
type FallingObject = {
  id: number;
  type: ObjectType;
  x: number;
  y: number;
  speed: number;
};
type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
};
type ScorePop = {
  id: number;
  x: number;
  y: number;
  text: string;
  kind: 'good' | 'danger' | 'star';
};

const ROUND_LENGTH = 60;
const BASKET_WIDTH = 18;
const HIGH_SCORE_KEY = 'catch-it-high-score';
const OBJECT_LABELS: Record<ObjectType, string> = {
  coin: 'Coin',
  gem: 'Gem',
  bomb: 'Bomb',
  star: 'Golden Star',
};
const OBJECT_COLORS: Record<ObjectType, string> = {
  coin: 'var(--coin)',
  gem: 'var(--gem)',
  bomb: 'var(--danger)',
  star: 'var(--star)',
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function createObject(id: number, elapsed: number, score: number): FallingObject {
  const ramp = Math.min(1, elapsed / ROUND_LENGTH);
  const bombChance = 0.1 + ramp * 0.14 + Math.min(score / 2000, 0.08);
  const roll = Math.random();
  let type: ObjectType = 'coin';

  if (roll < bombChance) {
    type = 'bomb';
  } else if (roll < bombChance + 0.18) {
    type = 'gem';
  } else if (roll > 0.965 && elapsed > 5) {
    type = 'star';
  }

  const baseSpeed = 10 + ramp * 5 + Math.min(score / 250, 3);
  const speedMultiplier = type === 'gem' ? 1.16 : type === 'star' ? 0.88 : 1;

  return {
    id,
    type,
    x: randomBetween(6, 94),
    y: -8,
    speed: baseSpeed * speedMultiplier,
  };
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className={accent ? `stat-value ${accent}` : 'stat-value'}>{value}</strong>
    </div>
  );
}

function GameObject({ object }: { object: FallingObject }) {
  return (
    <div
      aria-label={OBJECT_LABELS[object.type]}
      className={`falling-object object-${object.type}`}
      role="img"
      style={
        {
          left: `${object.x}%`,
          top: `${object.y}%`,
          '--object-color': OBJECT_COLORS[object.type],
        } as CSSProperties
      }
    >
      {object.type === 'coin' && <span className="coin-mark">$</span>}
      {object.type === 'gem' && <span className="gem-mark">◆</span>}
      {object.type === 'bomb' && <span className="bomb-mark">✦</span>}
      {object.type === 'star' && <span className="star-mark">★</span>}
    </div>
  );
}

function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="info-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-kicker">QUICK BRIEF</div>
        <h2 id="how-to-play-title">How to play</h2>
        <p className="card-intro">
          Guide your basket, grab the good stuff, and keep your eyes open for trouble.
        </p>
        <div className="rule-list">
          <div className="rule-row">
            <span className="rule-icon coin-icon">$</span>
            <span>
              <strong>Coins</strong>
              <small>+10 points</small>
            </span>
          </div>
          <div className="rule-row">
            <span className="rule-icon gem-icon">◆</span>
            <span>
              <strong>Gems</strong>
              <small>+25 points, but they fall faster</small>
            </span>
          </div>
          <div className="rule-row">
            <span className="rule-icon bomb-icon">✦</span>
            <span>
              <strong>Bombs</strong>
              <small>Lose a life — avoid them</small>
            </span>
          </div>
          <div className="rule-row">
            <span className="rule-icon star-icon">★</span>
            <span>
              <strong>Golden Stars</strong>
              <small>Double points for 10 seconds</small>
            </span>
          </div>
        </div>
        <div className="control-tip">
          <span>←</span>
          <span>Move with Arrow keys or A / D</span>
          <span>→</span>
        </div>
        <button className="primary-button full-button" onClick={onClose}>
          Got it
        </button>
      </section>
    </div>
  );
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [showInstructions, setShowInstructions] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH);
  const [highScore, setHighScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scorePops, setScorePops] = useState<ScorePop[]>([]);
  const [multiplierSeconds, setMultiplierSeconds] = useState(0);
  const [shake, setShake] = useState(false);
  const [basketX, setBasketX] = useState(41);

  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const timeRef = useRef(ROUND_LENGTH);
  const objectsRef = useRef<FallingObject[]>([]);
  const basketXRef = useRef(41);
  const multiplierEndsAtRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const nextIdRef = useRef(1);
  const directionRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(HIGH_SCORE_KEY) ?? 0);
    window.requestAnimationFrame(() => setHighScore(Number.isFinite(stored) ? stored : 0));
  }, []);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  const finishGame = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    gameStateRef.current = 'gameOver';
    setGameState('gameOver');
    objectsRef.current = [];
    setObjects([]);
    const finalScore = scoreRef.current;
    setHighScore((current) => {
      const nextHighScore = Math.max(current, finalScore);
      window.localStorage.setItem(HIGH_SCORE_KEY, String(nextHighScore));
      return nextHighScore;
    });
  }, []);

  const registerCatch = useCallback(
    (object: FallingObject) => {
      if (gameStateRef.current !== 'playing') return;
      const now = performance.now();
      const isMultiplierActive = multiplierEndsAtRef.current > now;
      const colors = {
        coin: 'var(--coin)',
        gem: 'var(--gem)',
        star: 'var(--star)',
        bomb: 'var(--danger)',
      };
      const particleBurst = Array.from({ length: object.type === 'bomb' ? 5 : 8 }, (_, index) => ({
        id: nextIdRef.current++ + index,
        x: object.x,
        y: object.y,
        color: colors[object.type],
      }));

      setParticles((current) => [...current, ...particleBurst]);
      window.setTimeout(() => {
        setParticles((current) =>
          current.filter((particle) => !particleBurst.some((burst) => burst.id === particle.id))
        );
      }, 600);

      if (object.type === 'bomb') {
        const nextLives = Math.max(0, livesRef.current - 1);
        livesRef.current = nextLives;
        setLives(nextLives);
        setShake(true);
        window.setTimeout(() => setShake(false), 420);
        setScorePops((current) => [
          ...current,
          { id: nextIdRef.current++, x: object.x, y: object.y, text: '−1 life', kind: 'danger' },
        ]);
        if (nextLives === 0) finishGame();
        return;
      }

      if (object.type === 'star') {
        const endsAt = now + 10000;
        multiplierEndsAtRef.current = endsAt;
        setMultiplierSeconds(10);
        setScorePops((current) => [
          ...current,
          { id: nextIdRef.current++, x: object.x, y: object.y, text: '2× points!', kind: 'star' },
        ]);
        return;
      }

      const basePoints = object.type === 'gem' ? 25 : 10;
      const points = isMultiplierActive ? basePoints * 2 : basePoints;
      const nextScore = scoreRef.current + points;
      scoreRef.current = nextScore;
      setScore(nextScore);
      setCaught((current) => current + 1);
      setScorePops((current) => [
        ...current,
        { id: nextIdRef.current++, x: object.x, y: object.y, text: `+${points}`, kind: 'good' },
      ]);
    },
    [finishGame]
  );

  const resetGame = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    gameStateRef.current = 'playing';
    scoreRef.current = 0;
    livesRef.current = 3;
    timeRef.current = ROUND_LENGTH;
    objectsRef.current = [];
    basketXRef.current = 41;
    elapsedRef.current = 0;
    lastFrameRef.current = 0;
    lastSpawnRef.current = 0;
    nextIdRef.current = 1;
    multiplierEndsAtRef.current = 0;
    setGameState('playing');
    setScore(0);
    setLives(3);
    setTimeLeft(ROUND_LENGTH);
    setCaught(0);
    setMissed(0);
    setObjects([]);
    setParticles([]);
    setScorePops([]);
    setMultiplierSeconds(0);
    setBasketX(41);
    setShake(false);
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const frame = (timestamp: number) => {
      if (gameStateRef.current !== 'playing') return;
      const delta = lastFrameRef.current
        ? Math.min((timestamp - lastFrameRef.current) / 1000, 0.05)
        : 0;
      lastFrameRef.current = timestamp;
      elapsedRef.current += delta;

      const movement = directionRef.current * delta * 44;
      if (movement !== 0) {
        const nextBasketX = Math.max(
          0,
          Math.min(100 - BASKET_WIDTH, basketXRef.current + movement)
        );
        basketXRef.current = nextBasketX;
        setBasketX(nextBasketX);
      }

      const maxObjects = Math.min(5, 2 + Math.floor(elapsedRef.current / 18));
      const spawnEvery = Math.max(650, 1450 - elapsedRef.current * 8 - scoreRef.current * 1.6);
      if (timestamp - lastSpawnRef.current > spawnEvery && objectsRef.current.length < maxObjects) {
        const nextObject = createObject(nextIdRef.current++, elapsedRef.current, scoreRef.current);
        objectsRef.current = [...objectsRef.current, nextObject];
        lastSpawnRef.current = timestamp;
      }

      const nextObjects: FallingObject[] = [];
      let missesThisFrame = 0;
      for (const object of objectsRef.current) {
        const nextY = object.y + object.speed * delta;
        const basketOverlap =
          object.x + 5 >= basketXRef.current && object.x <= basketXRef.current + BASKET_WIDTH;
        const caughtByBasket = nextY > 82 && nextY < 96 && basketOverlap;
        if (caughtByBasket) {
          registerCatch({ ...object, y: nextY });
        } else if (nextY > 106) {
          missesThisFrame += 1;
        } else {
          nextObjects.push({ ...object, y: nextY });
        }
      }

      if (missesThisFrame > 0) setMissed((current) => current + missesThisFrame);
      objectsRef.current = nextObjects;
      setObjects(nextObjects);

      const nextTime = Math.max(0, ROUND_LENGTH - elapsedRef.current);
      timeRef.current = nextTime;
      setTimeLeft(Math.ceil(nextTime));
      setMultiplierSeconds(
        multiplierEndsAtRef.current > timestamp
          ? Math.ceil((multiplierEndsAtRef.current - timestamp) / 1000)
          : 0
      );
      if (nextTime <= 0) {
        finishGame();
        return;
      }

      animationRef.current = requestAnimationFrame(frame);
    };

    animationRef.current = requestAnimationFrame(frame);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [finishGame, gameState, registerCatch]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
        event.preventDefault();
        directionRef.current = -1;
      }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
        event.preventDefault();
        directionRef.current = 1;
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (['arrowleft', 'arrowright', 'a', 'd'].includes(event.key.toLowerCase()))
        directionRef.current = 0;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      directionRef.current = 0;
    };
  }, [gameState]);

  const hearts = '❤️'.repeat(lives) + '🖤'.repeat(Math.max(0, 3 - lives));

  const menu = gameState === 'menu';
  return (
    <main className={`game-shell ${shake ? 'screen-shake' : ''}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="sparkle-field" aria-hidden="true">
        <span>✦</span>
        <span>·</span>
        <span>✦</span>
        <span>·</span>
        <span>✦</span>
      </div>

      <header className="brand-bar">
        <div className="brand-lockup">
          <span className="brand-mark">✦</span>
          <span>Catch It!</span>
        </div>
        <div className="best-score">
          <span>BEST</span>
          <strong>{highScore.toString().padStart(3, '0')}</strong>
        </div>
      </header>

      {menu ? (
        <section className="menu-screen" aria-labelledby="game-title">
          <div className="hero-copy">
            <div className="eyebrow">A tiny arcade challenge</div>
            <h1 id="game-title">
              Catch
              <br />
              <em>It!</em>
            </h1>
            <p>
              Catch the good stuff.
              <br />
              Keep the bombs away.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-star">★</div>
            <div className="hero-coin">$</div>
            <div className="hero-gem">◆</div>
            <div className="hero-basket">
              <span />
            </div>
          </div>
          <div className="menu-actions">
            <button className="primary-button" onClick={resetGame}>
              <span>Start Game</span>
              <span className="button-arrow">→</span>
            </button>
            <button className="secondary-button" onClick={() => setShowInstructions(true)}>
              How to Play <span>?</span>
            </button>
          </div>
          <p className="menu-hint">60 seconds · 3 lives · high score saved automatically</p>
        </section>
      ) : (
        <section className="game-screen" aria-label="Game area">
          <div className="hud">
            <StatCard
              label="Score"
              value={score.toString().padStart(3, '0')}
              accent="score-accent"
            />
            <StatCard label="Lives" value={hearts} accent="lives-accent" />
            <StatCard
              label="Time"
              value={`${timeLeft}s`}
              accent={timeLeft <= 10 ? 'time-warning' : 'time-accent'}
            />
            <StatCard label="High score" value={highScore.toString().padStart(3, '0')} />
          </div>

          <div className="playfield-wrap">
            <div className="playfield" aria-label="Falling objects playfield">
              <div className="cloud cloud-one" />
              <div className="cloud cloud-two" />
              <div className="horizon-line" />
              <div className="lane-line lane-one" />
              <div className="lane-line lane-two" />
              {objects.map((object) => (
                <GameObject key={object.id} object={object} />
              ))}
              {particles.map((particle) => (
                <span
                  key={particle.id}
                  className="particle"
                  style={
                    {
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      '--particle-color': particle.color,
                    } as CSSProperties
                  }
                />
              ))}
              {scorePops.map((pop) => (
                <span
                  key={pop.id}
                  className={`score-pop ${pop.kind}`}
                  style={{ left: `${pop.x}%`, top: `${pop.y}%` }}
                >
                  {pop.text}
                </span>
              ))}
              <div className="basket" style={{ left: `${basketX}%` }} aria-label="Player basket">
                <span />
              </div>
              {multiplierSeconds > 0 && (
                <div className="multiplier-pill">
                  <span>★</span> 2× points · {multiplierSeconds}s
                </div>
              )}
            </div>
          </div>
          <div className="mobile-controls" aria-label="Touch controls">
            <button
              aria-label="Move basket left"
              onPointerDown={() => {
                directionRef.current = -1;
              }}
              onPointerUp={() => {
                directionRef.current = 0;
              }}
              onPointerLeave={() => {
                directionRef.current = 0;
              }}
            >
              ←
            </button>
            <span>MOVE</span>
            <button
              aria-label="Move basket right"
              onPointerDown={() => {
                directionRef.current = 1;
              }}
              onPointerUp={() => {
                directionRef.current = 0;
              }}
              onPointerLeave={() => {
                directionRef.current = 0;
              }}
            >
              →
            </button>
          </div>
        </section>
      )}

      {gameState === 'gameOver' && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="game-over-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-over-title"
          >
            <div className="card-kicker">ROUND COMPLETE</div>
            <h2 id="game-over-title">Game Over</h2>
            <p className="card-intro">Nice run. Ready to chase a new high score?</p>
            <div className="final-score">
              <span>FINAL SCORE</span>
              <strong>{score}</strong>
            </div>
            <div className="summary-grid">
              <div>
                <span>High score</span>
                <strong>{highScore}</strong>
              </div>
              <div>
                <span>Objects caught</span>
                <strong>{caught}</strong>
              </div>
              <div>
                <span>Objects missed</span>
                <strong>{missed}</strong>
              </div>
            </div>
            <div className="game-over-actions">
              <button className="primary-button full-button" onClick={resetGame}>
                Play Again <span>↗</span>
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  gameStateRef.current = 'menu';
                  setGameState('menu');
                }}
              >
                Main Menu
              </button>
            </div>
          </section>
        </div>
      )}

      {showInstructions && <HowToPlay onClose={() => setShowInstructions(false)} />}
      <footer className="footer-note">CATCH THE GOOD · DODGE THE BAD · HAVE FUN</footer>
    </main>
  );
}
