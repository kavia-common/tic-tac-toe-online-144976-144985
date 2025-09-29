import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional themed Tic Tac Toe
 * - Centered 3x3 grid
 * - Game status at the top
 * - Controls below (restart and mode switch)
 * - PvP and PvC (easy AI) modes
 * - Responsive and accessible with smooth transitions
 */

// Helpers
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// PUBLIC_INTERFACE
export function calculateWinner(squares) {
  /** Determine the winner of a Tic Tac Toe board, or return null if none. */
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

// PUBLIC_INTERFACE
export function getAIMoveEasy(squares) {
  /** Select a random available cell index for the AI's move (easy AI). */
  const available = squares.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (available.length === 0) return null;
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

function Square({ value, onClick, highlight, disabled, index }) {
  return (
    <button
      className={`ttt-square ${highlight ? 'ttt-square--highlight' : ''}`}
      onClick={onClick}
      aria-label={`Cell ${index + 1} ${value ? 'occupied by ' + value : 'empty'}`}
      disabled={disabled}
    >
      <span className={`ttt-mark ${value ? 'ttt-mark--visible' : ''}`}>
        {value}
      </span>
    </button>
  );
}

function Board({ squares, onPlay, nextPlayer, winningLine, isLocked }) {
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe board">
      {squares.map((val, i) => (
        <Square
          key={i}
          value={val}
          index={i}
          disabled={isLocked || !!val}
          highlight={winningLine?.includes(i)}
          onClick={() => onPlay(i, nextPlayer)}
        />
      ))}
    </div>
  );
}

const modes = {
  PVP: 'PVP',
  PVC: 'PVC',
};

// PUBLIC_INTERFACE
function App() {
  /** Main application entry: renders a themed Tic Tac Toe game with PvP and PvC modes. */
  const [mode, setMode] = useState(modes.PVP);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [theme, setTheme] = useState('light');

  const winnerInfo = useMemo(() => calculateWinner(squares), [squares]);
  const winner = winnerInfo?.player || null;
  const isDraw = !winner && squares.every((s) => s !== null);

  const currentPlayer = xIsNext ? 'X' : 'Y';
  const humanTurn =
    mode === modes.PVP || (mode === modes.PVC && currentPlayer === 'X');

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // AI move effect (easy AI plays "Y")
  useEffect(() => {
    if (mode !== modes.PVC) return;
    if (winner || isDraw) return;

    if (!humanTurn) {
      const timer = setTimeout(() => {
        const aiIndex = getAIMoveEasy(squares);
        if (aiIndex !== null && squares[aiIndex] === null) {
          setSquares((prev) => {
            const next = [...prev];
            next[aiIndex] = 'Y';
            return next;
          });
          setXIsNext(true); // back to X after AI move
        }
      }, 500); // small delay for UX
      return () => clearTimeout(timer);
    }
  }, [mode, humanTurn, winner, isDraw, squares]);

  const status = (() => {
    if (winner) return `Winner: ${winner}`;
    if (isDraw) return "It's a draw";
    return `Turn: ${currentPlayer}${mode === modes.PVC ? (humanTurn ? ' (You)' : ' (Computer)') : ''}`;
  })();

  const canInteract = !winner && !isDraw;

  const handlePlay = (i, mark) => {
    if (!canInteract) return;
    if (squares[i]) return;
    if (mode === modes.PVC && !humanTurn) return;

    const next = [...squares];
    next[i] = mark;
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    // Reset when switching modes for clarity
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon" aria-hidden>◻︎</div>
          <div>
            <div className="brand-title">Tic Tac Toe</div>
            <div className="brand-subtitle">Ocean Professional</div>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="btn btn-ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </header>

      <main className="content">
        <section className="panel">
          <div className="panel-header">
            <h1 className="title">Tic Tac Toe</h1>
            <p className="subtitle">Click a cell to play your move.</p>
          </div>

          <div className="status-row">
            <div
              className={`status-badge ${winner ? 'status-badge--win' : isDraw ? 'status-badge--draw' : ''}`}
              role="status"
              aria-live="polite"
            >
              {status}
            </div>
          </div>

          <div className="board-wrap">
            <Board
              squares={squares}
              onPlay={handlePlay}
              nextPlayer={currentPlayer}
              winningLine={winnerInfo?.line || null}
              isLocked={!canInteract || (mode === modes.PVC && !humanTurn)}
            />
          </div>

          <div className="controls">
            <div className="mode-toggle" role="group" aria-label="Game mode">
              <button
                className={`btn ${mode === modes.PVP ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => switchMode(modes.PVP)}
              >
                2 Players
              </button>
              <button
                className={`btn ${mode === modes.PVC ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => switchMode(modes.PVC)}
              >
                Vs Computer
              </button>
            </div>
            <button className="btn btn-amber" onClick={handleRestart}>
              Restart
            </button>
          </div>

          <div className="help">
            <p>
              Player X always starts. In Vs Computer mode, you play as X and the computer plays as Y.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>Built with React • Modern minimal UI</span>
      </footer>
    </div>
  );
}

export default App;
