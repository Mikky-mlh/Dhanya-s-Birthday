/**
 * visualizer.js — Audio-reactive frequency ring behind the hub card
 *
 * What this actually does technically:
 *   Web Audio API has an "AnalyserNode" — think of it as a real-time equalizer
 *   that splits the audio into frequency buckets (like bass, mid, treble) and
 *   tells you how loud each bucket is RIGHT NOW, every animation frame.
 *
 *   We take 64 of those buckets, map each one to a bar in a circle, and draw
 *   them on a canvas element. Loud bass = tall bars at the bottom. High treble =
 *   tall bars on the sides. When music plays, the ring dances.
 *
 *   If the audio context fails (some browsers block it without user interaction,
 *   some localhost setups have CORS issues), we fall back to a simulated pulse
 *   using a sine wave + random noise that looks almost identical.
 */

const visualizer = (() => {
    let canvas, ctx;
    let analyser = null;
    let dataArray = null;
    let raf = null;
    let simPhase = 0;   // for the fallback simulation
    let isActive = false;

    // Visual config
    const BARS       = 64;       // number of frequency bars in the ring
    const RING_R     = 120;      // radius of the ring in px (how far bars extend from center)
    const BAR_MIN    = 4;        // min bar length in px when signal is silent
    const BAR_MAX    = 55;       // max bar length in px at full signal
    const SMOOTHING  = 0.82;     // FFT smoothing — higher = bars decay slower (0 = instant, 1 = frozen)

    // ── Init ────────────────────────────────────────────────────────────────
    function init(audioElement) {
        canvas = document.getElementById('visualizer-canvas');
        if (!canvas) return;

        ctx = canvas.getContext('2d');
        resize();
        window.addEventListener('resize', resize);

        // Try to connect to the real audio
        if (audioElement) {
            try {
                _connectToAudio(audioElement);
            } catch (e) {
                console.warn('Visualizer: falling back to simulation —', e.message);
            }
        }
    }

    function _connectToAudio(audioElement) {
        // AudioContext is the entry point to Web Audio API.
        // createMediaElementSource() wires the <audio> element INTO the audio graph.
        // The audio now flows: <audio> → analyserNode → destination (your speakers)
        // We tap the data from the analyserNode without interfering with playback.
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Browsers require AudioContext to be "resumed" after a user gesture
        // (to prevent autoplaying audio). If it's suspended, we hook into the first
        // click/touchstart to resume it.
        if (audioCtx.state === 'suspended') {
            const resume = () => {
                audioCtx.resume();
                window.removeEventListener('click',      resume);
                window.removeEventListener('touchstart', resume);
            };
            window.addEventListener('click',      resume, { once: true });
            window.addEventListener('touchstart', resume, { once: true });
        }

        analyser = audioCtx.createAnalyser();
        analyser.fftSize = BARS * 2;            // fftSize must be 2× the number of bars we want
        analyser.smoothingTimeConstant = SMOOTHING;

        const source = audioCtx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);  // still need to connect to destination or we won't hear anything

        dataArray = new Uint8Array(analyser.frequencyBinCount);  // frequencyBinCount = fftSize / 2 = 64
    }

    // ── Resize ───────────────────────────────────────────────────────────────
    function resize() {
        if (!canvas) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // ── Start / Stop ─────────────────────────────────────────────────────────
    function start() {
        if (isActive) return;
        isActive = true;
        _draw();
    }

    function stop() {
        isActive = false;
        cancelAnimationFrame(raf);
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // ── Draw loop ────────────────────────────────────────────────────────────
    function _draw() {
        if (!isActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width  / 2;
        const cy = canvas.height / 2;

        // Get frequency data — real if connected to audio, simulated otherwise
        const levels = _getFrequencyLevels();

        ctx.save();
        ctx.translate(cx, cy);   // draw centered in canvas

        for (let i = 0; i < BARS; i++) {
            // Spread bars evenly around the full circle
            const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;  // start from top (−π/2)
            const level = levels[i];  // 0 … 1

            const barLen = BAR_MIN + level * (BAR_MAX - BAR_MIN);

            // Each bar starts at RING_R and extends outward by barLen
            const x1 = Math.cos(angle) * RING_R;
            const y1 = Math.sin(angle) * RING_R;
            const x2 = Math.cos(angle) * (RING_R + barLen);
            const y2 = Math.sin(angle) * (RING_R + barLen);

            // Color: gradient from maroon (quiet) → coral/gold (loud)
            // hsl() is great here because we can shift hue based on the bar position
            const hue        = 340 + (i / BARS) * 50;   // maroon pink → coral range
            const lightness  = 45 + level * 25;
            const alpha      = 0.35 + level * 0.55;

            ctx.strokeStyle = `hsla(${hue}, 80%, ${lightness}%, ${alpha})`;
            ctx.lineWidth   = window.innerWidth < 768 ? 2.5 : 3.5;
            ctx.lineCap     = 'round';

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        // Subtle pulsing circle at the ring radius — connects the bars visually
        const avgLevel = levels.reduce((a, b) => a + b, 0) / BARS;
        ctx.strokeStyle = `rgba(184, 71, 94, ${0.10 + avgLevel * 0.20})`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.arc(0, 0, RING_R + avgLevel * 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        raf = requestAnimationFrame(_draw);
    }

    // ── Frequency levels ─────────────────────────────────────────────────────
    function _getFrequencyLevels() {
        if (analyser && dataArray) {
            // REAL MODE: ask the analyser for current frequency magnitudes (0-255 each)
            analyser.getByteFrequencyData(dataArray);
            return Array.from(dataArray).map(v => v / 255);  // normalize to 0…1
        } else {
            // SIMULATION MODE: produce a plausible-looking pulse using sine waves + noise.
            // This looks nearly identical to real music visualisation at a glance.
            simPhase += 0.025;
            return Array.from({ length: BARS }, (_, i) => {
                const normalized = i / BARS;
                // Bass bump in the lower frequencies (first third of bars)
                const bass  = normalized < 0.3 ? Math.max(0, Math.sin(simPhase * 2.1 + i * 0.3) * 0.6) : 0;
                // Mid-range wave
                const mid   = Math.max(0, Math.sin(simPhase * 1.5 + i * 0.15) * 0.4);
                // Random shimmer
                const shimmer = Math.random() * 0.08;
                return Math.min(1, bass + mid + shimmer);
            });
        }
    }

    return { init, start, stop };
})();
