import { useState, useCallback } from 'react';
import type { Grid } from '../sudoku/sudoku';
import { checkDuplicates } from '../sudoku/sudoku';

interface Props {
  puzzle: Grid;
  solution: Grid;
  playerGrid: Grid;
  setPlayerGrid: (grid: Grid) => void;
}

export default function SudokuBoard({
  puzzle,
  solution,
  playerGrid,
  setPlayerGrid,
}: Props) {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorEmoji, setErrorEmoji] = useState('');
  const [errorTimer, setErrorTimer] = useState(0);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setSelectedCell([row, col]);
      setErrorMessage('');
      setErrorEmoji('');
    },
    []
  );

  const handleNumberInput = useCallback(
    (num: number) => {
      if (selectedCell === null) return;
      const [row, col] = selectedCell;
      if (puzzle[row][col] !== 0) return;

      const newGrid: Grid = playerGrid.map(r => [...r]);
      newGrid[row][col] = num;

      const duplicate = checkDuplicates(row, col, newGrid);
      if (duplicate !== null) {
        setPlayerGrid(newGrid);
        const emojis: Record<string, string> = {
          row: '🤔',
          box: '🤔',
        };
        const messages: Record<string, string> = {
          row: 'Erreur dans la ligne !',
          box: 'Erreur dans le bloc !',
        };
        setErrorMessage(messages[duplicate]);
        setErrorEmoji(emojis[duplicate]);
        clearTimeout(errorTimer);
        const timer = window.setTimeout(() => {
          setErrorMessage('');
          setErrorEmoji('');
        }, 1500);
        setErrorTimer(timer);
        return;
      }

      if (num !== solution[row][col]) {
        setPlayerGrid(newGrid);
        setErrorMessage('Ce chiffre n\'est pas le bon !');
        setErrorEmoji('😬');
        clearTimeout(errorTimer);
        const timer = window.setTimeout(() => {
          setErrorMessage('');
          setErrorEmoji('');
        }, 1500);
        setErrorTimer(timer);
        return;
      }

      setPlayerGrid(newGrid);
      setErrorMessage('');
      setErrorEmoji('');
    },
    [selectedCell, puzzle, solution, playerGrid, setPlayerGrid, errorTimer]
  );

  const handleBackspace = useCallback(() => {
    if (selectedCell === null) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    const newGrid: Grid = playerGrid.map(r => [...r]);
    newGrid[row][col] = 0;
    setPlayerGrid(newGrid);
  }, [selectedCell, puzzle, playerGrid, setPlayerGrid]);

  const getCellColor = (row: number, col: number): string => {
    if (puzzle[row][col] !== 0) return '#ebebeb';
    if (playerGrid[row][col] !== 0 && playerGrid[row][col] === solution[row][col]) {
      return '#d4edda';
    }
    if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
      return '#d0e8ff';
    }
    return '#ffffff';
  };

  const renderNumber = (row: number, col: number): string => {
    if (puzzle[row][col] !== 0) return String(playerGrid[row][col]);
    return String(playerGrid[row][col]);
  };

  const renderCellsForRow = (rowArr: number[], rowIdx: number) => (
    <div key={rowIdx} className="flex">
      {rowArr.map((_, colIdx) => {
        const borderRight = colIdx === 2 || colIdx === 5 ? 'border-r-[4px] border-r-gray-800' : '';
        const borderBottom = rowIdx === 2 || rowIdx === 5 ? 'border-b-[4px] border-b-gray-800' : '';
        return (
          <div
            key={`${rowIdx}-${colIdx}`}
            className={`flex items-center justify-center text-xl font-bold cursor-pointer select-none transition-colors ${borderRight} ${borderBottom}`}
            style={{
              width: 48,
              height: 48,
              backgroundColor: getCellColor(rowIdx, colIdx),
              color: puzzle[rowIdx][colIdx] !== 0 ? '#1a1a1a' : '#555',
              fontWeight: puzzle[rowIdx][colIdx] !== 0 ? 700 : 400,
            }}
            onMouseDown={() => handleCellClick(rowIdx, colIdx)}
            role="button"
            aria-label={`Cellule ${rowIdx + 1}-${colIdx + 1}`}
          >
            {renderNumber(rowIdx, colIdx)}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3">
      {errorMessage && (
        <div className="animate-bounce text-center">
          <div className="text-4xl">{errorEmoji}</div>
          <div className="text-red-600 text-sm font-medium">{errorMessage}</div>
        </div>
      )}
      <div style={{ border: '2px solid #333' }}>
        {playerGrid.map((rowArr, rowIdx) => renderCellsForRow(rowArr, rowIdx))}
      </div>
      <div className="flex gap-2 mt-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className="w-10 h-10 rounded-lg bg-gradient-to-b from-blue-100 to-blue-200 text-2xl font-bold text-blue-800 shadow hover:from-blue-200 hover:to-blue-300 transition-colors"
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition-colors"
        onClick={handleBackspace}
      >
        ⌫ Effacer
      </button>
    </div>
  );
}
