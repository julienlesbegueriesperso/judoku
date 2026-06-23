interface GameOverProps {
  reason: 'win' | 'gameover';
  time: string;
  pseudo: string;
  onRestart: () => void;
}

export default function GameOver({ reason, time, pseudo, onRestart }: GameOverProps) {
  if (reason === 'win') {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 animate-bounce">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-3xl font-bold text-green-600 mb-2">Bravo</div>
          <div className="text-xl text-gray-700 mb-4">
            Tu y es, <span className="font-semibold">{pseudo}</span> !
          </div>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <div className="text-sm text-gray-500">Ton temps</div>
            <div className="text-4xl font-mono font-bold text-green-700">{time}</div>
          </div>
          <button
            className="px-6 py-3 rounded-xl bg-green-500 text-white font-bold text-lg shadow hover:bg-green-600 transition-colors"
            onClick={onRestart}
          >
            Rejouer 🔄
          </button>
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
