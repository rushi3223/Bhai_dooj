(function(){
  let currentPlayer = 'girl'; // Start with girl
  let gameBoard = ['', '', '', '', '', '', '', '', ''];
  let gameActive = true;
  let isAIPlaying = false;
  
  const gameBoardEl = document.getElementById('gameBoard');
  const currentPlayerEl = document.getElementById('currentPlayer');
  const gameResultEl = document.getElementById('gameResult');
  const resultTextEl = document.getElementById('resultText');
  const nextPageBtn = document.getElementById('nextPage');
  const playAgainBtn = document.getElementById('playAgain');
  const backToHomeBtn = document.getElementById('backToHome');
  
  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];
  
  function updateCurrentPlayer() {
    currentPlayerEl.textContent = currentPlayer === 'boy' ? "Brother's Turn" : "Sister's Turn";
  }
  
  function startNewGame() {
    currentPlayer = 'girl'; // Always start with girl
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isAIPlaying = false;
    
    // Clear all cells
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('boy', 'girl');
    });
    
    gameResultEl.style.display = 'none';
    // Reset buttons
    nextPageBtn.style.display = 'none';
    nextPageBtn.textContent = 'Next';
    nextPageBtn.classList.remove('unlocked');
    playAgainBtn.style.display = 'none';
    updateCurrentPlayer();
  }
  
  function makeMove(index) {
    if (gameBoard[index] !== '' || !gameActive || isAIPlaying) return;
    
    gameBoard[index] = currentPlayer;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.add(currentPlayer);
    
    if (checkWin()) {
      gameActive = false;
      const winner = currentPlayer === 'boy' ? 'Brother' : 'Sister';
      if (winner === 'Sister') {
        resultTextEl.textContent = `🎉 Sister Wins! You beat the AI brother! 🎉`;
        // Show next page button after sister wins
        setTimeout(() => {
          nextPageBtn.style.display = 'block';
          nextPageBtn.textContent = '🎉 Next Page Unlocked! 🎉';
          nextPageBtn.classList.add('unlocked');
          playAgainBtn.style.display = 'block';
        }, 1500);
      } else {
        resultTextEl.textContent = `😤 Brother Wins! Try again, Sister! 😤`;
        // Show play again button when brother wins
        setTimeout(() => {
          playAgainBtn.style.display = 'block';
        }, 1000);
      }
      gameResultEl.style.display = 'block';
      return;
    }
    
    if (checkDraw()) {
      gameActive = false;
      resultTextEl.textContent = "🤝 It's a Draw! 🤝";
      gameResultEl.style.display = 'block';
      // Show play again button on draw
      setTimeout(() => {
        playAgainBtn.style.display = 'block';
      }, 1000);
      return;
    }
    
    currentPlayer = currentPlayer === 'boy' ? 'girl' : 'boy';
    updateCurrentPlayer();
    
    // If it's boy's turn, trigger AI move after a short delay
    if (currentPlayer === 'boy' && gameActive) {
      setTimeout(() => {
        makeAIMove();
      }, 800);
    }
  }
  
  function checkWin() {
    return winningConditions.some(condition => {
      return condition.every(index => gameBoard[index] === currentPlayer);
    });
  }
  
  function checkDraw() {
    return gameBoard.every(cell => cell !== '');
  }
  
  function makeAIMove() {
    if (!gameActive || currentPlayer !== 'boy') return;
    
    isAIPlaying = true;
    
    // AI Strategy: Try to win, then block, then take center, then corners, then edges
    let move = findWinningMove('boy') || 
               findWinningMove('girl') || 
               (gameBoard[4] === '' ? 4 : null) ||
               findCornerMove() ||
               findEdgeMove();
    
    if (move !== null) {
      setTimeout(() => {
        gameBoard[move] = 'boy';
        const cell = document.querySelector(`[data-index="${move}"]`);
        cell.classList.add('boy');
        
        if (checkWin()) {
          gameActive = false;
          resultTextEl.textContent = `😤 Brother Wins! Try again, Sister! 😤`;
          gameResultEl.style.display = 'block';
          isAIPlaying = false;
          return;
        }
        
        if (checkDraw()) {
          gameActive = false;
          resultTextEl.textContent = "🤝 It's a Draw! 🤝";
          gameResultEl.style.display = 'block';
          // Show play again button on draw
          setTimeout(() => {
            playAgainBtn.style.display = 'block';
          }, 1000);
          isAIPlaying = false;
          return;
        }
        
        currentPlayer = 'girl';
        updateCurrentPlayer();
        isAIPlaying = false;
      }, 500);
    }
  }
  
  function findWinningMove(player) {
    for (let condition of winningConditions) {
      const [a, b, c] = condition;
      const line = [gameBoard[a], gameBoard[b], gameBoard[c]];
      const playerCount = line.filter(cell => cell === player).length;
      const emptyCount = line.filter(cell => cell === '').length;
      
      if (playerCount === 2 && emptyCount === 1) {
        return condition.find(index => gameBoard[index] === '');
      }
    }
    return null;
  }
  
  function findCornerMove() {
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(index => gameBoard[index] === '');
    return emptyCorners.length > 0 ? emptyCorners[Math.floor(Math.random() * emptyCorners.length)] : null;
  }
  
  function findEdgeMove() {
    const edges = [1, 3, 5, 7];
    const emptyEdges = edges.filter(index => gameBoard[index] === '');
    return emptyEdges.length > 0 ? emptyEdges[Math.floor(Math.random() * emptyEdges.length)] : null;
  }
  
  function goToNextPage() {
    // Only allow next page if sister won
    if (nextPageBtn.classList.contains('unlocked')) {
      // Go to the letter page
      window.location.href = 'page3.html';
    }
  }
  
  function goBackHome() {
    window.location.href = 'index.html';
  }
  
  // Event listeners
  gameBoardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) {
      const index = parseInt(cell.dataset.index);
      makeMove(index);
    }
  });
  
  nextPageBtn.addEventListener('click', goToNextPage);
  playAgainBtn.addEventListener('click', startNewGame);
  backToHomeBtn.addEventListener('click', goBackHome);
  
  // Initialize - start new game automatically
  startNewGame();
})();
