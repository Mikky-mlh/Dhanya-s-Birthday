const confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    lastTime: 0,

    init: () => {
        confetti.canvas = document.getElementById('confetti-canvas');
        if (!confetti.canvas) return;

        // "alpha: true" helps performance on some browsers
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

        // Optimization: Keep count reasonable so it doesn't lag
        // 35 roses for mobile, 60 for desktop is plenty
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 35 : 60;
        
        for (let i = 0; i < particleCount; i++) {
            // Spread them out more in a "fountain" arc
            const angle = (Math.PI * 2 * i) / particleCount;
            
            // PHYSICS TWEAK: Lower velocity for a softer start
            const velocity = 4 + Math.random() * 6; 
            
            confetti.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 3, // Gentle upward toss
                // Visuals
                text: '🌹',
                size: isMobile ? 15 : 24, // Bigger size because roses need detail
                
                // Physics for "Floating" feel
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05, // Slow rotation
                gravity: 0.08, // Very low gravity (feathers fall at ~0.05)
                drag: 0.98,    // High air resistance (makes them float/slow down fast)
                
                life: 1.0,
                // Lower decay = they stay on screen much longer
                decay: Math.random() * 0.005 + 0.005 
            });
        }

        if (!confetti.animationId) {
            confetti.lastTime = performance.now();
            confetti.animate();
        }
    },

    animate: (currentTime) => {
        if (!confetti.ctx || !confetti.canvas) return;

        // Calculate smooth delta time
        const deltaTime = (currentTime - confetti.lastTime) / 16.66;
        confetti.lastTime = currentTime;

        confetti.ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);

        // Iterate backwards to safely remove dead roses
        for (let i = confetti.particles.length - 1; i >= 0; i--) {
            const p = confetti.particles[i];

            p.life -= p.decay * (deltaTime || 1);

            if (p.life <= 0) {
                confetti.particles.splice(i, 1);
                continue;
            }

            // Apply "Floaty" Physics
            p.x += p.vx * (deltaTime || 1);
            p.y += p.vy * (deltaTime || 1);
            p.vy += p.gravity * (deltaTime || 1);
            p.vx *= p.drag; // Slows down horizontal movement
            p.vy *= p.drag; // Slows down vertical movement (terminal velocity)
            p.rotation += p.rotationSpeed * (deltaTime || 1);

            // Draw the Rose
            confetti.ctx.save();
            confetti.ctx.globalAlpha = p.life; // Fade out gracefully
            confetti.ctx.translate(p.x, p.y);
            confetti.ctx.rotate(p.rotation);
            
            // Draw Text
            confetti.ctx.font = `${p.size}px serif`; // Serif looks more elegant for roses
            confetti.ctx.textAlign = 'center';
            confetti.ctx.textBaseline = 'middle';
            confetti.ctx.fillText(p.text, 0, 0);
            
            confetti.ctx.restore();
        }

        if (confetti.particles.length > 0) {
            confetti.animationId = requestAnimationFrame(confetti.animate);
        } else {
            confetti.animationId = null;
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', confetti.init);
} else {
    confetti.init();
}