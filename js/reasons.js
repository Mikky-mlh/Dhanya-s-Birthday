const reasons = {
    reasonsList: [
        { text: "Your smile lights up every room you walk into ✨", icon: "😊" },
        { text: "You have the kindest heart I've ever known 💖", icon: "💝" },
        { text: "Your laugh is absolutely contagious 😄", icon: "🤣" },
        { text: "You always know how to make people feel special 🌟", icon: "👑" },
        { text: "Your creativity and imagination are inspiring 🎨", icon: "🎭" },
        { text: "You're brave enough to be yourself, always 💪", icon: "🦁" },
        { text: "You have an incredible sense of humor 😆", icon: "🎪" },
        { text: "Your loyalty and friendship mean the world 🤝", icon: "💎" },
        { text: "You face challenges with grace and determination 🦋", icon: "🌈" },
        { text: "You make the ordinary moments extraordinary ✨", icon: "⭐" },
        { text: "Your passion for the things you love is beautiful 🔥", icon: "🌸" },
        { text: "You're thoughtful and considerate to everyone 💝", icon: "🎀" },
        { text: "You have an amazing ability to listen and understand 👂", icon: "🤗" },
        { text: "Your positivity is infectious and uplifting 🌈", icon: "☀️" },
        { text: "You're not afraid to stand up for what's right ⚡", icon: "🛡️" },
        { text: "You make even the tough times feel bearable 🌸", icon: "🌺" },
        { text: "Your intelligence and wit never cease to amaze 🧠", icon: "💡" },
        { text: "You bring out the best in people around you 🌺", icon: "🪄" },
        { text: "Your strength inspires others to be stronger 💪", icon: "🏆" },
        { text: "You're simply irreplaceable and one of a kind! 🎂", icon: "👸" }
    ],

    revealed: new Set(),

    init: () => {
        const container = document.getElementById('reasons-container');
        if (!container) return;

        container.innerHTML = '';
        reasons.revealed.clear();

        reasons.reasonsList.forEach((reason, index) => {
            const reasonCard = document.createElement('div');
            reasonCard.className = 'reason-card';
            reasonCard.dataset.index = index;

            const front = document.createElement('div');
            front.className = 'reason-front';
            front.innerHTML = `
                <div class="reason-number">#${index + 1}</div>
                <div class="reason-icon">${reason.icon}</div>
            `;

            const back = document.createElement('div');
            back.className = 'reason-back';
            back.innerHTML = `<p>${reason.text}</p>`;

            reasonCard.appendChild(front);
            reasonCard.appendChild(back);
            container.appendChild(reasonCard);

            reasonCard.addEventListener('click', () => reasons.reveal(reasonCard, index));

            // Staggered entrance with varied animations
            gsap.from(reasonCard, {
                scale: 0.5,
                opacity: 0,
                rotation: Math.random() * 30 - 15,
                y: 50,
                duration: 0.6,
                delay: index * 0.05,
                ease: "back.out(1.7)"
            });
        });
    },

    reveal: (card, index) => {
        if (card.classList.contains('revealed')) return;

        card.classList.add('revealed');
        reasons.revealed.add(index);

        const tl = gsap.timeline();

        // Lift and flip animation
        tl.to(card, {
            scale: 1.2,
            y: -20,
            zIndex: 50,
            duration: 0.25,
            ease: "power2.out"
        })
        .to(card, {
            rotateY: 180,
            duration: 0.6,
            ease: "power2.inOut",
        })
        .to(card, {
            scale: 1,
            y: 0,
            zIndex: 1,
            duration: 0.3,
            ease: "power2.in"
        });

        reasons.addSparkles(card);
        reasons.playRevealSound(index);

        // Trigger celebration when all revealed
        if (reasons.revealed.size === reasons.reasonsList.length) {
            setTimeout(() => {
                if (typeof confetti !== 'undefined') {
                    confetti.burst();
                }
            }, 800);
        }
    },

    revealAll: () => {
        const cards = document.querySelectorAll('.reason-card:not(.revealed)');
        cards.forEach((card, i) => {
            const index = parseInt(card.dataset.index);
            setTimeout(() => {
                reasons.reveal(card, index);
            }, i * 100);
        });

        const btn = document.querySelector('.reveal-all-btn:not(.reveal-all-wishes-btn)');
        if (btn && cards.length > 0) {
            btn.disabled = true;
            btn.textContent = "All Revealed! ✨";
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = "Reveal All ⭐";
            }, 3000);
        }
    },
    
    addSparkles: (card) => {
        const sparkleCount = 10;
        const sparkleEmojis = ['✨', '⭐', '💫', '🌟', '💖'];
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
            
            sparkle.style.left = '50%';
            sparkle.style.top = '50%';
            sparkle.style.position = 'absolute';
            sparkle.style.fontSize = `${Math.random() * 10 + 15}px`;
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '100';
            
            card.appendChild(sparkle);

            const angle = (Math.PI * 2 * i) / sparkleCount;
            const distance = 60 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            gsap.fromTo(sparkle,
                { scale: 0, opacity: 1 },
                {
                    x: tx,
                    y: ty,
                    opacity: 0,
                    scale: 1.2,
                    rotation: Math.random() * 360,
                    duration: 0.7,
                    ease: "power2.out",
                    onComplete: () => sparkle.remove()
                }
            );
        }
    },
    
    playRevealSound: (index) => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Musical scale - different note for each card
            const frequencies = [
                261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25,
                587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66,
                1318.51, 1396.91, 1567.98, 1760.00
            ];
            
            oscillator.frequency.value = frequencies[index % frequencies.length];
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio context not supported
        }
    }
};
