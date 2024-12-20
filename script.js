function createCell() {
  let value = 0;
  const getValue = () => value;
  const setValue = (player) => {
    value = player;
  };
  return { getValue, setValue };
}

const gameBoard = (function () {
  const board = [];

  for (let i = 0; i < 3; i++) {
    board[i] = [];
    for (let j = 0; j < 3; j++) {
      board[i].push(createCell());
    }
  }

  const getBoard = () => board;

  const makeMove = (row, col, player) => {
    if (board[row][col].getValue() !== 0) {
      return false;
    }
    board[row][col].setValue(player);
    return true;
  };

  const printBoard = () => {
    const boardValues = board.map((row) => row.map((cell) => cell.getValue()));
    console.log(boardValues);
  };

  return { getBoard, makeMove, printBoard };
})();

const gameController = (function (
  firstPlayerName = "Player 1",
  secondPlayerName = "Player 2"
) {
  const firstPlayer = { name: firstPlayerName, token: 1 };
  const secondPlayer = { name: secondPlayerName, token: 2 };

  let currentPlayer = firstPlayer;
  const switchCurrentPlayer = () => {
    currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
  };

  const printNewRound = () => {
    gameBoard.printBoard();
    console.log(`${currentPlayer.name}'s Turn...`);
  };

  const checkLineWin = (line, player) => {
    return line.every((cell) => cell.getValue() === player.token);
  };

  const checkBoardWin = (board, player) => {
    const rowWin = board.some((row) => checkLineWin(row, player));
    const colWin = board.some((_, j) =>
      checkLineWin(
        board.map((row) => row[j]),
        player
      )
    );

    const diagonals = [
      [board[0][0], board[1][1], board[2][2]],
      [board[0][2], board[1][1], board[2][0]],
    ];
    const diagonalWin = diagonals.some((diagonal) =>
      checkLineWin(diagonal, player)
    );

    return rowWin || colWin || diagonalWin;
  };

  const checkBoardDraw = (board) => {
    return board.every((row) => row.every((cell) => cell.getValue() !== 0));
  };

  const playRound = (row, col) => {
    const moveSuccess = gameBoard.makeMove(row, col, currentPlayer.token);
    if (!moveSuccess) return;

    const currentBoard = gameBoard.getBoard();

    if (checkBoardWin(currentBoard, currentPlayer)) {
      console.log(`${currentPlayer.name} won!`);
      return;
    }

    if (checkBoardDraw(currentBoard)) {
      console.log("It is a tie!");
      return;
    }

    switchCurrentPlayer();
    printNewRound();
  };

  printNewRound();

  return { playRound };
})();
