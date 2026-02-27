var app = {
    currentGame: null,
    mainBGM: null,
    isMusicPlaying: false,
    countdownInterval: null,

    // Set Dhanya's birthday here (Month is 0-indexed: January = 0)
    birthdayDate: new Date(new Date().getFullYear(), 0, 15), // January 15th

    init: () => {
        app.createParticles();
        app.initCountdown();

        // Faster load — 1800ms feels snappy without feeling rushed
        setTimeout(() => {
            app.hideLoadingScreen();
            app.showScreen('screen-gallery');
        }, 1800);
    },

    hideLoadingScreen: () => {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        loadingScreen.classList.add('fade-out');
        setTimeout(() => { loadingScreen.style.display = 'none'; }, 700);
    },

    initCountdown: () => {
        const countdownEl = document.getElementById('birthday-countdown');
        if (!countdownEl) return;

        const now = new Date();
        let birthday = new Date(app.birthdayDate);
        if (now > birthday) birthday.setFullYear(birthday.getFullYear() + 1);

        const diff = birthday - now;
        if (diff > 0 && diff < 30 * 24 * 60 * 60 * 1000) {
            countdownEl.style.display = 'block';
            app.updateCountdown(birthday);
            app.countdownInterval = setInterval(() => app.updateCountdown(birthday), 1000);
        }
    },

    updateCountdown: (birthday) => {
        const diff = birthday - new Date();
        if (diff <= 0) {
            clearInterval(app.countdownInterval);
            const el = document.getElementById('birthday-countdown');
            if (el) el.innerHTML = '<div class="countdown-title">🎉 Happy Birthday! 🎉</div>';
            confetti.burst();
            return;
        }
        const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs  = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown-days').textContent  = String(days).padStart(2, '0');
        document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdown-mins').textContent  = String(mins).padStart(2, '0');
        document.getElementById('countdown-secs').textContent  = String(secs).padStart(2, '0');
    },

    createParticles: () => {
        const container = document.getElementById('particles-container');
        if (!container) return;

        const emojis = ['💖', '✨', '🌸', '💫', '🦋', '💕', '⭐', '🎀'];
        // Halved counts — 90 DOM nodes floating was overkill
        const count = window.innerWidth < 768 ? 8 : 14;

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.cssText = `
                font-size: ${Math.random() * 18 + 14}px;
                left: ${Math.random() * 100}%;
                animation-duration: ${Math.random() * 12 + 10}s;
                animation-delay: ${Math.random() * 12}s;
                opacity: ${Math.random() * 0.4 + 0.25};
            `;
            container.appendChild(p);
        }
    },

    showScreen: (screenId) => {
        if (screenId !== 'screen-gallery') app.stopMainBGM();

        // Destroy whack game if leaving that screen
        if (typeof destroyWhackGame === 'function') destroyWhackGame();

        // Fade out all active screens
        document.querySelectorAll('.screen.active').forEach(el => {
            gsap.to(el, {
                opacity: 0,
                scale: 0.96,
                duration: 0.35,
                ease: 'power2.in',
                onComplete: () => {
                    el.classList.remove('active');
                    el.classList.add('hidden');
                    el.style.cssText = '';
                }
            });
        });

        const target = document.getElementById(screenId);
        if (!target) return;

        // Make visible before animating so GSAP has a real element to work with
        target.classList.remove('hidden');
        target.style.opacity = '0';
        target.style.transform = 'scale(0.96)';
        target.style.display = 'block';

        gsap.to(target, {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            delay: 0.15,
            ease: 'power2.out',
            onComplete: () => {
                target.classList.add('active');
                target.style.transform = '';
                app._onScreenReady(screenId);
            }
        });
    },

    _onScreenReady: (screenId) => {
        switch (screenId) {
            case 'screen-whack':
                if (typeof initWhackGame === 'function') initWhackGame();
                break;
            case 'screen-wishes':
                if (typeof wishes !== 'undefined' && wishes.init) wishes.init();
                break;
            case 'screen-reasons':
                if (typeof reasons !== 'undefined' && reasons.init) reasons.init();
                break;
            case 'screen-final':
                if (typeof showFinalMessage === 'function') showFinalMessage();
                break;
            case 'screen-gallery':
                if (typeof gallery !== 'undefined' && gallery.init) gallery.init();
                app.addFlowersToScreen();
                app.playMainBGM();
                break;
        }
    },

    playMainBGM: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop = true;
            app.mainBGM.volume = 0.7;
        }
        app.mainBGM.play().catch(e => console.log('Audio autoplay blocked'));
        app.isMusicPlaying = true;
        const btn = document.getElementById('music-toggle');
        if (btn) btn.textContent = '🔊';
    },

    toggleMusic: () => {
        if (!app.mainBGM) {
            app.playMainBGM();
            return;
        }
        if (app.isMusicPlaying) {
            app.mainBGM.pause();
            app.isMusicPlaying = false;
            document.getElementById('music-toggle').textContent = '🔇';
        } else {
            app.mainBGM.play().catch(e => console.log('Audio play failed'));
            app.isMusicPlaying = true;
            document.getElementById('music-toggle').textContent = '🔊';
        }
    },

    stopMainBGM: () => {
        if (!app.mainBGM) return;
        app.mainBGM.pause();
        app.mainBGM.currentTime = 0;
        app.isMusicPlaying = false;
    },

    addFlowersToScreen: () => {
        const container = document.getElementById('flowers-container');
        if (!container) return;
        container.innerHTML = '';

        // Reduced from 25 to 14 — still looks lush, way less DOM thrashing
        const count = window.innerWidth < 768 ? 10 : 14;

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'flower';
            el.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                font-size: ${50 + Math.random() * 30}px;
                transform: rotate(${Math.random() * 360}deg);
            `;
            el.textContent = ['🌸', '🌺', '🌻', '🌹', '🌷'][Math.floor(Math.random() * 5)];

            gsap.to(el, {
                y: `${Math.random() * 20 - 10}`,
                x: `${Math.random() * 10 - 5}`,
                rotation: `+=${Math.random() * 15 - 7}`,
                duration: 4 + Math.random() * 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 2
            });

            container.appendChild(el);
        }
    }
};

// ── Final Message Typewriter ─────────────────────────────────────────────────
function showFinalMessage() {
    const text = `Happy Birthday, Dhanya! 🎂

On this special day, I want you to know how truly remarkable you are. Your smile has the power to brighten even the darkest days, and your kindness touches everyone fortunate enough to know you.

Every moment with you is a treasure, and I'm grateful for all the memories we've shared. You deserve all the happiness in the world and then some more!

May this year bring you endless adventures, beautiful surprises, and all your dreams coming true. Here's to celebrating YOU – today and every day!

Thank you for being such an incredible person. Wishing you the most magical birthday ever! 🌟`;

    const el     = document.getElementById('typewriter-text');
    const cursor = document.querySelector('.typewriter-cursor');
    if (!el) return;

    el.textContent = '';
    if (cursor) cursor.style.display = 'inline-block';

    let i = 0;
    function type() {
        if (i >= text.length) {
            if (cursor) setTimeout(() => { cursor.style.display = 'none'; }, 500);
            setTimeout(() => { if (typeof confetti !== 'undefined') confetti.burst(); }, 1000);
            return;
        }
        el.textContent += text[i++];
        const ch = text[i - 1];
        const delay = (ch === '.' || ch === '!' || ch === '?') ? 140
                    : ch === ','  ? 70
                    : ch === '\n' ? 90
                    : 22;
        setTimeout(type, delay);
    }
    setTimeout(type, 400);
}

// ── Boot ─────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}