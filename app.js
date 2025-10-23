(function () {
  const root = document.getElementById("app-root");
  const viewport = document.getElementById("app-viewport");
  const btnNext = document.getElementById("btnNext");
  const confettiCanvas = document.getElementById("confettiCanvas");
  let ctx = null;

  if (confettiCanvas) {
    ctx = confettiCanvas.getContext("2d");
  }

  const BASE_W = 393;
  const BASE_H = 852;

  function fit() {
    if (!root) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate scale to fit within viewport with padding
    const maxWidth = vw - 20; // 10px padding on each side
    const maxHeight = vh - 20; // 10px padding on top/bottom
    const scale = Math.min(maxWidth / BASE_W, maxHeight / BASE_H, 1);

    root.style.transform = `scale(${scale}) translateZ(0)`;
    root.style.marginLeft = "0";
    root.style.marginTop = "0";

    // canvas
    if (confettiCanvas) {
      confettiCanvas.width = vw * devicePixelRatio;
      confettiCanvas.height = vh * devicePixelRatio;
      confettiCanvas.style.width = vw + "px";
      confettiCanvas.style.height = vh + "px";
      if (ctx) {
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      }
    }
  }

  if (root) {
    window.addEventListener("resize", fit);
    fit();
  }

  // Optional wish card features (safe with optional chaining)
  const btnStart = document.getElementById("btnStart");
  const wishCard = document.getElementById("wishCard");
  const nameInput = document.getElementById("nameInput");

  btnStart?.addEventListener("click", () => {
    if (wishCard) wishCard.hidden = false;
    nameInput?.focus();
  });

  const btnShare = document.getElementById("btnShare");
  btnShare?.addEventListener("click", async () => {
    try {
      const text = "Happy Bhai Dooj! Sending love and blessings.";
      if (navigator.share) {
        await navigator.share({ title: "Bhai Dooj", text, url: location.href });
      } else {
        await navigator.clipboard.writeText(text + " " + location.href);
        toast("Link copied to clipboard");
      }
    } catch {}
  });

  const btnPreview = document.getElementById("btnPreview");
  const wishPreview = document.getElementById("wishPreview");
  btnPreview?.addEventListener("click", () => {
    const name = (nameInput?.value || "").trim();
    const msg = name
      ? `Happy Bhai Dooj, ${name}! May your life be filled with joy, health and success.`
      : "Wishing you joy, prosperity and endless smiles!";
    if (wishPreview) wishPreview.textContent = msg;
  });

  const btnConfetti = document.getElementById("btnConfetti");
  btnConfetti?.addEventListener("click", () => {
    burstConfetti();
  });

  // Navigation event listeners
  btnNext?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "page2.html";
  });

  // Back to game button for page3
  const backToGameBtn = document.getElementById("backToGame");
  backToGameBtn?.addEventListener("click", () => {
    window.location.href = "page2.html";
  });

  // Back to letter button for page4
  const backToLetterBtn = document.getElementById("backToLetter");
  backToLetterBtn?.addEventListener("click", () => {
    window.location.href = "page3.html";
  });

  // Next page button for page3 only (avoid conflict with game.js on page2)
  const nextPageBtn = document.getElementById("nextPage");
  if (nextPageBtn) {
    const currentPath = window.location.pathname;
    if (currentPath.includes("page3.html")) {
      nextPageBtn.addEventListener("click", () => {
        window.location.href = "page4.html";
      });
    }
    // For page2.html, game.js handles navigation after win
  }

  // Back to home buttons
  const backToHomeBtns = document.querySelectorAll("#backToHome, .backToHome");
  backToHomeBtns.forEach((btn) => {
    btn.addEventListener("click", () => (window.location.href = "index.html"));
  });

  // Tiny toast
  let toastTimer = null;
  function toast(text) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "24px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "10px 14px";
      el.style.background = "#111a";
      el.style.backdropFilter = "blur(6px)";
      el.style.color = "#fff";
      el.style.borderRadius = "12px";
      el.style.font = "600 13px Poppins, system-ui";
      el.style.zIndex = "1000";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.style.opacity = "0";
    }, 1800);
  }

  // Confetti (only if canvas exists)
  if (confettiCanvas && ctx) {
    const confettiPieces = [];
    function rand(a, b) {
      return Math.random() * (b - a) + a;
    }
    function createConfetti(n) {
      for (let i = 0; i < n; i++) {
        confettiPieces.push({
          x: rand(0, confettiCanvas.width),
          y: confettiCanvas.height + rand(0, 60),
          r: rand(2, 4),
          color: `hsl(${rand(330, 390)}, 90%, ${rand(50, 70)}%)`,
          vy: rand(-6, -3),
          vx: rand(-1.5, 1.5),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.2, 0.2),
        });
      }
    }
    function drawConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (const p of confettiPieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rot += p.vr;
      }
      for (let i = confettiPieces.length - 1; i >= 0; i--) {
        if (confettiPieces[i].y > confettiCanvas.height + 20)
          confettiPieces.splice(i, 1);
      }
    }
    let rafId = null;
    function loop() {
      drawConfetti();
      rafId = requestAnimationFrame(loop);
    }
    loop();
    function burstConfetti() {
      createConfetti(160);
    }
    window.burstConfetti = burstConfetti; // Expose if needed elsewhere
  }
})();
