"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameStatus = "menu" | "howto" | "playing" | "gameover";
type ObjectKind = "coin" | "gem" | "bomb" | "star";

type FallingObject = {
  id: number;
  kind: ObjectKind;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
};

type Feedback = {
  id: number;
  text: string;
  x: number;
  y: number;
  tone: "good" | "power" | "danger";
};

type Particle = {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
};

const HIGH_SCORE_KEY = "catch-it-high-score";
const FIELD_HEIGHT = 600;
const BASKET_WIDTH = 108;
const OBJECT_SIZE = 48;
const STARTING_LIVES = 3;

const OBJECT_META: Record<
  ObjectKind,
  { label: string; icon: string; points: number; className: string }
> = {
  coin: { label: "Coin", icon: "●", points: 10, className: "object-coin" },
  gem: { label: "Gem", icon: "◆", points: 25, className: "object-gem" },
  bomb: { label: "Bomb", icon: "✦", points: 0, className: "object-bomb" },
  star: { label: "Golden Star", icon: "★", points: 0, className: "object-star" },
};

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getHighScore() {
  if (typeof window === "undefined") return 0;
  const saved = Number(window.localStorage.getItem(HIGH_SCORE_KEY));
  return Number.isFinite(saved) ? saved : 0;
}

export default function CatchItGame() {
  const [status, setStatus] = useState<GameStatus>("menu");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [missed, setMissed] = useState(0);
  const [objects, setObjects] = useState<FallingObject[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [basketX, setBasketX] = useState(50);
  const [multiplierActive, setMultiplierActive] = useState(false);
  const [shake, setShake] = useState(false);

  const fieldRef = useRef<HTMLDivElement>(null);
  const objectsRef = useRef<FallingObject[]>([]);
  const basketXRef = useRef(50);
  const nextIdRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const timeRef = useRef(60);
  const caughtRef = useRef(0);
  const missedRef = useRef(0);
  const multiplierUntilRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const lastSecondRef = useRef(0);
  const statusRef = useRef<GameStatus>("menu");

  useEffect(() => {
    // Read the persisted high score once the component has mounted in the
    // browser. Reading localStorage during the initial render would give the
    // server render (no window) and the client render (real value)
    // different output, causing a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighScore(getHighScore());
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const endGame = useCallback(() => {
    statusRef.current = "gameover";
    setStatus("gameover");
    objectsRef.current = [];
    setObjects([]);
    setMultiplierActive(false);
    const latestScore = scoreRef.current;
    const latestHighScore = Math.max(getHighScore(), latestScore);
    if (latestHighScore > getHighScore()) {
      window.localStorage.setItem(HIGH_SCORE_KEY, String(latestHighScore));
    }
    setHighScore(latestHighScore);
  }, []);

  const addFeedback = useCallback((text: string, x: number, y: number, tone: Feedback["tone"]) => {
    const id = nextIdRef.current++;
    setFeedback((current) => [...current, { id, text, x, y, tone }]);
    window.setTimeout(() => {
      setFeedback((current) => current.filter((item) => item.id !== id));
    }, 850);
  }, []);

  const burst = useCallback((x: number, y: number, kind: ObjectKind) => {
    const colors = kind === "bomb" ? ["#ff6b6b", "#ffb36b", "#ffdf8a"] : ["#ffd166", "#7fe1c5", "#8ca8ff", "#fff4b3"];
    const nextParticles = Array.from({ length: 9 }, (_, index) => ({
      id: nextIdRef.current++,
      x,
      y,
      angle: (index / 9) * Math.PI * 2,
      color: colors[index % colors.length],
    }));
    setParticles((current) => [...current, ...nextParticles]);
    window.setTimeout(() => {
      const ids = new Set(nextParticles.map((particle) => particle.id));
      setParticles((current) => current.filter((particle) => !ids.has(particle.id)));
    }, 650);
  }, []);

  const resetGame = useCallback(() => {
    objectsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;
    timeRef.current = 60;
    caughtRef.current = 0;
    missedRef.current = 0;
    basketXRef.current = 50;
    multiplierUntilRef.current = 0;
    lastFrameRef.current = 0;
    lastSpawnRef.current = 0;
    lastSecondRef.current = 0;
    setScore(0);
    setLives(STARTING_LIVES);
    setTimeLeft(60);
    setCaught(0);
    setMissed(0);
    setBasketX(50);
    setMultiplierActive(false);
    setFeedback([]);
    setParticles([]);
    setShake(false);
    statusRef.current = "playing";
    setStatus("playing");
  }, []);

  const moveBasket = useCallback((direction: number) => {
    if (statusRef.current !== "playing") return;
    const next = Math.max(8, Math.min(92, basketXRef.current + direction * 8));
    basketXRef.current = next;
    setBasketX(next);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) {
        event.preventDefault();
      }
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") moveBasket(-1);
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") moveBasket(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moveBasket]);

  useEffect(() => {
    if (status !== "playing") return;

    let animationFrame = 0;
    const tick = (time: number) => {
      if (statusRef.current !== "playing") return;
      if (!lastFrameRef.current) lastFrameRef.current = time;
      const delta = Math.min(time - lastFrameRef.current, 48);
      lastFrameRef.current = time;
      const field = fieldRef.current;
      const fieldWidth = field?.clientWidth ?? 900;
      const fieldHeight = field?.clientHeight ?? FIELD_HEIGHT;
      const difficulty = Math.min(1, scoreRef.current / 300);
      const spawnDelay = Math.max(420, 980 - difficulty * 430);
      const maxObjects = Math.min(8, 3 + Math.floor(scoreRef.current / 70));

      if (time - lastSpawnRef.current > spawnDelay && objectsRef.current.length < maxObjects) {
        const bombChance = Math.min(0.3, 0.09 + difficulty * 0.2);
        const roll = Math.random();
        const kind: ObjectKind = roll < bombChance ? "bomb" : roll < bombChance + 0.17 ? "gem" : roll < bombChance + 0.2 ? "star" : "coin";
        const baseSpeed = kind === "gem" ? 0.25 : kind === "bomb" ? 0.19 : kind === "star" ? 0.16 : 0.15;
        objectsRef.current = [
          ...objectsRef.current,
          {
            id: nextIdRef.current++,
            kind,
            x: randomBetween(6, 94),
            y: -8,
            speed: baseSpeed + difficulty * 0.12 + randomBetween(0, 0.07),
            size: kind === "star" ? 56 : OBJECT_SIZE,
            rotation: randomBetween(-12, 12),
          },
        ];
        lastSpawnRef.current = time;
      }

      if (time - lastSecondRef.current >= 1000) {
        const secondsPassed = Math.floor((time - lastSecondRef.current) / 1000);
        timeRef.current = Math.max(0, timeRef.current - secondsPassed);
        setTimeLeft(timeRef.current);
        lastSecondRef.current = time;
        if (timeRef.current <= 0) {
          endGame();
          return;
        }
      }

      const basketLeft = (basketXRef.current / 100) * fieldWidth - BASKET_WIDTH / 2;
      const basketRight = basketLeft + BASKET_WIDTH;
      const nextObjects: FallingObject[] = [];
      const caughtNow: FallingObject[] = [];
      let missedNow = 0;

      for (const object of objectsRef.current) {
        const nextY = object.y + object.speed * delta;
        const objectLeft = (object.x / 100) * fieldWidth - object.size / 2;
        const objectRight = objectLeft + object.size;
        const isCatchHeight = nextY + object.size >= fieldHeight - 90 && nextY <= fieldHeight - 22;
        const overlapsBasket = objectRight >= basketLeft && objectLeft <= basketRight;

        if (isCatchHeight && overlapsBasket) {
          caughtNow.push({ ...object, y: nextY });
        } else if (nextY > fieldHeight + 20) {
          if (object.kind !== "bomb") missedNow += 1;
        } else {
          nextObjects.push({ ...object, y: nextY, rotation: object.rotation + delta * 0.08 });
        }
      }

      if (caughtNow.length > 0) {
        const now = performance.now();
        const multiplier = multiplierUntilRef.current > now ? 2 : 1;
        let scoreGain = 0;
        let lostLife = false;
        caughtNow.forEach((object) => {
          const centerX = (object.x / 100) * fieldWidth;
          burst(centerX, object.y + object.size / 2, object.kind);
          if (object.kind === "bomb") {
            lostLife = true;
            addFeedback("Ouch!", object.x, object.y, "danger");
          } else if (object.kind === "star") {
            multiplierUntilRef.current = now + 10000;
            setMultiplierActive(true);
            addFeedback("2× Score!", object.x, object.y, "power");
          } else {
            const points = OBJECT_META[object.kind].points * multiplier;
            scoreGain += points;
            addFeedback(`+${points}`, object.x, object.y, "good");
          }
        });
        if (scoreGain > 0) {
          scoreRef.current += scoreGain;
          setScore(scoreRef.current);
          setHighScore((current) => Math.max(current, scoreRef.current));
        }
        if (lostLife) {
          livesRef.current -= 1;
          setLives(livesRef.current);
          setShake(true);
          window.setTimeout(() => setShake(false), 360);
        }
        caughtRef.current += caughtNow.length;
        setCaught(caughtRef.current);
        if (livesRef.current <= 0) {
          objectsRef.current = [];
          endGame();
          return;
        }
      }

      if (multiplierUntilRef.current <= performance.now() && multiplierUntilRef.current !== 0) {
        multiplierUntilRef.current = 0;
        setMultiplierActive(false);
      }
      if (missedNow > 0) {
        missedRef.current += missedNow;
        setMissed(missedRef.current);
      }
      objectsRef.current = nextObjects;
      setObjects(nextObjects);
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [addFeedback, burst, endGame, status]);

  const showMenu = () => {
    statusRef.current = "menu";
    setStatus("menu");
    objectsRef.current = [];
    setObjects([]);
  };

  return (
    <main className={`game-shell ${shake ? "is-shaking" : ""}`}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="game-content">
        <header className="brand-lockup">
          <span className="brand-spark" aria-hidden="true">✦</span>
          <span>Catch It!</span>
        </header>

        {status === "menu" && (
          <section className="panel menu-panel" aria-labelledby="game-title">
            <div className="menu-art" aria-hidden="true">
              <span className="art-star">★</span>
              <span className="art-gem">◆</span>
              <span className="art-coin">●</span>
              <span className="art-bomb">✦</span>
              <span className="art-basket">▰</span>
            </div>
            <p className="eyebrow">A tiny treasure hunt</p>
            <h1 id="game-title">Catch It!</h1>
            <p className="subtitle">Catch the good objects.<br />Avoid the bombs.</p>
            <div className="menu-actions">
              <button className="button button-primary" onClick={resetGame}>Start Game <span aria-hidden="true">→</span></button>
              <button className="button button-secondary" onClick={() => setStatus("howto")}>How to Play</button>
            </div>
            <p className="best-score">Best score <strong>{highScore}</strong></p>
          </section>
        )}

        {status === "howto" && (
          <section className="panel howto-panel" aria-labelledby="howto-title">
            <p className="eyebrow">Ready, set, catch!</p>
            <h1 id="howto-title">How to play</h1>
            <div className="rules-list">
              <div className="rule"><span className="rule-icon coin-icon">●</span><p><strong>Catch coins</strong><span>+10 points each</span></p></div>
              <div className="rule"><span className="rule-icon gem-icon">◆</span><p><strong>Grab gems</strong><span>+25 points and they’re speedy</span></p></div>
              <div className="rule"><span className="rule-icon bomb-icon">✦</span><p><strong>Skip bombs</strong><span>They cost one precious life</span></p></div>
              <div className="rule"><span className="rule-icon star-icon">★</span><p><strong>Find golden stars</strong><span>Double your points for 10 seconds</span></p></div>
            </div>
            <p className="controls-tip"><kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd> on desktop<br /><span>On mobile, tap the arrows below the game.</span></p>
            <button className="button button-primary" onClick={() => setStatus("menu")}>Got it <span aria-hidden="true">→</span></button>
          </section>
        )}

        {status === "playing" && (
          <section className="play-section" aria-label="Catch It game">
            <div className="hud" aria-live="polite">
              <div className="hud-stat"><span>Score</span><strong>{score}</strong></div>
              <div className="hud-stat lives-stat"><span>Lives</span><strong aria-label={`${lives} lives`}>{"❤️".repeat(lives)}<span className="lost-lives">{"♡".repeat(STARTING_LIVES - lives)}</span></strong></div>
              <div className="hud-stat time-stat"><span>Time</span><strong>{timeLeft}</strong></div>
              <div className="hud-stat high-stat"><span>High score</span><strong>{Math.max(highScore, score)}</strong></div>
            </div>
            <div className="playfield" ref={fieldRef}>
              <div className="cloud cloud-one" aria-hidden="true" />
              <div className="cloud cloud-two" aria-hidden="true" />
              <div className="field-hint">Catch &amp; collect!</div>
              {multiplierActive && <div className="multiplier-pill"><span>★</span> 2× score active</div>}
              {objects.map((object) => {
                const meta = OBJECT_META[object.kind];
                return <span key={object.id} className={`falling-object ${meta.className}`} style={{ left: `${object.x}%`, top: object.y, width: object.size, height: object.size, transform: `translateX(-50%) rotate(${object.rotation}deg)` }} aria-label={meta.label}>{meta.icon}</span>;
              })}
              {particles.map((particle) => <span key={particle.id} className="particle" style={{ left: particle.x, top: particle.y, background: particle.color, transform: `translate(-50%, -50%) rotate(${particle.angle}rad)` }} aria-hidden="true" />)}
              {feedback.map((item) => <span key={item.id} className={`feedback feedback-${item.tone}`} style={{ left: `${item.x}%`, top: item.y }}>{item.text}</span>)}
              <div className="basket" style={{ left: `${basketX}%` }} aria-hidden="true"><span className="basket-handle" /><span className="basket-bowl" /></div>
            </div>
            <div className="mobile-controls" aria-label="Mobile movement controls">
              <button className="control-button" onPointerDown={() => moveBasket(-1)} aria-label="Move basket left">←</button>
              <span>Move your basket</span>
              <button className="control-button" onPointerDown={() => moveBasket(1)} aria-label="Move basket right">→</button>
            </div>
            <p className="game-tip">Use <strong>← →</strong> or <strong>A D</strong> to move</p>
          </section>
        )}

        {status === "gameover" && (
          <section className="panel gameover-panel" aria-labelledby="gameover-title">
            <div className="gameover-badge" aria-hidden="true">✦</div>
            <p className="eyebrow">Nice try, treasure hunter</p>
            <h1 id="gameover-title">Game Over</h1>
            <div className="final-score"><span>Final score</span><strong>{score}</strong></div>
            <div className="results-grid"><div><span>High score</span><strong>{highScore}</strong></div><div><span>Objects caught</span><strong>{caught}</strong></div><div><span>Objects missed</span><strong>{missed}</strong></div></div>
            <div className="menu-actions"><button className="button button-primary" onClick={resetGame}>Play Again <span aria-hidden="true">↗</span></button><button className="button button-secondary" onClick={showMenu}>Main Menu</button></div>
          </section>
        )}
        <footer>Small moves. Big catches. <span aria-hidden="true">✦</span></footer>
      </div>
    </main>
  );
}
