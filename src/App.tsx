import { useState, useCallback, useEffect, useRef } from 'react';
import { generatePuzzle } from './sudoku/sudoku';
import type { Grid } from './sudoku/sudoku';
import StartScreen from './components/StartScreen';
import SudokuBoardComponent from './components/SudokuBoard';
import GameOver from './components/GameOver';

type Screen = 'start' | 'playing' | 'gameover';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const DIFFICULTIES = [
  { label: 'Facile 🌟', value: 30 },
  { label: 'Moyen 🌟🌟', value: 45 },
  { label: 'Difficile 🌟🌟🌟', value: 55 },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [pseudo, setPseudo] = useState('');
  const [difficulty, setDifficulty] = useState<number>(40);
  const [puzzle, setPuzzle] = useState<Grid>([]);
  const [solution, setSolution] = useState<Grid>([]);
  const [playerGrid, setPlayerGrid] = useState<Grid>([]);
  const [errors, setErrors] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [DONE, setDONE] = useState<'win' | 'gameover' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startGame = useCallback((playerPseudo: string) => {
    const { puzzle: puz, solution: sol } = generatePuzzle(difficulty);
    setPuzzle(puz);
    setSolution(sol);
    setPseudo(playerPseudo);
    setPlayerGrid(puz.map(r => [...r]));
    setErrors(0);
    setSeconds(0);
    setDONE(null);

    setScreen('playing');

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }, [difficulty]);

  const restartGame = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const { puzzle: puz, solution: sol } = generatePuzzle(difficulty);
    setPuzzle(puz);
    setSolution(sol);
    setPlayerGrid(puz.map(r => [...r]));
    setErrors(0);
    setSeconds(0);
    setDONE(null);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }, [difficulty]);

  const goToStart = useCallback(() => {
    setScreen('start');
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // Check win/lose
  useEffect(() => {
    if (screen !== 'playing') return;
    if (errors >= 3) {
      setDONE('gameover');
      setScreen('gameover');
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
  }, [errors, screen]);

  // Restart game when DONE changes
  useEffect(() => {
    if (DONE !== null) {
      setScreen('gameover');
    }
  }, [DONE]);

  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-lg mx-auto px-4 py-6">
          <StartScreen onStart={startGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToStart}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🧩 Sudoku Rigolo</h1>
          <button
            onClick={() => {
              const newPuzzle = DIFFICULTIES[
                (DIFFICULTIES.findIndex(d => d.value === difficulty) + 1) %
                  DIFFICULTIES.length
              ];
              setDifficulty(newPuzzle.value);
            }}
            className="text-sm bg-white rounded-full px-3 py-1 shadow text-gray-600"
          >
            {DIFFICULTIES.find(d => d.value === difficulty)?.label}
          </button>
        </div>

        {/* Player info bar */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow p-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <div>
              <div className="text-sm text-gray-500">Joueur</div>
              <div className="font-bold text-gray-800">{pseudo}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Temps écoulé</div>
            <div className="font-mono text-2xl font-bold text-blue-700">
              {formatTime(seconds)}
            </div>
          </div>
        </div>

        {/* Error indicator (3 strikes) */}
        <div className="flex justify-center gap-2 mb-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`px-4 py-2 rounded-full text-xl font-bold transition-all ${
                i < errors
                  ? 'bg-red-100 text-red-500 animate-pulse'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              ✖
            </div>
          ))}
          <div className="ml-4 text-sm text-gray-600 font-medium">
            {errors === 0 ? 'Pas encore d\'erreur !' : errors === 1 ? 'Une de plus...' : 'Attention !'}
          </div>
        </div>

        {/* Sudoku board */}
        <SudokuBoardComponent
          puzzle={puzzle}
          solution={solution}
          playerGrid={playerGrid}
          setPlayerGrid={setPlayerGrid}
        />

        {/* Difficulty selector for restart */}
        <div className="flex justify-center gap-2 mt-6">
          {DIFFICULTIES.map(d => (
            <button
              key={d.value}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                d.value === difficulty
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-100'
              }`}
              onClick={() => {
                setDifficulty(d.value);
                restartGame();
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {DONE && (
        <GameOver
          reason={DONE}
          time={formatTime(seconds)}
          pseudo={pseudo}
          onRestart={restartGame}
        />
      )}
    </div>
  );
}
