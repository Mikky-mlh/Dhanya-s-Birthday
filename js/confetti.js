const confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    lastTime: 0,

    // Enhanced shapes and colors
    shapes: ['🎉', '🎊', '💖', '✨', '⭐', '🌟', '💫', '🎀', '🌸', '🎂', '🍰', '🧁', '💝', '🦋', '🌺'],
    colors: ['#FF6B9D', '#FF8FAB', '#FFD93D', '#4ECDC4', '#A8E6CF', '#FFB6C1', '#DDA0DD', '#87CEEB', '#FFB347', '#FF69B4'],

    init: () => {
        confetti.canvas = document.getElementById('confetti-canvas');
        if (!confetti.canvas) return;

        confetti.ctx = confetti.canvas.getContext('2d', { alpha: true });
        confetti.resize();

        window.addEventListener('resize', confetti.resize);
    },

    resize: () => {
        if (!confetti.canvas) return;
        confetti.canvas.width = window.innerWidth;
        confetti.canvas.height = window.innerHeight;
    },

    burst: (x = null, y = null) => {
        const centerX = x !== null ? x : window.innerWidth / 2;
        const centerY = y !== null ? y : window.innerHeight / 2;

        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 50 : 80;
        
        // Create emoji particles
        for (let i = 0; i < particleCount * 0.6; i++) {
            const angle = (Math.PI * 2 * i) / (particleCount * 0.6);
            const velocity = 5 + Math.random() * 8;
            
            confetti.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 3,
                vy: Math.sin(angle) * velocity - 5 + (Math.random() - 0.5) * 3,
                
                type: 'emoji',
                text: confetti.shapes[Math.floor(Math.random() * confetti.shapes.length)],
                size: isMobile ? 18 : 28,
                
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                gravity: 0.12,
                drag: 0.98,
                life: 1.0,
                decay: Math.random() * 0.003 + 0.004
            });
        }
        
        // Create geometric confetti
        for (let i = 0; i < particleCount * 0.4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 6 + Math.random() * 10;
            
            confetti.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity + (Math.random() - 0.5) * 4,
                vy: Math.sin(angle) * velocity - 6,
                
                type: 'rect',
                color: confetti.colors[Math.floor(Math.random() * confetti.colors.length)],
                width: Math.random() * 10 + 5,
                height: Math.random() * 6 + 3,
                
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                gravity: 0.15,
                drag: 0.97,
                life: 1.0,
                decay: Math.random() * 0.004 + 0.005,
                wobble: Math.random() * 10,
                wobbleSpeed: Math.random() * 0.1 + 0.05
            });
        }

        // Play celebration sound
        confetti.playSound();

        if (!confetti.animationId) {
            confetti.lastTime = performance.now();
            confetti.animate();
        }
    },

    // Continuous confetti rain effect
    rain: (duration = 5000) => {
        const isMobile = window.innerWidth < 768;
        const particlesPerFrame = isMobile ? 2 : 4;
        const startTime = Date.now();
        
        const rainInterval = setInterval(() => {
            if (Date.now() - startTime > duration) {
                clearInterval(rainInterval);
                return;
            }
            
            for (let i = 0; i < particlesPerFrame; i++) {
                const x = Math.random() * window.innerWidth;
                
                confetti.particles.push({
                    x: x,
                    y: -20,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 2 + 1,
                    
                    type: Math.random() > 0.5 ? 'emoji' : 'rect',
                    text: confetti.shapes[Math.floor(Math.random() * confetti.shapes.length)],
                    color: confetti.colors[Math.floor(Math.random() * confetti.colors.length)],
                    size: 20 + Math.random() * 10,
                    width: Math.random() * 8 + 4,
                    height: Math.random() * 5 + 2,
                    
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    gravity: 0.05,
                    drag: 0.99,
                    life: 1.0,
                    decay: 0.002,
                    wobble: Math.random() * 10,
                    wobbleSpeed: Math.random() * 0.05 + 0.02
                });
            }
            
            if (!confetti.animationId) {
                confetti.lastTime = performance.now();
                confetti.animate();
            }
        }, 50);
    },

    animate: (currentTime) => {
        if (!confetti.ctx || !confetti.canvas) return;

        const deltaTime = (currentTime - confetti.lastTime) / 16.66;
        confetti.lastTime = currentTime;

        confetti.ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);

        for (let i = confetti.particles.length - 1; i >= 0; i--) {
            const p = confetti.particles[i];

            p.life -= p.decay * (deltaTime || 1);

            if (p.life <= 0 || p.y > confetti.canvas.height + 50) {
                confetti.particles.splice(i, 1);
                continue;
            }

            // Physics update
            p.x += p.vx * (deltaTime || 1);
            p.y += p.vy * (deltaTime || 1);
            p.vy += p.gravity * (deltaTime || 1);
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.rotation += p.rotationSpeed * (deltaTime || 1);
            
            // Wobble effect for rectangles
            if (p.wobble !== undefined) {
                p.wobble += p.wobbleSpeed * (deltaTime || 1);
                p.x += Math.sin(p.wobble) * 0.5;
            }

            confetti.ctx.save();
            confetti.ctx.globalAlpha = p.life;
            confetti.ctx.translate(p.x, p.y);
            confetti.ctx.rotate(p.rotation);
            
            if (p.type === 'emoji') {
                confetti.ctx.font = `${p.size}px serif`;
                confetti.ctx.textAlign = 'center';
                confetti.ctx.textBaseline = 'middle';
                confetti.ctx.fillText(p.text, 0, 0);
            } else if (p.type === 'rect') {
                confetti.ctx.fillStyle = p.color;
                confetti.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            }
            
            confetti.ctx.restore();
        }

        if (confetti.particles.length > 0) {
            confetti.animationId = requestAnimationFrame(confetti.animate);
        } else {
            confetti.animationId = null;
        }
    },
    
    playSound: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a celebratory sound
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + i * 0.05;
                gainNode.gain.setValueAtTime(0.08, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.3);
            });
        } catch (e) {
            // Audio context not supported
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', confetti.init);
} else {
    confetti.init();
}
