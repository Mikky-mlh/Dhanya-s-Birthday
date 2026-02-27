/**
 * cursor.js — Custom cursor with trailing hearts/sparkles
 *
 * How it works:
 *   - Completely hides the OS arrow cursor via CSS (body { cursor: none })
 *   - Renders two elements:
 *       • #cursor-dot  — a tiny 8px glowing circle that snaps to the mouse instantly
 *       • #cursor-ring — a 32px ring that follows with a smooth lag (it "catches up" to the dot
 *                        position by moving 12% of the remaining distance each frame, creating
 *                        the rubbery delay effect)
 *   - On every mousemove, spawns a tiny emoji particle that floats upward and fades out.
 *     Throttled to once per 35ms so it doesn't create 60 particles/second.
 *   - On hover over interactive elements (.btn, .photo-frame, .wish-card, etc.) the ring
 *     expands and changes color to signal "this is clickable."
 */

const cursor = (() => {
    let dot, ring;
    let mouseX = -100, mouseY = -100;   // start off-screen
    let ringX  = -100, ringY  = -100;   // ring tracks behind
    let lastParticleTime = 0;
    let isHovering = false;
    let raf = null;

    const LERP = 0.13;   // lerp = "linear interpolation" — how fast ring catches up: 0=never, 1=instant
    const TRAIL_EMOJIS = ['💖','✨','⭐','💫','🌸','💕','🎀'];

    // ── Init ────────────────────────────────────────────────────────────────
    function init() {
        dot  = document.getElementById('cursor-dot');
        ring = document.getElementById('cursor-ring');
        if (!dot || !ring) return;

        // Don't run on touch devices — no cursor needed there
        if (window.matchMedia('(hover: none)').matches) return;

        document.body.style.cursor = 'none';

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup',   onUp);

        // Expand ring on hover over any interactive element
        const hoverTargets = [
            '.btn', '.btn-back', '.confetti-btn', '.reveal-all-btn',
            '.photo-frame', '.wish-card', '.reason-card',
            '.close-btn', '.music-toggle', 'button', 'a'
        ].join(', ');

        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                isHovering = true;
                ring.classList.add('cursor-hover');
                dot.classList.add('cursor-hover');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(hoverTargets)) {
                isHovering = false;
                ring.classList.remove('cursor-hover');
                dot.classList.remove('cursor-hover');
            }
        });

        // Hide cursor when it leaves the window, show when it returns
        document.addEventListener('mouseleave', () => {
            dot.style.opacity  = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity  = '1';
            ring.style.opacity = '1';
        });

        raf = requestAnimationFrame(animate);
    }

    // ── Mouse events ────────────────────────────────────────────────────────
    function onMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const now = Date.now();
        if (now - lastParticleTime > 35) {
            spawnParticle(mouseX, mouseY);
            lastParticleTime = now;
        }
    }

    function onDown() {
        ring.classList.add('cursor-click');
        dot.classList.add('cursor-click');
    }

    function onUp() {
        ring.classList.remove('cursor-click');
        dot.classList.remove('cursor-click');
        spawnBurst(mouseX, mouseY);
    }

    // ── Animation loop ───────────────────────────────────────────────────────
    function animate() {
        // Snap dot instantly
        dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

        // Ring lerps (catches up slowly) to mouse position
        // lerp formula: current + (target - current) * speed
        // This means each frame the ring closes 13% of the gap to the mouse.
        ringX += (mouseX - ringX) * LERP;
        ringY += (mouseY - ringY) * LERP;
        ring.style.transform = `translate(${ringX - 16}px, ${ringY - 16}px)`;

        raf = requestAnimationFrame(animate);
    }

    // ── Particle effects ────────────────────────────────────────────────────
    function spawnParticle(x, y) {
        const el = document.createElement('div');
        el.className = 'cursor-particle';
        el.textContent = TRAIL_EMOJIS[Math.floor(Math.random() * TRAIL_EMOJIS.length)];

        const size = 12 + Math.random() * 10;
        el.style.cssText = `
            left: ${x}px;
            top:  ${y}px;
            font-size: ${size}px;
        `;
        document.body.appendChild(el);

        // Animate: float upward + drift sideways + fade out
        const driftX = (Math.random() - 0.5) * 60;
        const driftY = -(40 + Math.random() * 60);
        const duration = 600 + Math.random() * 400;

        el.animate([
            { transform: 'translate(-50%, -50%) scale(1)',    opacity: 0.9 },
            { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(0.4)`, opacity: 0 }
        ], {
            duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fill: 'forwards'
        }).onfinish = () => el.remove();
    }

    // On click: mini burst of particles from the click point
    function spawnBurst(x, y) {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => spawnParticle(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20), i * 30);
        }
    }

    // ── API ─────────────────────────────────────────────────────────────────
    return { init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cursor.init);
} else {
    cursor.init();
}
