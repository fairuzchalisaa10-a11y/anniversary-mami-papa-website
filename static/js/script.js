// ===== STATE & CONFIG =====
const stages = [
  document.getElementById('stage-1'),
  document.getElementById('stage-2'),
  document.getElementById('stage-3'),
  document.getElementById('stage-4'),
  document.getElementById('stage-final')
];

let currentStageIndex = 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let canvases = {};
let animationSystems = {};

// ===== INIT CANVASES =====
function initCanvases() {
  const canvasIds = ['rose-intro-canvas', 'petals-stage-2', 'petals-stage-3', 'rose-garden-canvas', 'petals-stage-4'];
  canvasIds.forEach(id => {
    const canvas = document.getElementById(id);
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvases[id] = canvas;
    }
  });
}

window.addEventListener('resize', () => {
  Object.keys(canvases).forEach(id => {
    const canvas = canvases[id];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

// ===== ROSE INTRO ANIMATION (STAGE 1) =====
class RoseIntroAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.maxTime = 3.5;
    this.roses = [];
    this.particles = [];
    this.animate();
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.016;
    const progress = Math.min(this.time / this.maxTime, 1);

    // Phase 1: First rose appears and grows
    if (progress > 0.08) {
      if (this.roses.length === 0) {
        this.roses.push({
          x: this.canvas.width / 2,
          y: this.canvas.height,
          progress: 0,
          bloomProgress: 0
        });
      }
    }

    // Phase 2: Additional roses
    if (progress > 0.35 && this.roses.length < 3) {
      this.roses.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 240,
        y: this.canvas.height,
        progress: 0,
        bloomProgress: 0
      });
    }

    // Phase 3: Floating particles
    if (progress > 0.45) {
      const particleCount = Math.floor(progress * 30);
      while (this.particles.length < particleCount && this.particles.length < 30) {
        this.particles.push(this.createParticle());
      }
    }

    // Update and draw roses
    this.roses.forEach((rose, idx) => {
      const rosePhaseStart = 0.08 + idx * 0.15;
      if (progress >= rosePhaseStart) {
        rose.progress = Math.min((progress - rosePhaseStart) / 0.3, 1);
        rose.bloomProgress = Math.max(0, (progress - rosePhaseStart - 0.15) / 0.25);
        this.drawRose(rose);
      }
    });

    // Draw particles
    this.drawParticles();

    requestAnimationFrame(this.animate);
  };

  drawRose(rose) {
    const ctx = this.ctx;
    const centerX = rose.x;
    const targetY = this.canvas.height * 0.65;
    const currentY = this.canvas.height - (this.canvas.height - targetY) * rose.progress;

    // Stem
    ctx.strokeStyle = 'rgba(45, 80, 22, 0.8)';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, this.canvas.height);
    ctx.quadraticCurveTo(centerX + 12, currentY + 100, centerX, currentY);
    ctx.stroke();

    // Bloom petals
    const bloomRadius = 28 * rose.bloomProgress;
    ctx.fillStyle = `rgba(158, 38, 56, ${0.7 + rose.bloomProgress * 0.3})`;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = centerX + Math.cos(angle) * bloomRadius * 1.2;
      const py = currentY + Math.sin(angle) * bloomRadius;
      
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, 0, bloomRadius * 0.7, bloomRadius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Center
    ctx.fillStyle = `rgba(184, 30, 58, ${0.8 + rose.bloomProgress * 0.2})`;
    ctx.beginPath();
    ctx.arc(centerX, currentY, bloomRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height * 0.7,
      size: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      vy: Math.random() * 0.3 + 0.1,
      vx: (Math.random() - 0.5) * 0.2
    };
  }

  drawParticles() {
    const ctx = this.ctx;
    this.particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.opacity = Math.max(0, p.opacity - 0.003);
      
      ctx.fillStyle = `rgba(200, 107, 120, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    this.particles = this.particles.filter(p => p.opacity > 0.01);
  }
}

// ===== PETAL SYSTEM (STAGES 2 & 3) =====
class PetalSystem {
  constructor(canvas, petalCount = 22) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.petalCount = petalCount;
    this.isRunning = true;
    this.animate();
  }

  animate = () => {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.petals.length < this.petalCount && Math.random() > 0.65) {
      this.petals.push(this.createPetal());
    }

    this.petals.forEach(petal => {
      petal.y += petal.vy;
      petal.x += Math.sin(petal.y * 0.008) * petal.drift;
      petal.rotation += petal.rotationSpeed;
      petal.opacity = Math.max(0, petal.opacity - 0.004);
      petal.scale = Math.sin(petal.lifespan) * 0.5 + 0.75;

      this.drawPetal(petal);
    });

    this.petals = this.petals.filter(p => p.opacity > 0 && p.y < this.canvas.height);
    requestAnimationFrame(this.animate);
  };

  createPetal() {
    return {
      x: Math.random() * this.canvas.width,
      y: -20,
      size: Math.random() * 10 + 5,
      vy: Math.random() * 1.8 + 0.6,
      drift: Math.random() * 0.8 + 0.4,
      opacity: Math.random() * 0.8 + 0.3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.12,
      lifespan: Math.random() * Math.PI,
      scale: 1
    };
  }

  drawPetal(petal) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.globalAlpha = petal.opacity;
    ctx.scale(petal.scale, petal.scale);
    
    ctx.fillStyle = `rgba(158, 38, 56, 0.9)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size * 0.8, petal.size * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  stop() {
    this.isRunning = false;
  }
}

