const reasons = {
    reasonsList: [
        "Your smile lights up every room you walk into ✨",
        "You have the kindest heart I've ever known 💖",
        "Your laugh is absolutely contagious 😊",
        "You always know how to make people feel special 🌟",
        "Your creativity and imagination are inspiring 🎨",
        "You're brave enough to be yourself, always 💪",
        "You have an incredible sense of humor 😄",
        "Your loyalty and friendship mean the world 🤝",
        "You face challenges with grace and determination 🦋",
        "You make the ordinary moments extraordinary ✨",
        "Your passion for the things you love is beautiful 🔥",
        "You're thoughtful and considerate to everyone 💝",
        "You have an amazing ability to listen and understand 👂",
        "Your positivity is infectious and uplifting 🌈",
        "You're not afraid to stand up for what's right ⚡",
        "You make even the tough times feel bearable 🌸",
        "Your intelligence and wit never cease to amaze 🧠",
        "You bring out the best in people around you 🌺",
        "Your strength inspires others to be stronger 💪",
        "You're simply irreplaceable and one of a kind! 🎂"
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

            // Front (hidden state)
            const front = document.createElement('div');
            front.className = 'reason-front';
            front.innerHTML = `
                <div class="reason-number">${index + 1}</div>
                <div class="reason-icon">⭐</div>
            `;

            // Back (revealed state)
            const back = document.createElement('div');
            back.className = 'reason-back';
            back.innerHTML = `<p>${reason}</p>`;

            reasonCard.appendChild(front);
            reasonCard.appendChild(back);
            container.appendChild(reasonCard);

            // Add click event
            reasonCard.addEventListener('click', () => reasons.reveal(reasonCard, index));

            // Staggered entrance
            gsap.from(reasonCard, {
                scale: 0,
                opacity: 0,
                rotateY: -180,
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

        // Flip animation
        gsap.to(card, {
            rotateY: 180,
            duration: 0.6,
            ease: "power2.inOut"
        });

        // Add sparkle effect
        reasons.addSparkles(card);

        // Play a pleasant chime sound
        reasons.playRevealSound(index);
    },

    revealAll: () => {
        const cards = document.querySelectorAll('.reason-card:not(.revealed)');
        
        cards.forEach((card, i) => {
            const index = parseInt(card.dataset.index);
            setTimeout(() => {
                reasons.reveal(card, index);
            }, i * 100);
        });

        // Disable the button after clicking
        const btn = document.querySelector('.reveal-all-btn');
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
        const sparkleCount = 8;
        const rect = card.getBoundingClientRect();
        const containerRect = card.parentElement.getBoundingClientRect();

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = '✨';
            sparkle.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
            sparkle.style.top = `${rect.top - containerRect.top + rect.height / 2}px`;

            card.parentElement.appendChild(sparkle);

            const angle = (Math.PI * 2 * i) / sparkleCount;
            const distance = 50 + Math.random() * 30;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            gsap.to(sparkle, {
                x: tx,
                y: ty,
                opacity: 0,
                scale: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => sparkle.remove()
            });
        }
    },

    playRevealSound: (index) => {
        // Create a pleasant chime sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Different frequencies for variety
        const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
        oscillator.frequency.value = frequencies[index % frequencies.length];
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
};
