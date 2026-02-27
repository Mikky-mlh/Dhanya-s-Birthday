var app = {
    currentGame: null,
    mainBGM: null,
    isMusicPlaying: false,
    countdownInterval: null,

    // ONE AudioContext for the whole page. Browsers cap you at ~6 simultaneous
    // AudioContexts before silently failing. We reuse this for the visualizer.
    audioCtx: null,
    analyser: null,

    birthdayDate: new Date(new Date().getFullYear(), 0, 15),  // Jan 15

    // ── Boot ─────────────────────────────────────────────────────────────────
    init: () => {
        app.createParticles();
        app.initCountdown();
        app._initLoadingScreen();
    },

    // ── Enhanced Loading Screen ───────────────────────────────────────────────
    // 1. "Dhanya" letters spell out one by one with a glow.
    // 2. We ask for mic permission to detect blowing.
    // 3. If mic works: "Blow to start 🕯️" — user blows, candles die, site opens.
    // 4. If mic denied/unavailable: button appears as fallback.
    _initLoadingScreen: () => {
        const nameEl = document.getElementById('loading-name');
        if (!nameEl) {
            // Fallback for old loading screen markup
            setTimeout(() => { app.hideLoadingScreen(); app.showScreen('screen-gallery'); }, 1800);
            return;
        }

        const letters = 'Dhanya'.split('');
        nameEl.innerHTML = '';
        letters.forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'loading-letter';
            span.textContent = ch;
            span.style.animationDelay = `${0.5 + i * 0.16}s`;
            nameEl.appendChild(span);
        });

        // After name finishes revealing (~1.5s), show the candle prompt
        const revealDuration = 500 + letters.length * 160 + 500;
        setTimeout(app._showCandlePrompt, revealDuration);
    },

    _showCandlePrompt: () => {
        const prompt = document.getElementById('loading-prompt');
        const skip   = document.getElementById('loading-skip');
        if (!prompt) {
            setTimeout(() => { app.hideLoadingScreen(); app.showScreen('screen-gallery'); }, 600);
            return;
        }
        prompt.classList.add('visible');

        // Add click handler immediately as fallback
        prompt.onclick = () => {
            app._extinguishCandles(() => {
                app.hideLoadingScreen();
                app.showScreen('screen-gallery');
            });
        };

        app._tryMicCandleBlow(
            () => {  // success: blow detected
                app._extinguishCandles(() => {
                    app.hideLoadingScreen();
                    app.showScreen('screen-gallery');
                });
            },
            () => {  // failure: no mic / permission denied
                prompt.textContent = 'Tap to continue ✨';
                if (skip) skip.style.display = 'none';
            }
        );

        if (skip) {
            skip.onclick = () => { app.hideLoadingScreen(); app.showScreen('screen-gallery'); };
        }
    },

    _tryMicCandleBlow: (onBlow, onFail) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onFail(); return; }

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                const ctx      = new (window.AudioContext || window.webkitAudioContext)();
                const source   = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                const data      = new Uint8Array(analyser.frequencyBinCount);
                const THRESHOLD = 88;   // loudness level (0-255 scale) that counts as blowing
                const MIN_HOLD  = 8;    // must stay above threshold for 8 consecutive frames
                let held        = 0;
                let done        = false;

                function poll() {
                    if (done) return;
                    analyser.getByteFrequencyData(data);
                    const avg = data.reduce((s, v) => s + v, 0) / data.length;
                    if (avg > THRESHOLD) {
                        held++;
                        if (held >= MIN_HOLD) {
                            done = true;
                            stream.getTracks().forEach(t => t.stop());
                            onBlow();
                        }
                    } else {
                        held = 0;
                    }
                    requestAnimationFrame(poll);
                }
                requestAnimationFrame(poll);
            })
            .catch(() => onFail());
    },

    _extinguishCandles: (callback) => {
        const flames = document.querySelectorAll('.flame');
        flames.forEach((flame, i) => {
            setTimeout(() => {
                flame.classList.add('blown-out');
                // Spawn a smoke puff above the candle
                const smoke = document.createElement('div');
                smoke.className = 'smoke-puff';
                flame.parentElement.appendChild(smoke);
                setTimeout(() => smoke.remove(), 1200);
                if (i === flames.length - 1) setTimeout(callback, 600);
            }, i * 180);
        });
        if (flames.length === 0) setTimeout(callback, 300);
    },

    hideLoadingScreen: () => {
        const el = document.getElementById('loading-screen');
        if (!el) return;
        el.classList.add('fade-out');
        setTimeout(() => { el.style.display = 'none'; }, 700);
    },

    // ── Screen switching ──────────────────────────────────────────────────────
    showScreen: (screenId) => {
        if (screenId !== 'screen-gallery') app.stopMainBGM();
        if (typeof destroyWhackGame === 'function') destroyWhackGame();
        if (typeof visualizer !== 'undefined') visualizer.stop();
        if (typeof tilt !== 'undefined') tilt.destroy();

        // Shooting stars cleanup
        clearInterval(app._shootingStarInterval);

        document.querySelectorAll('.screen.active').forEach(el => {
            gsap.to(el, {
                opacity: 0, scale: 0.96, duration: 0.32, ease: 'power2.in',
                onComplete: () => {
                    el.classList.remove('active');
                    el.classList.add('hidden');
                    el.style.cssText = '';
                }
            });
        });

        const target = document.getElementById(screenId);
        if (!target) return;

        target.classList.remove('hidden');
        target.style.opacity   = '0';
        target.style.transform = 'scale(0.96)';
        target.style.display   = 'block';

        gsap.to(target, {
            opacity: 1, scale: 1, duration: 0.42, delay: 0.12, ease: 'power2.out',
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
                if (typeof wishes !== 'undefined') wishes.init();
                if (typeof tilt   !== 'undefined') tilt.initWishCards();
                break;
            case 'screen-reasons':
                if (typeof reasons !== 'undefined') reasons.init();
                if (typeof tilt    !== 'undefined') tilt.initReasonCards();
                break;
            case 'screen-final':
                if (typeof showFinalMessage === 'function') showFinalMessage();
                if (typeof tilt !== 'undefined') tilt.initFinalMessage();
                app._startShootingStars();
                break;
            case 'screen-gallery':
                if (typeof gallery !== 'undefined') gallery.init();
                app.addFlowersToScreen();
                app.playMainBGM();
                if (typeof tilt !== 'undefined') tilt.init();
                break;
        }
    },

    // ── Shooting stars (final message dark screen) ────────────────────────────
    _shootingStarInterval: null,
    _startShootingStars: () => {
        clearInterval(app._shootingStarInterval);
        const container = document.getElementById('screen-final');
        if (!container) return;

        function spawn() {
            const star = document.createElement('div');
            star.className = 'shooting-star';
            star.style.cssText = `left:${10 + Math.random() * 70}%; top:${Math.random() * 50}%;`;
            container.appendChild(star);
            setTimeout(() => star.remove(), 1200);
        }

        spawn();
        app._shootingStarInterval = setInterval(spawn, 1600 + Math.random() * 1400);
    },

    // ── BGM + AudioContext ────────────────────────────────────────────────────
    playMainBGM: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop   = true;
            app.mainBGM.volume = 0.7;
            // crossOrigin must be set before audio begins loading.
            // Without it, Web Audio API throws "tainted source" error.
            app.mainBGM.crossOrigin = 'anonymous';
        }
        app.mainBGM.play()
            .then(() => {
                app.isMusicPlaying = true;
                app.updateMusicToggle();
                app._connectVisualizer();
            })
            .catch(() => {
                app.isMusicPlaying = false;
                app.updateMusicToggle();
                // No BGM, but still start visualizer in simulation mode
                if (typeof visualizer !== 'undefined') {
                    visualizer.init(null);
                    visualizer.start();
                }
            });
    },

    _connectVisualizer: () => {
        if (typeof visualizer === 'undefined') return;
        try { visualizer.init(app.mainBGM); }
        catch(_) { visualizer.init(null); }
        visualizer.start();
    },

    stopMainBGM: () => {
        if (!app.mainBGM) return;
        app.mainBGM.pause();
        app.mainBGM.currentTime = 0;
        app.isMusicPlaying = false;
        app.updateMusicToggle();
    },

    toggleMusic: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop = true;
            app.mainBGM.volume = 0.7;
            app.mainBGM.crossOrigin = 'anonymous';
        }
        if (app.isMusicPlaying) {
            app.mainBGM.pause();
            app.isMusicPlaying = false;
            if (typeof visualizer !== 'undefined') visualizer.stop();
        } else {
            app.mainBGM.play().then(() => app._connectVisualizer()).catch(() => {});
            app.isMusicPlaying = true;
        }
        app.updateMusicToggle();
    },

    updateMusicToggle: () => {
        const btn = document.getElementById('music-toggle');
        if (!btn) return;
        btn.textContent = app.isMusicPlaying ? '🔊' : '🔇';
        btn.classList.toggle('playing', app.isMusicPlaying);
    },

    // ── Floating particles ────────────────────────────────────────────────────
    createParticles: () => {
        const container = document.getElementById('particles-container');
        if (!container) return;
        const emojis = ['💖','✨','🌸','💫','🦋','💕','⭐','🎀'];
        const count  = window.innerWidth < 768 ? 8 : 14;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.cssText = `
                font-size:${Math.random()*18+14}px;
                left:${Math.random()*100}%;
                animation-duration:${Math.random()*12+10}s;
                animation-delay:${Math.random()*12}s;
                opacity:${Math.random()*0.4+0.25};
            `;
            container.appendChild(p);
        }
    },

    addFlowersToScreen: () => {
        const container = document.getElementById('flowers-container');
        if (!container) return;
        container.innerHTML = '';
        const count = window.innerWidth < 768 ? 10 : 14;
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'flower';
            el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${50+Math.random()*30}px;transform:rotate(${Math.random()*360}deg);`;
            el.textContent = ['🌸','🌺','🌻','🌹','🌷'][Math.floor(Math.random()*5)];
            gsap.to(el, {
                y: Math.random()*20-10, x: Math.random()*10-5,
                rotation: `+=${Math.random()*15-7}`,
                duration: 4+Math.random()*3, repeat:-1, yoyo:true,
                ease:'sine.inOut', delay:Math.random()*2
            });
            container.appendChild(el);
        }
    },

    // ── Countdown ─────────────────────────────────────────────────────────────
    initCountdown: () => {
        const el = document.getElementById('birthday-countdown');
        if (!el) return;
        let bd = new Date(app.birthdayDate);
        if (new Date() > bd) bd.setFullYear(bd.getFullYear()+1);
        const diff = bd - new Date();
        if (diff > 0 && diff < 30*24*60*60*1000) {
            el.style.display = 'block';
            app.updateCountdown(bd);
            app.countdownInterval = setInterval(() => app.updateCountdown(bd), 1000);
        }
    },

    updateCountdown: (bd) => {
        const diff = bd - new Date();
        if (diff <= 0) {
            clearInterval(app.countdownInterval);
            const el = document.getElementById('birthday-countdown');
            if (el) el.innerHTML = '<div class="countdown-title">🎉 Happy Birthday! 🎉</div>';
            confetti.burst(); return;
        }
        document.getElementById('countdown-days').textContent  = String(Math.floor(diff/(1000*60*60*24))).padStart(2,'0');
        document.getElementById('countdown-hours').textContent = String(Math.floor((diff%(1000*60*60*24))/(1000*60*60))).padStart(2,'0');
        document.getElementById('countdown-mins').textContent  = String(Math.floor((diff%(1000*60*60))/(1000*60))).padStart(2,'0');
        document.getElementById('countdown-secs').textContent  = String(Math.floor((diff%(1000*60))/1000)).padStart(2,'0');
    }
};

// ── Final Message ─────────────────────────────────────────────────────────────
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

    // Synthesized typewriter click sounds — white noise (random audio values)
    // shaped into a short click. No audio file needed at all.
    let sfxCtx = null;
    try { sfxCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(_) {}

    function playClick(loud) {
        if (!sfxCtx) return;
        try {
            const buf  = sfxCtx.createBuffer(1, Math.floor(sfxCtx.sampleRate * 0.035), sfxCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                // White noise that tapers to silence — creates the "tick" texture
                data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
            }
            const src  = sfxCtx.createBufferSource();
            const gain = sfxCtx.createGain();
            src.buffer = buf;
            src.connect(gain);
            gain.connect(sfxCtx.destination);
            gain.gain.value = loud ? 0.055 : 0.022;
            src.start();
        } catch(_) {}
    }

    let i = 0;
    function type() {
        if (i >= text.length) {
            if (cursor) setTimeout(() => { cursor.style.display = 'none'; }, 500);
            setTimeout(() => { if (typeof confetti !== 'undefined') confetti.burst(); }, 1000);
            return;
        }
        const ch = text[i++];
        el.textContent += ch;

        let delay = 22;
        let loud  = false;
        if ('.!?'.includes(ch)) { delay = 140; loud = true; }
        else if (ch === ',')    { delay = 65; }
        else if (ch === '\n')   { delay = 85; }
        else if (ch === ' ')    { delay = 11; }

        if (ch !== ' ' && ch !== '\n') playClick(loud);
        setTimeout(type, delay);
    }
    setTimeout(type, 400);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}