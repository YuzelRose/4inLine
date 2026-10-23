import { useState, useEffect } from 'react';
import {
  createEmptyBoard,
  getAvailableRow,
  checkWinner,
  getBestMoveConnect4,
  COLS,
  type BoardState,
  type Player,
} from './Utils';
import './board.css';

export default function Board() {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard);
  const [humanPlayer, setHumanPlayer] = useState<Player>('X');
  const [aiPlayer, setAiPlayer] = useState<Player>('O');
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'DRAW' | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  useEffect(() => {
    if (turn === aiPlayer && !winner) {
      const timer = setTimeout(() => {
        const bestCol = getBestMoveConnect4(board, aiPlayer, 5);
        dropPiece(bestCol, aiPlayer);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [turn, board, winner, aiPlayer]);

  const dropPiece = (col: number, player: Player) => {
    const row = getAvailableRow(board, col);
    if (row === -1 || winner) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = player;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setTurn(player === 'X' ? 'O' : 'X');
    }
  };

  const handleColumnClick = (col: number) => {
    if (turn === humanPlayer && !winner) {
      dropPiece(col, humanPlayer);
    }
  };

  const handleReset = (startingHuman: Player = 'X') => {
    setBoard(createEmptyBoard());
    setWinner(null);
    setHumanPlayer(startingHuman);
    setAiPlayer(startingHuman === 'X' ? 'O' : 'X');
    setTurn('X');
    setHoveredCol(null);
  };

  return (
    <div id="connect4-wrapper">
      <div id="status-bar">
        {winner === 'DRAW' && <p>¡Empate!</p>}
        {winner && winner !== 'DRAW' && <p>{winner === humanPlayer ? 'Ganaste' : 'Perdiste'}</p>}
        {!winner && <p><strong>{turn === humanPlayer ? 'Tu Turno' : 'Pensando...'}</strong></p>}
      </div>

      <div id="board-container">
        <div id="preview-row">
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <div key={colIndex} className="preview-cell">
              <div
                className={`preview-token ${
                  hoveredCol === colIndex && turn === humanPlayer && !winner
                    ? humanPlayer.toLowerCase()
                    : ''
                }`}
              />
            </div>
          ))}
        </div>

        <div id="connect4-board">
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="column"
              onClick={() => handleColumnClick(colIndex)}
              onMouseEnter={() => setHoveredCol(colIndex)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="cell">
                  <div className={`token ${row[colIndex] ? row[colIndex]?.toLowerCase() : ''}`} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div id="controls">
        <button id='tu' onClick={() => handleReset('X')}>Empiezas Tú</button>
        <button id='ia' onClick={() => handleReset('O')}>Empieza la IA</button>
      </div>
    </div>
  );
}