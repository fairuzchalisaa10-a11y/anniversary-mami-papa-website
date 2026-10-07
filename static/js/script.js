// ===== GLOBAL STATE =====
let currentStage = 1;
const stages = ['stage-1', 'stage-2', 'stage-3', 'stage-4', 'stage-final'];
let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== CANVAS SETUP =====
let introCanvas, petal2Canvas, petal3Canvas, gardenCanvas, petal4Canvas;

function setupCanvases() {
  introCanvas = document.getElementById('rose-canvas-intro');
  petal2Canvas = document.getElementById('petals-canvas-2');
  petal3Canvas = document.getElementById('petals-canvas-3');
  gardenCanvas = document.getElementById('rose-canvas-garden');
  petal4Canvas = document.getElementById('petals-canvas-4');

  [introCanvas, petal2Canvas, petal3Canvas, gardenCanvas, petal4Canvas].forEach(canvas => {
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
}

window.addEventListener('resize', () => {
  setupCanvases();
});

// ===== ROSE INTRO ANIMATION (STAGE 1) =====
class RoseIntro {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.roses = [];
    this.particles = [];
    this.animationProgress = 0;
    this.startAnimation();
  }

  startAnimation() {
    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (this.animationProgress < 1) {
      this.animationProgress += 0.003;
    }

    // Phase 1: First rose
    if (this.animationProgress > 0.1) {
      if (this.roses.length === 0) {
        this.roses.push(this.createRose(this.canvas.width / 2, this.canvas.height));
      }
      this.drawRose(this.roses[0], this.animationProgress);
    }

    // Phase 2: Additional roses
    if (this.animationProgress > 0.4 && this.roses.length < 3) {
      this.roses.push(this.createRose(
        this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        this.canvas.height
      ));
    }

    // Phase 3: Floating particles
    if (this.animationProgress > 0.5) {
      if (this.particles.length < 15) {
        this.particles.push(this.createParticle());
      }
      this.drawParticles();
    }

    requestAnimationFrame(() => this.animate());
  }

  createRose(x, y) {
    return {
      x,
      y,
      height: 200,
      bloomProgress: 0
    };
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      vy: Math.random() * 0.5 + 0.2
    };
  }

  drawRose(rose, progress) {
    rose.bloomProgress = Math.min(progress * 2, 1);
    
    const ctx = this.ctx;
    const centerX = rose.x;
    const centerY = rose.y - rose.height * rose.bloomProgress;

    // Stem
    ctx.strokeStyle = 'rgba(45, 80, 22, 0.7)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, rose.y);
    ctx.quadraticCurveTo(centerX + 10, rose.y - 50, centerX, centerY);
    ctx.stroke();

    // Rose bloom
    const bloomRadius = 25 * rose.bloomProgress;
    this.drawBloom(centerX, centerY, bloomRadius);
  }

  drawBloom(x, y, radius) {
    const ctx = this.ctx;
    
    // Outer petals
    ctx.fillStyle = 'rgba(158, 38, 56, 0.9)';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius * 0.8;
      ctx.beginPath();
      ctx.ellipse(px, py, radius * 0.6, radius * 0.8, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center
    ctx.fillStyle = 'rgba(184, 30, 58, 1)';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawParticles() {
    const ctx = this.ctx;
    
    this.particles.forEach(p => {
      p.y += p.vy;
      p.opacity = Math.max(0, p.opacity - 0.005);
      
      ctx.fillStyle = `rgba(200, 107, 120, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    this.particles = this.particles.filter(p => p.opacity > 0.01);
  }
}

// ===== TEDDY BEAR PETALS (STAGE 2) =====
class PetalSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.isRunning = false;
    this.maxPetals = window.innerWidth > 768 ? 20 : 10;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.petals.length < this.maxPetals && Math.random() > 0.7) {
      this.petals.push(this.createPetal());
    }

    this.petals.forEach(petal => {
      petal.y += petal.vy;
      petal.x += Math.sin(petal.y * 0.01) * 0.5;
      petal.rotation += petal.rotationSpeed;
      petal.opacity = Math.max(0, petal.opacity - 0.005);

      this.drawPetal(petal);
    });

    this.petals = this.petals.filter(p => p.opacity > 0 && p.y < this.canvas.height);

    requestAnimationFrame(() => this.animate());
  }

  createPetal() {
    return {
      x: Math.random() * this.canvas.width,
      y: -10,
      size: Math.random() * 8 + 4,
      vy: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
  }

  drawPetal(petal) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.fillStyle = `rgba(158, 38, 56, ${petal.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size, petal.size * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ===== ROSE GARDEN (STAGE 4) =====
class RoseGarden {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.roses = [];
    this.particles = [];
    this.animationProgress = 0;
    this.isRunning = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.animationProgress < 1) {
      this.animationProgress += 0.005;
    }

    // Phase 1-3: Roses growing from bottom
    if (this.animationProgress > 0.1) {
      const targetRoseCount = Math.floor(this.animationProgress * 80);
      while (this.roses.length < targetRoseCount && this.roses.length < 80) {
        this.roses.push(this.createRose());
      }
    }

    // Draw roses with depth layers
    const backgroundRoses = this.roses.slice(0, Math.floor(this.roses.length * 0.3));
    const midgroundRoses = this.roses.slice(Math.floor(this.roses.length * 0.3), Math.floor(this.roses.length * 0.65));
    const foregroundRoses = this.roses.slice(Math.floor(this.roses.length * 0.65));

    // Background (smaller, blurred)
    backgroundRoses.forEach(rose => this.drawRose(rose, 0.3, 0.4));
    
    // Midground
    midgroundRoses.forEach(rose => this.drawRose(rose, 0.6, 0.7));
    
    // Foreground (larger)
    foregroundRoses.forEach(rose => this.drawRose(rose, 1, 1));

    requestAnimationFrame(() => this.animate());
  }

  createRose() {
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height * (0.6 + Math.random() * 0.4),
      size: Math.random() * 15 + 10,
      bloomProgress: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * Math.PI * 2
    };
  }

  drawRose(rose, scale, opacity) {
    const ctx = this.ctx;
    const size = rose.size * scale;
    
    ctx.globalAlpha = opacity * 0.8;
    
    // Stem
    ctx.strokeStyle = 'rgba(45, 80, 22, 0.6)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(rose.x, rose.y);
    ctx.quadraticCurveTo(rose.x + 5, rose.y - 30, rose.x, rose.y - 50);
    ctx.stroke();

    // Bloom
    ctx.fillStyle = `rgba(158, 38, 56, ${opacity})`;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + rose.rotation;
      const px = rose.x + Math.cos(angle) * size * 0.6;
      const py = rose.y - 50 + Math.sin(angle) * size * 0.5;
      ctx.beginPath();
      ctx.ellipse(px, py, size * 0.4, size * 0.6, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center
    ctx.fillStyle = `rgba(184, 30, 58, ${opacity})`;
    ctx.beginPath();
    ctx.arc(rose.x, rose.y - 50, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}

// ===== FALLING PETALS (STAGE 4) =====
class FallingPetals {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.isRunning = false;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.petals.length < 50 && Math.random() > 0.85) {
      this.petals.push(this.createPetal());
    }

    this.petals.forEach(petal => {
      petal.y += petal.vy;
      petal.x += Math.sin(petal.y * 0.005) * petal.vx;
      petal.rotation += petal.rotationSpeed;
      petal.opacity = Math.max(0, petal.opacity - 0.003);

      this.drawPetal(petal);
    });

    this.petals = this.petals.filter(p => p.opacity > 0);

    requestAnimationFrame(() => this.animate());
  }

  createPetal() {
    return {
      x: Math.random() * this.canvas.width,
      y: -20,
      size: Math.random() * 10 + 5,
      vy: Math.random() * 1 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15
    };
  }

  drawPetal(petal) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.fillStyle = `rgba(232, 183, 190, ${petal.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size, petal.size * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ===== STAGE NAVIGATION =====
function nextStage() {
  const current = document.getElementById(stages[currentStage - 1]);
  
  if (currentStage === 1) {
    current.classList.add('fade-out');
    setTimeout(() => {
      current.classList.remove('active');
      current.style.display = 'none';
      showStage(2);
    }, 300);
  } else if (currentStage === 2) {
    current.classList.add('fade-out');
    setTimeout(() => {
      current.classList.remove('active');
      current.style.display = 'none';
      showStage(3);
    }, 300);
  } else if (currentStage === 3) {
    current.classList.add('fade-out');
    setTimeout(() => {
      current.classList.remove('active');
      current.style.display = 'none';
      showStage(4);
    }, 300);
  }
}

function showStage(stageNum) {
  currentStage = stageNum;
  const stage = document.getElementById(stages[stageNum - 1]);
  stage.style.display = 'flex';
  
  setTimeout(() => {
    stage.classList.add('active');
  }, 10);

  if (stageNum === 1 && introCanvas) {
    new RoseIntro(introCanvas);
  } else if (stageNum === 2) {
    if (petal2Canvas) {
      const petalSystem2 = new PetalSystem(petal2Canvas);
      petalSystem2.start();
    }
  } else if (stageNum === 3) {
    if (petal3Canvas) {
      const petalSystem3 = new PetalSystem(petal3Canvas);
      petalSystem3.start();
    }
  } else if (stageNum === 4) {
    if (gardenCanvas) {
      const garden = new RoseGarden(gardenCanvas);
      garden.start();
    }
    if (petal4Canvas) {
      const fallingPetals = new FallingPetals(petal4Canvas);
      setTimeout(() => {
        fallingPetals.start();
      }, 1500);
    }
  }
}

function closeGarden() {
  const stage4 = document.getElementById('stage-4');
  stage4.classList.add('fade-out');
  
  setTimeout(() => {
    stage4.classList.remove('active');
    stage4.style.display = 'none';
    showStage(5);
  }, 500);
}

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
  setupCanvases();
  showStage(1);
});
