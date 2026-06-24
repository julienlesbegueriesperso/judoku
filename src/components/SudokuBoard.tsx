import { useState, useCallback, useEffect } from 'react';
import type { Grid } from '../sudoku/sudoku';
import { checkDuplicates } from '../sudoku/sudoku';

const isGridComplete = (grid: Grid, solution: Grid): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
      if (grid[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
};

function useCellSize() {
  const [size, setSize] = useState(48);
  useEffect(() => {
    const compute = () => {
      const vw = window.innerWidth;
      const padding = 32;
      const calculated = Math.floor((vw - padding) / 9);
      setSize(Math.min(48, Math.max(32, calculated)));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);
  return size;
}

interface Props {
  puzzle: Grid;
  solution: Grid;
  playerGrid: Grid;
  setPlayerGrid: (grid: Grid) => void;
  onError: () => void;
  onGridComplete: () => void;
}

export default function SudokuBoard({
  puzzle,
  solution,
  playerGrid,
  setPlayerGrid,
  onError,
  onGridComplete,
}: Props) {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorEmoji, setErrorEmoji] = useState('');
  const [errorTimer, setErrorTimer] = useState(0);
  const cellSize = useCellSize();
  const btnSize = Math.min(40, cellSize - 8);

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
        onError();
        const emojis: Record<string, string> = {
          row: '🤔',
          box: '🤔',
        };
        const messages: Record<string, string> = {
          row: 'Erreur ligne',
          box: 'Erreur dans le bloc',
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
        onError();
        if (isGridComplete(newGrid, solution)) onGridComplete();
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
      if (isGridComplete(newGrid, solution)) onGridComplete();
    },
    [selectedCell, puzzle, solution, playerGrid, setPlayerGrid, errorTimer, onError, onGridComplete]
  );

  const handleBackspace = useCallback(() => {
    if (selectedCell === null) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    const newGrid: Grid = playerGrid.map(r => [...r]);
    newGrid[row][col] = 0;
    setPlayerGrid(newGrid);
    if (isGridComplete(newGrid, solution)) onGridComplete();
  }, [selectedCell, puzzle, playerGrid, setPlayerGrid, solution, onGridComplete]);

  const handleNavigate = useCallback(
    (direction: 'up' | 'down' | 'left' | 'right') => {
      if (selectedCell === null) return;
      const [row, col] = selectedCell;
      let newRow = row;
      let newCol = col;
      if (direction === 'up') newRow = Math.max(0, row - 1);
      if (direction === 'down') newRow = Math.min(8, row + 1);
      if (direction === 'left') newCol = Math.max(0, col - 1);
      if (direction === 'right') newCol = Math.min(8, col + 1);
      handleCellClick(newRow, newCol);
    },
    [selectedCell, handleCellClick]
  );

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

  const isSameNumber = (row: number, col: number): boolean => {
    if (selectedCell === null) return false;
    const [selRow, selCol] = selectedCell;
    const selectedValue = playerGrid[selRow][selCol];
    if (selectedValue === 0) return false;
    return playerGrid[row][col] === selectedValue;
  };

  const highlightColor = (row: number, col: number): string => {
    if (isSameNumber(row, col)) {
      const [selRow, selCol] = selectedCell!;
      if (row === selRow && col === selCol) return '#aaddff';
      return '#e0f0ff';
    }
    return '#ffffff';
  };

  const getCellBg = (row: number, col: number): string => {
    if (isSameNumber(row, col)) {
      return highlightColor(row, col);
    }
    return getCellColor(row, col);
  };

  const getButtonStyle = (num: number): string => {
    let count = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (playerGrid[r][c] === num) count++;
      }
    }
    if (count >= 9) {
      return 'opacity-40 pointer-events-none grayscale';
    }
    return '';
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedCell === null) return;
      
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleNumberInput(parseInt(e.key, 10));
        return;
      }
      
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
        handleNavigate(direction);
      }
    },
    [selectedCell, handleNumberInput, handleBackspace, handleNavigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderNumber = (row: number, col: number): string => {
    const val = playerGrid[row][col];
    if (val === 0) return '';
    return String(val);
  };

  const renderCellsForRow = (rowArr: number[], rowIdx: number) => (
    <div key={rowIdx} className="flex">
      {rowArr.map((_, colIdx) => {
        const borderRight = colIdx === 2 || colIdx === 5 ? 'border-r-[4px] border-r-gray-800' : '';
        const borderBottom = rowIdx === 2 || rowIdx === 5 ? 'border-b-[4px] border-b-gray-800' : '';
        return (
          <div
            key={`${rowIdx}-${colIdx}`}
            className={`flex items-center justify-center font-bold cursor-pointer select-none transition-colors ${borderRight} ${borderBottom}`}
            style={{
              width: cellSize,
              height: cellSize,
              fontSize: 20,
              backgroundColor: getCellBg(rowIdx, colIdx),
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
      <div
        className="flex gap-1.5 mt-3 flex-wrap justify-center"
        style={{ maxWidth: cellSize * 9 + 16 }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            className={`rounded-lg bg-gradient-to-b from-blue-100 to-blue-200 font-bold text-blue-800 shadow hover:from-blue-200 hover:to-blue-300 transition-colors ${getButtonStyle(num)}`}
            style={{ width: btnSize, height: btnSize, fontSize: 18 }}
            onClick={() => handleNumberInput(num)}
          >
            {num}
          </button>
        ))}
      </div>
      <button
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-medium hover:bg-gray-300 transition-colors text-sm mt-2"
        onClick={handleBackspace}
      >
        ⌫ Effacer
      </button>
    </div>
  );
}
