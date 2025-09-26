
 const selected = document.getElementById('selectedOption');
  const options = document.getElementById('optionsList');
  const hiddenInput = document.getElementById('level');

  selected.addEventListener('click', () => {
    options.classList.toggle('show');
  });

  document.querySelectorAll('.custom-option').forEach(option => {
    option.addEventListener('click', () => {
      const value = option.getAttribute('data-value');
      selected.textContent = option.textContent;
      hiddenInput.value = value;
      options.classList.remove('show');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      options.classList.remove('show');
    }
  });
window.addEventListener('load', () => {
   
  document.getElementById("main-heading").style.display = "block";
  hiddenInput.value = 'easy';
  selected.textContent = 'Easy';


  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gridSize = 20;
  const canvasSize = canvas.width;
  let snake, direction, food, score, interval, speed, specialFood, bugCounter;
  let specialTimer, specialTimeLeft = 0;
  let isPaused = false;
  let isDying = false;
  let isGameOver = false;
  let deathStartTime = 0;
  let gameOverPending = false;

  function startGame() {
  document.getElementById("snake-wrapper").classList.remove("start-mode");
   document.getElementById("main-heading").style.display = "none";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("start-footer").style.display = "none";
  document.getElementById("game-screen").style.display = "flex";
  document.getElementById("snake-wrapper").classList.remove("start-mode");
  document.querySelector(".account-head").style.display = "none";

  const level = document.getElementById("level").value;
  speed = level === 'easy' ? 350 : level === 'medium' ? 250 : 200;
  score = 0;
  bugCounter = 0;

  
  clearInterval(specialTimer);
  specialFood = null;
  specialTimeLeft = 0;
  document.getElementById("special-bug").innerText = "";

  snake = [
  { x: 7, y: 5 }, 
  { x: 7, y: 4 },
  { x: 7, y: 3 }
];

  direction = 'down';
  food = randomPosition();

  updateScore();
  document.getElementById("pauseBtn").innerText = "Pause";
  isPaused = false;

  showKeyboardHint();
  clearInterval(interval);
  interval = setInterval(update, speed);
  requestAnimationFrame(drawLoop);
}

  function update() {
    if (isPaused) return;

    const head = { ...snake[0] };
    if (direction === 'up') head.y--;
    if (direction === 'down') head.y++;
    if (direction === 'left') head.x--;
    if (direction === 'right') head.x++;

    if (head.x < 0 || head.x >= canvasSize / gridSize || head.y < 0 || head.y >= canvasSize / gridSize || snake.some(p => p.x === head.x && p.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      bugCounter++;
      food = randomPosition();
      if (bugCounter % 5 === 0) spawnSpecialFood();
    } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
      score += 5;
      specialFood = null;
      document.getElementById("special-bug").innerText = "";
      clearInterval(specialTimer);
      if (speed > 100) {
        speed -= 20;
        clearInterval(interval);
        interval = setInterval(update, speed);
      }
    } else {
      snake.pop();
    }

    updateScore();
  }

  function drawLoop() {
    draw();
    requestAnimationFrame(drawLoop);
  }

function draw() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  
  const pulse = 2 * Math.sin(Date.now() / 200) + 8;
  const gradient = ctx.createRadialGradient(
    food.x * gridSize + 10, food.y * gridSize + 10, 2,
    food.x * gridSize + 10, food.y * gridSize + 10, pulse
  );
  gradient.addColorStop(0, "#ff0080");
  gradient.addColorStop(1, "#ffff00");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(food.x * gridSize + 10, food.y * gridSize + 10, pulse, 0, Math.PI * 2);
  ctx.fill();

  
  if (specialFood) {
    const pulseSpecial = 3 * Math.sin(Date.now() / 200) + 12;
    const gradientSpecial = ctx.createRadialGradient(
      specialFood.x * gridSize + 10, specialFood.y * gridSize + 10, 2,
      specialFood.x * gridSize + 10, specialFood.y * gridSize + 10, pulseSpecial
    );
    gradientSpecial.addColorStop(0, "#00f0ff");
    gradientSpecial.addColorStop(1, "#0000ff");

    ctx.fillStyle = gradientSpecial;
    ctx.beginPath();
    ctx.arc(specialFood.x * gridSize + 10, specialFood.y * gridSize + 10, pulseSpecial, 0, Math.PI * 2);
    ctx.fill();
  }


if (snake.length > 1) {
  const head = snake[0];
  const neck = snake[1];

  const headX = head.x * gridSize + gridSize / 2;
  const headY = head.y * gridSize + gridSize / 2;
  const neckX = neck.x * gridSize + gridSize / 2;
  const neckY = neck.y * gridSize + gridSize / 2;

  const midX = (headX + neckX) / 2;
  const midY = (headY + neckY) / 2;

  const dx = neckX - headX;
  const dy = neckY - headY;

  ctx.fillStyle = "red";
  if (dx !== 0) {
    ctx.fillRect(
      Math.min(headX, neckX),
      headY - gridSize / 2,
      Math.abs(dx),
      gridSize
    );
  } else if (dy !== 0) {
    ctx.fillRect(
      headX - gridSize / 2,
      Math.min(headY, neckY),
      gridSize,
      Math.abs(dy)
    );
  }
}



  
 snake.forEach((segment, i) => {
  const x = segment.x * gridSize;
  const y = segment.y * gridSize;

  if (i === 0) {
    drawPentagonHead(segment.x, segment.y);
  } else if (i === snake.length - 1 && snake.length > 1) {
    const prev = snake[i - 1];
    drawTailTriangle(segment, prev);
  } else {

    ctx.fillStyle = "red";
    ctx.fillRect(x, y, gridSize, gridSize);

  
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
});

  
if (isDying) {
  const elapsed = (Date.now() - deathStartTime) / 1000;

  const head = snake[0];
  const cx = head.x * gridSize + gridSize / 2;
  const cy = head.y * gridSize + gridSize / 2;

  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    const alpha = Math.random() * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, Math.random() * 2 + 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`; 
    ctx.fill();
  }

  if (elapsed >= 2) {
  isDying = false;
  showGameOverScreen();
}
}


}

 function drawPentagonHead(gridX, gridY) {
  const r = gridSize * 0.65;
  let cx = gridX * gridSize + gridSize / 2;
  let cy = gridY * gridSize + gridSize / 2;

  
  const offsetAmount = gridSize * 0.15;
  if (direction === "right") cx -= offsetAmount;
  if (direction === "left") cx += offsetAmount;
  if (direction === "down") cy -= offsetAmount;
  if (direction === "up") cy += offsetAmount;

  const rotationOffset = {
    "right": 0,
    "down": Math.PI / 2,
    "left": Math.PI,
    "up": -Math.PI / 2
  }[direction];

  
  ctx.fillStyle = "red";
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i / 5) + rotationOffset;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  
  const eyeRadius = 2 + Math.sin(Date.now() / 150) * 0.5; 

  let eyeOffsetX = 5;
  let eyeOffsetY = 5;

  let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

  switch (direction) {
    case "right":
      leftEyeX = cx + eyeOffsetX;
      rightEyeX = cx + eyeOffsetX;
      leftEyeY = cy - eyeOffsetY;
      rightEyeY = cy + eyeOffsetY;
      break;
    case "left":
      leftEyeX = cx - eyeOffsetX;
      rightEyeX = cx - eyeOffsetX;
      leftEyeY = cy - eyeOffsetY;
      rightEyeY = cy + eyeOffsetY;
      break;
    case "up":
      leftEyeX = cx - eyeOffsetX;
      rightEyeX = cx + eyeOffsetX;
      leftEyeY = cy - eyeOffsetY;
      rightEyeY = cy - eyeOffsetY;
      break;
    case "down":
      leftEyeX = cx - eyeOffsetX;
      rightEyeX = cx + eyeOffsetX;
      leftEyeY = cy + eyeOffsetY;
      rightEyeY = cy + eyeOffsetY;
      break;
  }

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(leftEyeX, leftEyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(rightEyeX, rightEyeY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();

  
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(leftEyeX, leftEyeY, eyeRadius / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(rightEyeX, rightEyeY, eyeRadius / 2, 0, Math.PI * 2);
  ctx.fill();
}
function drawTailTriangle(tail, beforeTail) {
  const tx = tail.x * gridSize;
  const ty = tail.y * gridSize;

  const cx = tx + gridSize / 2;
  const cy = ty + gridSize / 2;

  const dx = tail.x - beforeTail.x;
  const dy = tail.y - beforeTail.y;

  ctx.fillStyle = "red";
  ctx.beginPath();

  if (dx === 1) {
    
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx, ty + gridSize);
    ctx.lineTo(tx + gridSize, ty + gridSize / 2);
  } else if (dx === -1) {
    
    ctx.moveTo(tx + gridSize, ty);
    ctx.lineTo(tx + gridSize, ty + gridSize);
    ctx.lineTo(tx, ty + gridSize / 2);
  } else if (dy === 1) {
    
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + gridSize, ty);
    ctx.lineTo(tx + gridSize / 2, ty + gridSize);
  } else if (dy === -1) {
    
    ctx.moveTo(tx, ty + gridSize);
    ctx.lineTo(tx + gridSize, ty + gridSize);
    ctx.lineTo(tx + gridSize / 2, ty);
  }

  ctx.closePath();
  ctx.fill();
}



  function randomPosition() {
    let position;
    do {
      position = {
        x: Math.floor(Math.random() * canvasSize / gridSize),
        y: Math.floor(Math.random() * canvasSize / gridSize)
      };
    } while (snake.some(segment => segment.x === position.x && segment.y === position.y));
    return position;
  }

  function changeDirection(dir) {
     if (isPaused || isGameOver|| isDying) return;
    if (dir === 'up' && direction !== 'down') direction = 'up';
    else if (dir === 'down' && direction !== 'up') direction = 'down';
    else if (dir === 'left' && direction !== 'right') direction = 'left';
    else if (dir === 'right' && direction !== 'left') direction = 'right';
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') changeDirection('up');
    if (e.key === 'ArrowDown') changeDirection('down');
    if (e.key === 'ArrowLeft') changeDirection('left');
    if (e.key === 'ArrowRight') changeDirection('right');
  });

  window.addEventListener("keydown", function (e) {
  const keysToPrevent = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (keysToPrevent.includes(e.key)) {
    e.preventDefault();
  }
}, false);

  function updateScore() {
    document.getElementById("score").innerText = "Score: " + score;
  }

  function spawnSpecialFood() {
    specialFood = randomPosition();
    specialTimeLeft = 10;
    document.getElementById("special-bug").innerText = "Time Left: " + specialTimeLeft + "s";

    clearInterval(specialTimer);
    specialTimer = setInterval(() => {
      if (!isPaused) {
        specialTimeLeft--;
        document.getElementById("special-bug").innerText = "Time Left: " + specialTimeLeft + "s";
        if (specialTimeLeft <= 0) {
          specialFood = null;
          document.getElementById("special-bug").innerText = "";
          clearInterval(specialTimer);
        }
      }
    }, 1000);
  }

  function togglePause() {
    const btn = document.getElementById("pauseBtn");
    if (isPaused) {
      interval = setInterval(update, speed);
      isPaused = false;
      btn.innerText = "Pause";
    } else {
      clearInterval(interval);
      isPaused = true;
      btn.innerText = "Resume";
    }
  }

  function gameOver() {
  clearInterval(interval);
  clearInterval(specialTimer);
  isDying = true;
  deathStartTime = Date.now();
}
function showGameOverScreen() {
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("game-over-screen").style.display = "block";
  document.getElementById("final-score").innerText = "Final Score: " + score;

  const feedback = document.getElementById("feedback-message");
  if (score >= 30) feedback.innerText = "Excellent";
  else if (score >= 10) feedback.innerText = "Good";
  else feedback.innerText = "Try Again";
}

  
  function resetGame() {
  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
  document.getElementById("start-footer").style.display = "block";
  document.getElementById("main-heading").style.display = "block";
  document.getElementById("feedback-message").innerText = "";
  document.getElementById("snake-wrapper").classList.add("start-mode");
  document.getElementById("snake-wrapper").classList.add("start-mode");
  document.querySelector(".account-head").style.display = "block";

  
  clearInterval(specialTimer);
  specialFood = null;
  specialTimeLeft = 0;
  document.getElementById("special-bug").innerText = "";
}


 function showKeyboardHint() {
  const hint = document.getElementById("keyboard-hint");

  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) {
    hint.style.display = "block";
    setTimeout(() => {
      hint.style.display = "none";
    }, 5000);
  } else {
    hint.style.display = "none"; 
  }
} 
window.startGame = startGame;
window.togglePause = togglePause;
window.changeDirection = changeDirection;
window.resetGame = resetGame;
});
