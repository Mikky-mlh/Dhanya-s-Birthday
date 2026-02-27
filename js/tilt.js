/**
 * tilt.js — 3D perspective tilt, glare overlay, and magnetic button pull
 *
 * THREE EFFECTS IN ONE FILE:
 *
 * 1. TiltEffect — attaches to any element. As you move the mouse over it,
 *    the element tilts in 3D toward the cursor (like holding a real card and
 *    tilting it to catch light). A semi-transparent white sheen ("glare") also
 *    slides across the surface tracking the cursor, completing the illusion.
 *
 * 2. MagneticEffect — attaches to buttons. When the cursor gets within ~90px
 *    of the button, the button physically slides 25px toward the cursor — like
 *    a magnet attracting a metal object. When cursor leaves the zone, it springs
 *    back. This is the effect that makes people say "wait, what the fuck just
 *    happened to that button?"
 *
 * 3. initAll() — scans the DOM and applies the right effect to each element.
 */

// ── TiltEffect ──────────────────────────────────────────────────────────────
class TiltEffect {
    /**
     * @param {HTMLElement} el
     * @param {object} opts
     *   max   — how many degrees the card tilts (default 14)
     *   scale — how much it grows on hover (default 1.03)
     *   glare — show the sliding light sheen (default true)
     */
    constructor(el, opts = {}) {
        this.el     = el;
        this.max    = opts.max   ?? 14;
        this.scale  = opts.scale ?? 1.03;
        this.glare  = opts.glare !== false;
        this.active = false;

        // Save original transform so we can restore it on mouse leave
        this.origTransform = el.style.transform || '';

        if (this.glare) this._addGlare();

        this._onEnter = this._onEnter.bind(this);
        this._onMove  = this._onMove.bind(this);
        this._onLeave = this._onLeave.bind(this);

        el.addEventListener('mouseenter', this._onEnter);
        el.addEventListener('mousemove',  this._onMove);
        el.addEventListener('mouseleave', this._onLeave);
    }

    _addGlare() {
        // A positioned div on top of the element that shows a white gradient.
        // We move its radial-gradient center as the mouse moves, making it look
        // like a spot of light is sliding across the card surface.
        const g = document.createElement('div');
        g.className = 'tilt-glare';
        // Make sure parent has position so the glare can be absolutely placed inside it
        if (getComputedStyle(this.el).position === 'static') {
            this.el.style.position = 'relative';
        }
        this.el.appendChild(g);
        this.glareEl = g;
    }

    _onEnter() {
        this.active = true;
        // Smooth transition INTO the tilt, but we'll disable it during active tilt
        // so the tilt tracks the cursor without lag
        this.el.style.transition = 'transform 0.15s ease';
        this.el.style.willChange = 'transform';
    }

    _onMove(e) {
        if (!this.active) return;
        // Remove transition so tilt follows cursor exactly with no delay
        this.el.style.transition = 'none';

        const rect    = this.el.getBoundingClientRect();
        // Cursor position relative to element center, normalized to -1 … +1 range
        const nx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;   // -1 = left edge, +1 = right edge
        const ny = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;   // -1 = top edge,  +1 = bottom edge

        const rotY =  nx * this.max;   // tilt around Y axis (left/right lean)
        const rotX = -ny * this.max;   // tilt around X axis (forward/backward lean) — negated so top of card lifts when cursor is at top

        this.el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${this.scale})`;

        if (this.glareEl) {
            // Move glare highlight to where the cursor is on the card
            const glareX = (nx + 1) / 2 * 100;  // convert -1…+1 to 0…100%
            const glareY = (ny + 1) / 2 * 100;
            this.glareEl.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.28) 0%, transparent 65%)`;
            this.glareEl.style.opacity = '1';
        }
    }

    _onLeave() {
        this.active = false;
        // Smooth return to flat
        this.el.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
        this.el.style.transform  = this.origTransform || '';
        this.el.style.willChange = 'auto';

        if (this.glareEl) {
            this.glareEl.style.transition = 'opacity 0.4s ease';
            this.glareEl.style.opacity = '0';
        }
    }

    destroy() {
        this.el.removeEventListener('mouseenter', this._onEnter);
        this.el.removeEventListener('mousemove',  this._onMove);
        this.el.removeEventListener('mouseleave', this._onLeave);
        if (this.glareEl) this.glareEl.remove();
    }
}

