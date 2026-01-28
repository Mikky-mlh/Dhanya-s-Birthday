const confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init: () => {
        confetti.canvas = document.getElementById('confetti-canvas');
        if (!confetti.canvas) return;

        confetti.ctx = confetti.canvas.getContext('2d');
        confetti.resize();

        window.addEventListener('resize', confetti.resize);
    },

    resize: () => {
        if (!confetti.canvas) return;
        confetti.canvas.width = window.innerWidth;
        confetti.canvas.height = window.innerHeight;
    },

    burst: (x = null, y = null) => {
        // Default to center of screen if no position given
        const centerX = x !== null ? x : window.innerWidth / 2;
        const centerY = y !== null ? y : window.innerHeight / 2;

        const particleCount = 100;
        const colors = ['#FF6B9D', '#4ECDC4', '#FFD93D', '#A8E6CF', '#FFB6C1', '#DDA0DD', '#87CEEB', '#FFB347'];
        const shapes = ['circle', 'square', 'triangle'];
        const emojis = ['🎉', '🎊', '⭐', '💖', '✨', '🎂', '🎈', '💝'];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const velocity = 5 + Math.random() * 10;
            
            const particle = {
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - Math.random() * 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                size: 5 + Math.random() * 10,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                gravity: 0.3 + Math.random() * 0.2,
                life: 1,
                decay: 0.005 + Math.random() * 0.005,
                emoji: Math.random() > 0.7 ? emojis[Math.floor(Math.random() * emojis.length)] : null
            };

            confetti.particles.push(particle);
        }

        if (!confetti.animationId) {
            confetti.animate();
        }
    },

    animate: () => {
        if (!confetti.ctx || !confetti.canvas) return;

        confetti.ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);

        confetti.particles = confetti.particles.filter(p => p.life > 0);

        confetti.particles.forEach(p => {
            // Update physics
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.life -= p.decay;
            p.vx *= 0.99; // Air resistance

            // Draw particle
            confetti.ctx.save();
            confetti.ctx.globalAlpha = p.life;
            confetti.ctx.translate(p.x, p.y);
            confetti.ctx.rotate(p.rotation);

            if (p.emoji) {
                confetti.ctx.font = `${p.size * 2}px Arial`;
                confetti.ctx.textAlign = 'center';
                confetti.ctx.textBaseline = 'middle';
                confetti.ctx.fillText(p.emoji, 0, 0);
            } else {
                confetti.ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    confetti.ctx.beginPath();
                    confetti.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    confetti.ctx.fill();
                } else if (p.shape === 'square') {
                    confetti.ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
                } else if (p.shape === 'triangle') {
                    confetti.ctx.beginPath();
                    confetti.ctx.moveTo(0, -p.size);
                    confetti.ctx.lineTo(p.size, p.size);
                    confetti.ctx.lineTo(-p.size, p.size);
                    confetti.ctx.closePath();
                    confetti.ctx.fill();
                }
            }

            confetti.ctx.restore();
        });

        if (confetti.particles.length > 0) {
            confetti.animationId = requestAnimationFrame(confetti.animate);
        } else {
            confetti.animationId = null;
        }
    },

    // Continuous confetti rain effect
    rain: (duration = 5000) => {
        const interval = setInterval(() => {
            const x = Math.random() * window.innerWidth;
            confetti.burst(x, -50);
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
        }, duration);
    }
};

// Initialize confetti when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', confetti.init);
} else {
    confetti.init();
}
