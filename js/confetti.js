const confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    lastTime: 0,

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
        confetti.canvas.width  = window.innerWidth;
        confetti.canvas.height = window.innerHeight;
    },

    burst: (x = null, y = null) => {
        const cx = x ?? window.innerWidth  / 2;
        const cy = y ?? window.innerHeight / 2;
        const isMobile = window.innerWidth < 768;
        const total    = isMobile ? 50 : 80;
        const emojiN   = Math.floor(total * 0.6);
        const rectN    = total - emojiN;

        for (let i = 0; i < emojiN; i++) {
            const angle = (Math.PI * 2 * i) / emojiN;
            const v = 5 + Math.random() * 8;
            confetti.particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * v + (Math.random() - 0.5) * 3,
                vy: Math.sin(angle) * v - 5 + (Math.random() - 0.5) * 3,
                type: 'emoji',
                text: confetti.shapes[Math.floor(Math.random() * confetti.shapes.length)],
                size: isMobile ? 18 : 26,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                gravity: 0.12, drag: 0.98,
                life: 1.0, decay: Math.random() * 0.003 + 0.004
            });
        }

        for (let i = 0; i < rectN; i++) {
            const angle = Math.random() * Math.PI * 2;
            const v = 6 + Math.random() * 10;
            confetti.particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * v + (Math.random() - 0.5) * 4,
                vy: Math.sin(angle) * v - 6,
                type: 'rect',
                color: confetti.colors[Math.floor(Math.random() * confetti.colors.length)],
                width: Math.random() * 10 + 5,
                height: Math.random() * 6 + 3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                gravity: 0.15, drag: 0.97,
                life: 1.0, decay: Math.random() * 0.004 + 0.005,
                wobble: Math.random() * 10,
                wobbleSpeed: Math.random() * 0.1 + 0.05
            });
        }

        confetti.playSound();
        if (!confetti.animationId) {
            confetti.lastTime = performance.now();
            confetti.animationId = requestAnimationFrame(confetti.animate);
        }
    },

    rain: (duration = 5000) => {
        const isMobile = window.innerWidth < 768;
        const perFrame = isMobile ? 1 : 3; // reduced from 2/4
        const end = Date.now() + duration;

        const interval = setInterval(() => {
            if (Date.now() > end) { clearInterval(interval); return; }

            for (let i = 0; i < perFrame; i++) {
                const isEmoji = Math.random() > 0.5;
                confetti.particles.push({
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 2 + 1,
                    type: isEmoji ? 'emoji' : 'rect',
                    text:  confetti.shapes[Math.floor(Math.random() * confetti.shapes.length)],
                    color: confetti.colors[Math.floor(Math.random() * confetti.colors.length)],
                    size: 18 + Math.random() * 10,
                    width: Math.random() * 8 + 4,
                    height: Math.random() * 5 + 2,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.1,
                    gravity: 0.05, drag: 0.99,
                    life: 1.0, decay: 0.002,
                    wobble: Math.random() * 10,
                    wobbleSpeed: Math.random() * 0.05 + 0.02
                });
            }

            if (!confetti.animationId) {
                confetti.lastTime = performance.now();
                confetti.animationId = requestAnimationFrame(confetti.animate);
            }
        }, 60);
    },

    animate: (currentTime) => {
        if (!confetti.ctx || !confetti.canvas) return;

        const dt = Math.min((currentTime - confetti.lastTime) / 16.66, 3); // cap delta so tab-switch doesn't explode
        confetti.lastTime = currentTime;

        confetti.ctx.clearRect(0, 0, confetti.canvas.width, confetti.canvas.height);

        for (let i = confetti.particles.length - 1; i >= 0; i--) {
            const p = confetti.particles[i];

            p.life -= p.decay * dt;
            if (p.life <= 0 || p.y > confetti.canvas.height + 60) {
                confetti.particles.splice(i, 1);
                continue;
            }

            p.x  += p.vx * dt;
            p.y  += p.vy * dt;
            p.vy += p.gravity * dt;
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.rotation += p.rotationSpeed * dt;

            if (p.wobble !== undefined) {
                p.wobble += p.wobbleSpeed * dt;
                p.x += Math.sin(p.wobble) * 0.5;
            }

            confetti.ctx.save();
            confetti.ctx.globalAlpha = p.life;
            confetti.ctx.translate(p.x, p.y);
            confetti.ctx.rotate(p.rotation);

            if (p.type === 'emoji') {
                confetti.ctx.font = `${p.size}px serif`;
                confetti.ctx.textAlign    = 'center';
                confetti.ctx.textBaseline = 'middle';
                confetti.ctx.fillText(p.text, 0, 0);
            } else {
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
            const ctx  = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, i) => {
                const osc  = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                const t = ctx.currentTime + i * 0.055;
                gain.gain.setValueAtTime(0.08, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
            });
        } catch (_) {}
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', confetti.init);
} else {
    confetti.init();
}