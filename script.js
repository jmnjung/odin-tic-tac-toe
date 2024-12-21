const GameState = Object.freeze({
  ONGOING: "ONGOING",
  WIN: "WIN",
  TIE: "TIE",
});

function createCell() {
  let value = "";
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
    if (board[row][col].getValue() !== "") {
      return false;
    }
    board[row][col].setValue(player);
    return true;
  };

  const clearBoard = () => {
    board.forEach((row) => row.forEach((cell) => cell.setValue("")));
  };

  return { getBoard, makeMove, clearBoard };
})();

const gameController = (function () {
  const firstPlayer = { name: "Player 1", token: "X" };
  const secondPlayer = { name: "Player 2", token: "O" };

  const setPlayerName = (player, name) => {
    if (player === 1) {
      firstPlayer.name = name;
    } else {
      secondPlayer.name = name;
    }
  };

  let currentPlayer = firstPlayer;
  const getCurrentPlayer = () => currentPlayer;
  const switchCurrentPlayer = () => {
    currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
  };

  let currentGameState = GameState.ONGOING;
  const getCurrentGameState = () => currentGameState;

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
    return board.every((row) => row.every((cell) => cell.getValue() !== ""));
  };

  const playRound = (row, col) => {
    const moveSuccess = gameBoard.makeMove(row, col, currentPlayer.token);
    if (!moveSuccess) return GameState.ONGOING;

    const currentBoard = gameBoard.getBoard();

    if (checkBoardWin(currentBoard, currentPlayer)) {
      currentGameState = GameState.WIN;
      return;
    }

    if (checkBoardDraw(currentBoard)) {
      currentGameState = GameState.TIE;
      return;
    }

    switchCurrentPlayer();
  };

  const clearGame = () => {
    gameBoard.clearBoard();
    currentPlayer = firstPlayer;
    currentGameState = GameState.ONGOING;
  };

  return {
    setPlayerName,
    getCurrentPlayer,
    getCurrentGameState,
    playRound,
    clearGame,
  };
})();

const displayController = (function () {
  const turnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const messageDiv = document.querySelector(".end-message");

  const startDialog = document.querySelector("#start-dialog");
  const endDialog = document.querySelector("#end-dialog");

  const firstPlayerInput = document.querySelector("#player-one");
  const secondPlayerInput = document.querySelector("#player-two");

  const startBtn = document.querySelector(".start-button");
  const clearBtns = document.querySelectorAll(".clear-button");
  const resetBtns = document.querySelectorAll(".reset-button");

  const updateDisplay = () => {
    const currentPlayer = gameController.getCurrentPlayer();
    turnDiv.textContent = `${currentPlayer.name}'s Turn`;

    if (gameController.getCurrentGameState() !== GameState.ONGOING) {
      document.body.classList.add("game-over");
    } else {
      document.body.classList.remove("game-over");
    }

    const cellBtns = [];

    const currentBoard = gameBoard.getBoard();
    currentBoard.forEach((row, i) => {
      row.forEach((cell, j) => {
        const cellBtn = document.createElement("button");
        cellBtn.classList.add("cell-button");
        cellBtn.dataset.row = i;
        cellBtn.dataset.col = j;
        cellBtn.textContent = cell.getValue();
        cellBtns.push(cellBtn);
      });
    });

    boardDiv.replaceChildren(...cellBtns);
  };

  document.addEventListener("DOMContentLoaded", () => {
    startDialog.showModal();
  });

  boardDiv.addEventListener("click", (e) => {
    if (gameController.getCurrentGameState() !== GameState.ONGOING) return;

    const { row, col } = e.target.dataset;
    if (!row || !col) return;

    gameController.playRound(parseInt(row), parseInt(col));

    updateDisplay();

    if (gameController.getCurrentGameState() === GameState.WIN) {
      const winningPlayer = gameController.getCurrentPlayer();
      messageDiv.textContent = `${winningPlayer.name} Won!`;
      endDialog.showModal();
    }

    if (gameController.getCurrentGameState() === GameState.TIE) {
      messageDiv.textContent = "Tie Game!";
      endDialog.showModal();
    }
  });

  startBtn.addEventListener("click", () => {
    const firstPlayerName = firstPlayerInput.value.trim();
    const secondPlayerName = secondPlayerInput.value.trim();

    gameController.setPlayerName(1, firstPlayerName || "Player 1");
    gameController.setPlayerName(2, secondPlayerName || "Player 2");

    updateDisplay();
  });

  clearBtns.forEach((clearBtn) => {
    clearBtn.addEventListener("click", () => {
      endDialog.close();

      gameController.clearGame();
      updateDisplay();
    });
  });

  resetBtns.forEach((resetBtn) => {
    resetBtn.addEventListener("click", () => {
      endDialog.close();

      gameController.clearGame();
      updateDisplay();

      startDialog.showModal();
    });
  });

  updateDisplay();
})();