// ===== ROSE GARDEN (STAGE 4) =====
class RoseGarden {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.roses = [];
    this.time = 0;
    this.isRunning = true;
    this.populateGarden();
    this.animate();
  }

  populateGarden() {
    const gardenSize = Math.min(120, Math.max(45, Math.floor(window.innerWidth / 20)));
    for (let i = 0; i < gardenSize; i++) {
      this.roses.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height * (0.55 + Math.random() * 0.4),
        size: Math.random() * 20 + 8,
        opacity: 0.15 + Math.random() * 0.65,
        rotation: Math.random() * Math.PI * 2,
        depth: Math.random(),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01
      });
    }
  }

  animate = () => {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.016;

    // Draw by depth layer
    const background = this.roses.filter(r => r.depth < 0.33);
    const midground = this.roses.filter(r => r.depth >= 0.33 && r.depth < 0.67);
    const foreground = this.roses.filter(r => r.depth >= 0.67);

    background.forEach(rose => this.drawRose(rose, 0.35));
    midground.forEach(rose => this.drawRose(rose, 0.68));
    foreground.forEach(rose => this.drawRose(rose, 1));

    requestAnimationFrame(this.animate);
  };

  drawRose(rose, depthScale) {
    const ctx = this.ctx;
    const size = rose.size * depthScale;
    
    rose.wobble += rose.wobbleSpeed;
    const wobbleOffset = Math.sin(rose.wobble) * 2 * depthScale;

    ctx.save();
    ctx.globalAlpha = rose.opacity * (0.4 + depthScale * 0.6);
    ctx.translate(rose.x + wobbleOffset, rose.y);

    // Stem with slight curve
    ctx.strokeStyle = `rgba(45, 80, 22, ${0.5 + depthScale * 0.5})`;
    ctx.lineWidth = 2.5 * depthScale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(6 * depthScale, -28, 0, -55);
    ctx.stroke();

    // Rose bloom
    ctx.fillStyle = `rgba(158, 38, 56, ${0.8 * depthScale})`;
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2 + rose.rotation;
      const px = Math.cos(angle) * size * 0.7;
      const py = -55 + Math.sin(angle) * size * 0.65;
      
      ctx.beginPath();
      ctx.ellipse(px, py, size * 0.45, size * 0.75, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center bud
    ctx.fillStyle = `rgba(184, 30, 58, ${0.9 * depthScale})`;
    ctx.beginPath();
    ctx.arc(0, -55, size * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  stop() {
    this.isRunning = false;
  }
}

// ===== FALLING PETALS (STAGE 4) =====
class FallingPetals {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.petals = [];
    this.isRunning = true;
    this.time = 0;
    this.animate();
  }

  animate = () => {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.time += 0.016;

    if (this.petals.length < 70 && Math.random() > 0.88) {
      this.petals.push(this.createPetal());
    }

    this.petals.forEach(petal => {
      petal.y += petal.vy;
      petal.x += Math.sin(petal.y * 0.006) * petal.vx;
      petal.rotation += petal.rotationSpeed;
      petal.opacity = Math.max(0, petal.opacity - 0.002);

      this.drawPetal(petal);
    });

    this.petals = this.petals.filter(p => p.opacity > 0);
    requestAnimationFrame(this.animate);
  };

  createPetal() {
    return {
      x: Math.random() * this.canvas.width,
      y: -30,
      size: Math.random() * 12 + 6,
      vy: Math.random() * 1.2 + 0.8,
      vx: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.7 + 0.4,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.16
    };
  }

  drawPetal(petal) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.fillStyle = `rgba(232, 183, 190, ${petal.opacity})`;
    ctx.globalAlpha = petal.opacity;
    
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size, petal.size * 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  stop() {
    this.isRunning = false;
  }
}

// ===== STAGE NAVIGATION =====
function showStage(index) {
  // Fade out current stage
  if (currentStageIndex !== index) {
    stages[currentStageIndex].classList.remove('active');
    stages[currentStageIndex].classList.add('fade-out');
    
    setTimeout(() => {
      stages[currentStageIndex].classList.remove('fade-out');
      stages[index].classList.add('active');
    }, 600);
  }

  currentStageIndex = index;

  // Initialize animations for each stage
  setTimeout(() => {
    if (index === 0) {
      const canvas = canvases['rose-intro-canvas'];
      if (canvas && !animationSystems['intro']) {
        animationSystems['intro'] = new RoseIntroAnimation(canvas);
      }
    } else if (index === 1) {
      const canvas = canvases['petals-stage-2'];
      if (canvas && !animationSystems['petals2']) {
        animationSystems['petals2'] = new PetalSystem(canvas, 20);
      }
    } else if (index === 2) {
      const canvas = canvases['petals-stage-3'];
      if (canvas && !animationSystems['petals3']) {
        animationSystems['petals3'] = new PetalSystem(canvas, 20);
      }
    } else if (index === 3) {
      const gardenCanvas = canvases['rose-garden-canvas'];
      const petalsCanvas = canvases['petals-stage-4'];
      
      if (gardenCanvas && !animationSystems['garden']) {
        animationSystems['garden'] = new RoseGarden(gardenCanvas);
      }
      
      if (petalsCanvas && !animationSystems['petals4']) {
        setTimeout(() => {
          animationSystems['petals4'] = new FallingPetals(petalsCanvas);
        }, 1500);
      }
    }
  }, 100);
}

function advanceStage() {
  if (currentStageIndex < stages.length - 1) {
    showStage(currentStageIndex + 1);
  }
}

function closeGarden() {
  if (animationSystems['garden']) animationSystems['garden'].stop();
  if (animationSystems['petals4']) animationSystems['petals4'].stop();
  showStage(4);
}

// ===== INITIALIZE ON LOAD =====
window.addEventListener('DOMContentLoaded', () => {
  initCanvases();
  showStage(0);
});