// ── MagneticEffect ──────────────────────────────────────────────────────────
class MagneticEffect {
    /**
     * @param {HTMLElement} el
     * @param {object} opts
     *   strength — max pixels the button moves toward cursor (default 28)
     *   radius   — how close cursor must be to trigger the effect in px (default 90)
     */
    constructor(el, opts = {}) {
        this.el       = el;
        this.strength = opts.strength ?? 28;
        this.radius   = opts.radius   ?? 90;

        // We track cursor globally so we can detect when cursor is near
        // (mousemove on the element itself wouldn't fire when cursor is just nearby)
        this._tick  = this._tick.bind(this);
        this._raf   = null;
        this._curX  = 0;
        this._curY  = 0;
        this._offX  = 0;
        this._offY  = 0;

        // Using a module-level mouse tracker shared across all magnets
        if (!MagneticEffect._listener) {
            MagneticEffect._mx = 0;
            MagneticEffect._my = 0;
            MagneticEffect._listener = (e) => {
                MagneticEffect._mx = e.clientX;
                MagneticEffect._my = e.clientY;
            };
            window.addEventListener('mousemove', MagneticEffect._listener, { passive: true });
        }

        this._raf = requestAnimationFrame(this._tick);
    }

    _tick() {
        const rect    = this.el.getBoundingClientRect();
        const centerX = rect.left + rect.width  / 2;
        const centerY = rect.top  + rect.height / 2;
        const mx = MagneticEffect._mx;
        const my = MagneticEffect._my;

        const dx = mx - centerX;
        const dy = my - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);   // Pythagorean distance to center

        if (dist < this.radius) {
            // Inside the attraction zone — pull button toward cursor.
            // The closer the cursor is, the stronger the pull (0 … 1 scale).
            const pull   = 1 - (dist / this.radius);  // 1 at center, 0 at edge
            const targetX = (dx / dist) * this.strength * pull;
            const targetY = (dy / dist) * this.strength * pull;

            // Lerp toward target (smooth catch-up, same idea as cursor ring)
            this._offX += (targetX - this._offX) * 0.18;
            this._offY += (targetY - this._offY) * 0.18;
        } else {
            // Outside zone — spring back to original position
            this._offX += (0 - this._offX) * 0.12;
            this._offY += (0 - this._offY) * 0.12;
        }

        // Only apply transform if movement is worth rendering (> 0.05px)
        if (Math.abs(this._offX) > 0.05 || Math.abs(this._offY) > 0.05) {
            this.el.style.transform = `translate(${this._offX.toFixed(2)}px, ${this._offY.toFixed(2)}px)`;
        }

        this._raf = requestAnimationFrame(this._tick);
    }

    destroy() {
        cancelAnimationFrame(this._raf);
        this.el.style.transform = '';
    }
}
MagneticEffect._listener = null;

// ── Init all effects ────────────────────────────────────────────────────────
const tilt = {
    instances: [],   // so we can destroy them all when navigating away

    init: () => {
        // Don't run on touch-only devices — no mouse = no tilt
        if (window.matchMedia('(hover: none)').matches) return;

        tilt.destroy();   // clean up from previous screen

        // Hub card — strong tilt, glare enabled, grows slightly
        const hubCard = document.querySelector('.hub-controls');
        if (hubCard) {
            tilt.instances.push(new TiltEffect(hubCard, { max: 12, scale: 1.02, glare: true }));
        }

        // Magnetic pull on menu buttons — called after a delay so GSAP entrance animations finish first
        setTimeout(() => {
            document.querySelectorAll('.btn').forEach(btn => {
                tilt.instances.push(new MagneticEffect(btn, { strength: 22, radius: 85 }));
            });
        }, 1200);
    },

    initWishCards: () => {
        if (window.matchMedia('(hover: none)').matches) return;
        tilt.destroy();
        setTimeout(() => {
            document.querySelectorAll('.wish-card').forEach(card => {
                tilt.instances.push(new TiltEffect(card, { max: 10, scale: 1.04, glare: true }));
            });
        }, 600);
    },

    initReasonCards: () => {
        if (window.matchMedia('(hover: none)').matches) return;
        tilt.destroy();
        setTimeout(() => {
            document.querySelectorAll('.reason-card').forEach(card => {
                tilt.instances.push(new TiltEffect(card, { max: 10, scale: 1.05, glare: true }));
            });
        }, 600);
    },

    initFinalMessage: () => {
        if (window.matchMedia('(hover: none)').matches) return;
        tilt.destroy();
        const msg = document.querySelector('.message-container');
        if (msg) tilt.instances.push(new TiltEffect(msg, { max: 6, scale: 1.01, glare: true }));
    },

    destroy: () => {
        tilt.instances.forEach(i => { try { i.destroy(); } catch(_) {} });
        tilt.instances = [];
    }
};
