(function(){
  const root = document.getElementById('app-root');
  const viewport = document.getElementById('app-viewport');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas.getContext('2d');
  
  // Page navigation
  let currentPage = 1;
  const totalPages = 4;

  const BASE_W = 393; const BASE_H = 852;

  function fit() {
    const vw = window.innerWidth; 
    const vh = window.innerHeight;
    
    // Calculate scale to fit within viewport with padding
    const maxWidth = vw - 20; // 10px padding on each side
    const maxHeight = vh - 20; // 10px padding on top/bottom
    const scale = Math.min(maxWidth / BASE_W, maxHeight / BASE_H, 1);
    
    root.style.transform = `scale(${scale}) translateZ(0)`;
    root.style.marginLeft = '0';
    root.style.marginTop = '0';
    
    // canvas
    confettiCanvas.width = vw * devicePixelRatio;
    confettiCanvas.height = vh * devicePixelRatio;
    confettiCanvas.style.width = vw + 'px';
    confettiCanvas.style.height = vh + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  window.addEventListener('resize', fit);
  fit();

  // Page navigation functions
  function showPage(pageNumber) {
    // Hide all pages
    for (let i = 1; i <= totalPages; i++) {
      const page = document.getElementById(`page${i}`);
      if (page) page.style.display = 'none';
    }
    
    // Show current page
    const currentPageEl = document.getElementById(`page${pageNumber}`);
    if (currentPageEl) {
      currentPageEl.style.display = 'block';
      currentPage = pageNumber;
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      showPage(currentPage + 1);
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      showPage(currentPage - 1);
    }
  }

  function goToHome() {
    showPage(1);
  }

  // Event listeners for navigation
  const btnNext = document.getElementById('btnNext');
  btnNext?.addEventListener('click', nextPage);

  // Back to game button for page3
  const backToGameBtn = document.getElementById('backToGame');
  backToGameBtn?.addEventListener('click', ()=>{
    showPage(2);
  });

  // Back to letter button for page4
  const backToLetterBtn = document.getElementById('backToLetter');
  backToLetterBtn?.addEventListener('click', ()=>{
    showPage(3);
  });

  // Back to home buttons
  const backToHomeBtns = document.querySelectorAll('#backToHome');
  backToHomeBtns.forEach(btn => {
    btn.addEventListener('click', goToHome);
  });

  // Game logic for page 2
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
  
  const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];
  
  function updateCurrentPlayer() {
    if (currentPlayerEl) {
      currentPlayerEl.textContent = currentPlayer === 'boy' ? "Brother's Turn" : "Sister's Turn";
    }
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
    
    if (gameResultEl) gameResultEl.style.display = 'none';
    // Reset buttons
    if (nextPageBtn) {
      nextPageBtn.style.display = 'none';
      nextPageBtn.textContent = 'Next';
      nextPageBtn.classList.remove('unlocked');
    }
    if (playAgainBtn) playAgainBtn.style.display = 'none';
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
        if (resultTextEl) resultTextEl.textContent = `🎉 Sister Wins! You beat the AI brother! 🎉`;
        // Show next page button after sister wins
        setTimeout(() => {
          if (nextPageBtn) {
            nextPageBtn.style.display = 'block';
            nextPageBtn.textContent = '🎉 Next Page Unlocked! 🎉';
            nextPageBtn.classList.add('unlocked');
          }
          if (playAgainBtn) playAgainBtn.style.display = 'block';
        }, 1500);
      } else {
        if (resultTextEl) resultTextEl.textContent = `😤 Brother Wins! Try again, Sister! 😤`;
        // Show play again button when brother wins
        setTimeout(() => {
          if (playAgainBtn) playAgainBtn.style.display = 'block';
        }, 1000);
      }
      if (gameResultEl) gameResultEl.style.display = 'block';
      return;
    }
    
    if (checkDraw()) {
      gameActive = false;
      if (resultTextEl) resultTextEl.textContent = "🤝 It's a Draw! 🤝";
      if (gameResultEl) gameResultEl.style.display = 'block';
      // Show play again button on draw
      setTimeout(() => {
        if (playAgainBtn) playAgainBtn.style.display = 'block';
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
          if (resultTextEl) resultTextEl.textContent = `😤 Brother Wins! Try again, Sister! 😤`;
          if (gameResultEl) gameResultEl.style.display = 'block';
          // Show play again button when brother wins
          setTimeout(() => {
            if (playAgainBtn) playAgainBtn.style.display = 'block';
          }, 1000);
          isAIPlaying = false;
          return;
        }
        
        if (checkDraw()) {
          gameActive = false;
          if (resultTextEl) resultTextEl.textContent = "🤝 It's a Draw! 🤝";
          if (gameResultEl) gameResultEl.style.display = 'block';
          // Show play again button on draw
          setTimeout(() => {
            if (playAgainBtn) playAgainBtn.style.display = 'block';
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

  // Game event listeners
  if (gameBoardEl) {
    gameBoardEl.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (cell) {
        const index = parseInt(cell.dataset.index);
        makeMove(index);
      }
    });
  }
  
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', startNewGame);
  }

  // Confetti
  const confettiPieces = [];
  function rand(a,b){ return Math.random()*(b-a)+a; }
  function createConfetti(n){
    for (let i=0;i<n;i++) {
      confettiPieces.push({
        x: rand(0, confettiCanvas.width),
        y: confettiCanvas.height + rand(0, 60),
        r: rand(2, 4),
        color: `hsl(${rand(330, 390)}, 90%, ${rand(50, 70)}%)`,
        vy: rand(-6, -3),
        vx: rand(-1.5, 1.5),
        rot: rand(0, Math.PI*2),
        vr: rand(-0.2, 0.2)
      });
    }
  }
  function drawConfetti(){
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    for (const p of confettiPieces) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.rot += p.vr;
    }
    for (let i=confettiPieces.length-1; i>=0; i--) {
      if (confettiPieces[i].y > confettiCanvas.height + 20) confettiPieces.splice(i,1);
    }
  }
  let rafId = null;
  function loop(){
    drawConfetti();
    rafId = requestAnimationFrame(loop);
  }
  loop();
  function burstConfetti(){
    createConfetti(160);
  }

  // Initialize page navigation
  showPage(1);
  
  // Initialize game when page 2 is shown
  function initializeGame() {
    if (currentPage === 2) {
      startNewGame();
    }
  }
  
  // Override showPage to initialize game
  const originalShowPage = showPage;
  showPage = function(pageNumber) {
    originalShowPage(pageNumber);
    if (pageNumber === 2) {
      setTimeout(initializeGame, 100);
    }
  };
})();
