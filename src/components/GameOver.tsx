import { useState, useCallback } from 'react';
import type { Grid } from '../sudoku/sudoku';

interface GameOverProps {
  reason: 'win' | 'gameover';
  time: string;
  pseudo: string;
  errors: number;
  puzzle: Grid;
  solution: Grid;
  onRestart: () => void;
}

export default function GameOver({
  reason,
  time,
  pseudo,
  errors,
  puzzle,
  solution,
  onRestart,
}: GameOverProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const p = puzzle.flat().map((v) => (v === 0 ? '.' : String(v))).join('');
    const s = solution.flat().map((v) => String(v)).join('');
    const url = `${window.location.origin}${window.location.pathname}?p=${p}&s=${s}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [puzzle, solution]);

  if (reason === 'win') {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4"
          style={{ animation: 'singleBounce 0.8s ease-out forwards' }}>
          <style>{`
            @keyframes singleBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-30px); }
            }
          `}</style>
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-3xl font-bold text-green-600 mb-2">Bravo</div>
          <div className="text-xl text-gray-700 mb-4">
            Tu y es, <span className="font-semibold">{pseudo}</span> !
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500">Ton temps</div>
            <div className="text-4xl font-mono font-bold text-green-700">{time}</div>
            <div className="text-sm text-gray-500 mt-2">
              {errors === 0
                ? 'Aucune erreur !'
                : `${errors} erreur${errors > 1 ? 's' : ''}`}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              className="px-6 py-3 rounded-xl bg-green-500 text-white font-bold text-lg shadow hover:bg-green-600 transition-colors"
              onClick={onRestart}
            >
              Rejouer 🔄
            </button>
            <button
              className="px-6 py-3 rounded-xl bg-blue-500 text-white font-bold text-lg shadow hover:bg-blue-600 transition-colors"
              onClick={handleShare}
            >
              {copied ? '✅ Lien copié !' : '🔗 Défie un ami'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4">
        <div className="text-6xl mb-4">😢</div>
        <div className="text-3xl font-bold text-red-500 mb-2">Game Over</div>
        <div className="text-xl text-gray-700">
          Oups... <span className="font-semibold">{pseudo}</span>, 3 erreurs !
        </div>
        <div className="text-6xl mt-4 mb-4">💔</div>
        <button
          className="px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-lg shadow hover:bg-red-600 transition-colors"
          onClick={onRestart}
        >
          Réessayer 🔄
        </button>
      </div>
    </div>
  );
}
