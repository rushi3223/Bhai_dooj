(function () {
  let currentPlayer = "girl"; // Start with girl
  let gameBoard = ["", "", "", "", "", "", "", "", ""];
  let gameActive = true;
  let isAIPlaying = false;

  const gameBoardEl = document.getElementById("gameBoard");
  const currentPlayerEl = document.getElementById("currentPlayer");
  const gameResultEl = document.getElementById("gameResult");
  const resultTextEl = document.getElementById("resultText");
  const nextPageBtn = document.getElementById("nextPage");
  const playAgainBtn = document.getElementById("playAgain");
  const backToHomeBtn = document.getElementById("backToHome");

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  function updateCurrentPlayer() {
    currentPlayerEl.textContent =
      currentPlayer === "boy" ? "Brother's Turn" : "Sister's Turn";
  }

  function startNewGame() {
    currentPlayer = "girl"; // Always start with girl
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    isAIPlaying = false;

    // Clear all cells
    document.querySelectorAll(".cell").forEach((cell) => {
      cell.classList.remove("boy", "girl");
    });

    gameResultEl.style.display = "none";
    // Reset buttons
    nextPageBtn.style.display = "none";
    nextPageBtn.textContent = "Next";
    nextPageBtn.classList.remove("unlocked");
    playAgainBtn.style.display = "none";
    updateCurrentPlayer();
  }

  function makeMove(index) {
    if (gameBoard[index] !== "" || !gameActive || isAIPlaying) return;

    gameBoard[index] = currentPlayer;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.add(currentPlayer);

    if (checkWin()) {
      gameActive = false;
      const winner = currentPlayer === "boy" ? "Brother" : "Sister";
      if (winner === "Sister") {
        resultTextEl.textContent = `🎉 Sister Wins! You beat the brother! 🎉`;
        // Show next page button after sister wins
        setTimeout(() => {
          nextPageBtn.style.display = "block";
          nextPageBtn.textContent = "🎉 Next Page Unlocked! 🎉";
          nextPageBtn.classList.add("unlocked");
          playAgainBtn.style.display = "block";
        }, 1500);
      } else {
        resultTextEl.textContent = `😤 Brother Wins! Try again, Sister! 😤`;
        // Show play again button when brother wins
        setTimeout(() => {
          playAgainBtn.style.display = "block";
        }, 1000);
      }
      gameResultEl.style.display = "block";
      return;
    }

    if (checkDraw()) {
      gameActive = false;
      resultTextEl.textContent = "🤝 It's a Draw! 🤝";
      gameResultEl.style.display = "block";
      // Show play again button on draw
      setTimeout(() => {
        playAgainBtn.style.display = "block";
      }, 1000);
      return;
    }

    currentPlayer = currentPlayer === "boy" ? "girl" : "boy";
    updateCurrentPlayer();

    // If it's boy's turn, trigger AI move instantly
    if (currentPlayer === "boy" && gameActive) {
      makeAIMove();
    }
  }

  function checkWin() {
    return winningConditions.some((condition) => {
      return condition.every((index) => gameBoard[index] === currentPlayer);
    });
  }

  function checkDraw() {
    return gameBoard.every((cell) => cell !== "");
  }

  function makeAIMove() {
    if (!gameActive || currentPlayer !== "boy") return;

    isAIPlaying = true;

    // Get the best move using limited-depth minimax for medium difficulty
    const bestMove = getBestMove(4); // Depth limit 4 for medium difficulty

    if (bestMove !== null) {
      gameBoard[bestMove] = "boy";
      const cell = document.querySelector(`[data-index="${bestMove}"]`);
      cell.classList.add("boy");

      if (checkWin()) {
        gameActive = false;
        resultTextEl.textContent = `😤 Brother Wins! Try again, Sister! 😤`;
        gameResultEl.style.display = "block";
        // Show play again button when brother wins
        setTimeout(() => {
          playAgainBtn.style.display = "block";
        }, 1000);
        isAIPlaying = false;
        return;
      }

      if (checkDraw()) {
        gameActive = false;
        resultTextEl.textContent = "🤝 It's a Draw! 🤝";
        gameResultEl.style.display = "block";
        // Show play again button on draw
        setTimeout(() => {
          playAgainBtn.style.display = "block";
        }, 1000);
        isAIPlaying = false;
        return;
      }

      currentPlayer = "girl";
      updateCurrentPlayer();
      isAIPlaying = false;
    }
  }

  function getBestMove(maxDepth) {
    let bestScore = -Infinity;
    let bestMove = null;
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === "") {
        gameBoard[i] = "boy";
        let score = minimax(gameBoard, 0, false, maxDepth);
        gameBoard[i] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  function minimax(board, depth, isMaximizing, maxDepth) {
    if (depth >= maxDepth) return 0; // Depth limit for medium difficulty

    if (checkWinForPlayer("boy", board)) return 10 - depth;
    if (checkWinForPlayer("girl", board)) return depth - 10;
    if (isBoardFull(board)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "boy";
          let score = minimax(board, depth + 1, false, maxDepth);
          board[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
          board[i] = "girl";
          let score = minimax(board, depth + 1, true, maxDepth);
          board[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  function checkWinForPlayer(player, board) {
    return winningConditions.some((condition) => {
      return condition.every((index) => board[index] === player);
    });
  }

  function isBoardFull(board) {
    return board.every((cell) => cell !== "");
  }

  function goToNextPage() {
    // Only allow next page if sister won
    if (nextPageBtn.classList.contains("unlocked")) {
      // Go to the letter page
      window.location.href = "page3.html";
    }
  }

  function goBackHome() {
    window.location.href = "index.html";
  }

  // Event listeners
  gameBoardEl.addEventListener("click", (e) => {
    const cell = e.target.closest(".cell");
    if (cell) {
      const index = parseInt(cell.dataset.index);
      makeMove(index);
    }
  });

  nextPageBtn.addEventListener("click", goToNextPage);
  playAgainBtn.addEventListener("click", startNewGame);
  backToHomeBtn.addEventListener("click", goBackHome);

  // Initialize - start new game automatically
  startNewGame();
})();
