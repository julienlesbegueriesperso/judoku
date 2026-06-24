export type Grid = number[][];

export function createEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[i][col] === num && (i !== row)) {
      return false;
    }
  }
  for (let j = 0; j < 9; j++) {
    if (grid[row][j] === num && (j !== col)) {
      return false;
    }
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
        return false;
      }
    }
  }
  return true;
}

function shuffleWithRandom<T>(arr: T[], random: () => number): T[] {
  const copy = [...arr];
  copy.sort(() => random() - 0.5);
  return copy;
}

function solve(grid: Grid, random: () => number): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        const shuffled = shuffleWithRandom([1, 2, 3, 4, 5, 6, 7, 8, 9], random);
        for (const num of shuffled) {
          if (isValid(grid, i, j, num)) {
            grid[i][j] = num;
            if (solve(grid, random)) {
              return true;
            }
            grid[i][j] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function countSolutions(grid: Grid, limit: number): number {
  let count = 0;
  function solveLimited(g: Grid): number {
    if (count >= limit) return count;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (g[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(g, i, j, num)) {
              g[i][j] = num;
              count += solveLimited(g);
              g[i][j] = 0;
              if (count >= limit) return count;
            }
          }
          return count;
        }
      }
    }
    count++;
    return count;
  }
  solveLimited(grid);
  return count;
}

export function generatePuzzleWithSeed(seed: number, difficulty: number = 40): { puzzle: Grid; solution: Grid } {
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };

  const grid = createEmptyGrid();
  solve(grid, rng);

  const solution = grid.map(row => [...row]);

  const cellsToRemove = difficulty;
  let removed = 0;

  const positions = Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9]);
  const shuffled = shuffleWithRandom(positions, rng);

  for (const [row, col] of shuffled) {
    if (removed >= cellsToRemove) break;

    const backup = grid[row][col];
    grid[row][col] = 0;

    const copy = grid.map(r => [...r]);
    if (countSolutions(copy, 2) === 1) {
      removed++;
    } else {
      grid[row][col] = backup;
    }
  }

  return { puzzle: grid, solution };
}

export function generatePuzzle(difficulty: number = 40): { puzzle: Grid; solution: Grid } {
  return generatePuzzleWithSeed(Date.now(), difficulty);
}

export function encodePuzzle(puzzle: Grid): string {
  return puzzle
    .flat()
    .map((v) => (v === 0 ? '.' : String(v)))
    .join('');
}

export function decodePuzzle(encoded: string): Grid {
  const values: number[] = encoded
    .split('')
    .map(c => (c === '.' ? 0 : parseInt(c, 10)));
  return Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => values[row * 9 + col])
  );
}

export function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== row && grid[i][col] === num) return false;
  }
  for (let j = 0; j < 9; j++) {
    if (j !== col && grid[row][j] === num) return false;
  }
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = startRow + i;
      const c = startCol + j;
      if ((r !== row || c !== col) && grid[r][c] === num) {
        return false;
      }
    }
  }
  return true;
}

export function checkDuplicates(row: number, col: number, grid: Grid): 'row' | 'box' | 'error' | null {
  const num = grid[row][col];
  if (num === 0) return null;

  let rowDuplicates = 0;
  for (let j = 0; j < 9; j++) {
    if (j !== col && grid[row][j] === num) {
      rowDuplicates++;
    }
  }

  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  let boxDuplicates = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = startRow + i;
      const c = startCol + j;
      if ((r !== row || c !== col) && grid[r][c] === num) {
        boxDuplicates++;
      }
    }
  }

  if (boxDuplicates > 0) return 'box';
  if (rowDuplicates > 0) return 'row';
  return null;
}

export function isSolved(grid: Grid): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) return false;
    }
  }
  return true;
}
