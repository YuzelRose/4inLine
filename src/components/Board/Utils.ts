export type Player = 'X' | 'O'; // 'X' = Humano, 'O' = IA
export type BoardState = (Player | null)[][];

export const ROWS = 6;
export const COLS = 7;

export function createEmptyBoard(): BoardState {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function getAvailableRow(board: BoardState, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

export function checkWinner(board: BoardState): Player | 'DRAW' | null {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) return p;
    }
  }

  // Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) return p;
    }
  }

  // Diagonales
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r - 1][c + 1] && p === board[r - 2][c + 2] && p === board[r - 3][c + 3]) return p;
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) return p;
    }
  }

  if (board.every((row) => row.every((cell) => cell !== null))) return 'DRAW';

  return null;
}

function evaluateWindow(window: (Player | null)[], player: Player): number {
  const opponent: Player = player === 'X' ? 'O' : 'X';
  let score = 0;
  const playerCount = window.filter((cell) => cell === player).length;
  const emptyCount = window.filter((cell) => cell === null).length;
  const oppCount = window.filter((cell) => cell === opponent).length;

  if (playerCount === 4) score += 10000;
  else if (playerCount === 3 && emptyCount === 1) score += 100;
  else if (playerCount === 2 && emptyCount === 2) score += 10;

  if (oppCount === 3 && emptyCount === 1) score -= 80;

  return score;
}

function scoreBoard(board: BoardState, player: Player): number {
  let score = 0;
  const centerArray = board.map((row) => row[Math.floor(COLS / 2)]);
  score += centerArray.filter((cell) => cell === player).length * 6;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += evaluateWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], player);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], player);
    }
  }

  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += evaluateWindow([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]], player);
    }
  }

  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]], player);
    }
  }

  return score;
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): { score: number; col?: number } {
  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';
  const winner = checkWinner(board);

  if (winner === aiPlayer) return { score: 1000000 };
  if (winner === humanPlayer) return { score: -1000000 };
  if (winner === 'DRAW' || depth === 0) return { score: scoreBoard(board, aiPlayer) };

  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) validCols.push(c);
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestCol = validCols[0];
    for (const c of validCols) {
      const r = getAvailableRow(board, c);
      board[r][c] = aiPlayer;
      const result = minimax(board, depth - 1, alpha, beta, false, aiPlayer);
      board[r][c] = null;
      if (result.score > maxScore) {
        maxScore = result.score;
        bestCol = c;
      }
      alpha = Math.max(alpha, maxScore);
      if (alpha >= beta) break;
    }
    return { score: maxScore, col: bestCol };
  } else {
    let minScore = Infinity;
    let bestCol = validCols[0];
    for (const c of validCols) {
      const r = getAvailableRow(board, c);
      board[r][c] = humanPlayer;
      const result = minimax(board, depth - 1, alpha, beta, true, aiPlayer);
      board[r][c] = null;
      if (result.score < minScore) {
        minScore = result.score;
        bestCol = c;
      }
      beta = Math.min(beta, minScore);
      if (alpha >= beta) break;
    }
    return { score: minScore, col: bestCol };
  }
}

export function getBestMoveConnect4(board: BoardState, aiPlayer: Player, depth: number = 5): number {
  const result = minimax(board, depth, -Infinity, Infinity, true, aiPlayer);
  return result.col ?? 3;
}