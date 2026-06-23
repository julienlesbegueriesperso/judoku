import { useState } from 'react';

interface StartScreenProps {
  onStart: (pseudo: string) => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = pseudo.trim();
    if (trimmed.length < 2) {
      setError('Il faut au moins 2 caractères ! 🤨');
      return;
    }
    if (trimmed.length > 15) {
      setError('Maximum 15 caractères ! 😮');
      return;
    }
    setError('');
    onStart(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
        <div className="text-6xl mb-4">🧩</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sudoku Rigolo</h1>
        <p className="text-gray-500 mb-6">
          Attrape les nombres, esquive les <span className="text-red-500 font-bold">✖</span>, et deviens un génie ! 🤓
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="pseudo" className="text-left text-sm font-medium text-gray-600">
              Ton pseudo, le stratège numéro 1 👇
            </label>
            <input
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={e => {
                setPseudo(e.target.value);
                if (error) setError('');
              }}
              className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-lg text-center"
              placeholder="Entre ton pseudo..."
              maxLength={15}
              autoFocus
            />
            {error && <span className="text-red-500 text-sm">{error}</span>}
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg shadow hover:from-purple-600 hover:to-blue-600 transition-all"
          >
            C'est parti ! 🚀
          </button>
        </form>
        <div className="mt-6 text-sm text-gray-400">
          <p>⚠️ Tu as droit à 3 erreurs max avant Game Over 💔</p>
          <p className="mt-1">🤔 Double chiffre = Zahlen pas prout !</p>
        </div>
      </div>
    </div>
  );
}
