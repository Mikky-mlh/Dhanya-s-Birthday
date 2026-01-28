const wishes = {
    wishesData: [
        {
            id: 1,
            text: "May your birthday be filled with laughter, joy, and all the things that make you smile! 🎉",
            color: "#FF6B9D"
        },
        {
            id: 2,
            text: "Wishing you endless adventures and unforgettable memories this year! 🌟",
            color: "#4ECDC4"
        },
        {
            id: 3,
            text: "May all your dreams come true and your heart be filled with happiness! 💖",
            color: "#FFD93D"
        },
        {
            id: 4,
            text: "Here's to another year of being absolutely amazing and inspiring everyone around you! ✨",
            color: "#A8E6CF"
        },
        {
            id: 5,
            text: "May this year bring you success in everything you do and peace in your heart! 🌈",
            color: "#FFB6C1"
        },
        {
            id: 6,
            text: "Wishing you countless reasons to smile and endless moments of pure joy! 😊",
            color: "#DDA0DD"
        },
        {
            id: 7,
            text: "May you always find courage to chase your dreams and strength to overcome any challenge! 💪",
            color: "#87CEEB"
        },
        {
            id: 8,
            text: "Here's to celebrating YOU today and every day! You deserve all the happiness in the world! 🎂",
            color: "#FFB347"
        }
    ],

    openedWishes: new Set(),

    init: () => {
        const container = document.getElementById('wishes-container');
        if (!container) return;

        container.innerHTML = '';
        wishes.openedWishes.clear();

        // Update counter
        document.getElementById('wishes-total').textContent = wishes.wishesData.length;
        document.getElementById('wishes-opened').textContent = 0;

        wishes.wishesData.forEach((wish, index) => {
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card';
            wishCard.dataset.id = wish.id;

            // Envelope (front)
            const envelope = document.createElement('div');
            envelope.className = 'wish-envelope';
            envelope.innerHTML = `
                <div class="envelope-flap"></div>
                <div class="envelope-body">
                    <span class="envelope-number">#${wish.id}</span>
                    <div class="envelope-icon">💌</div>
                </div>
            `;

            // Wish content (back)
            const content = document.createElement('div');
            content.className = 'wish-content';
            content.style.background = `linear-gradient(135deg, ${wish.color}dd, ${wish.color}88)`;
            content.innerHTML = `
                <div class="wish-text">${wish.text}</div>
                <div class="wish-hearts">💝</div>
            `;

            wishCard.appendChild(envelope);
            wishCard.appendChild(content);
            container.appendChild(wishCard);

            // Add click event to open
            wishCard.addEventListener('click', () => wishes.openWish(wishCard, wish.id));

            // Staggered entrance animation
            gsap.from(wishCard, {
                scale: 0,
                opacity: 0,
                duration: 0.5,
                delay: index * 0.1,
                ease: "back.out(1.7)"
            });
        });
    },

    openWish: (cardElement, wishId) => {
        if (cardElement.classList.contains('opened')) return;

        cardElement.classList.add('opened');
        wishes.openedWishes.add(wishId);

        // Update counter
        document.getElementById('wishes-opened').textContent = wishes.openedWishes.size;

        // Play sound effect if available
        wishes.playOpenSound();

        // Animate the card flip
        gsap.to(cardElement, {
            rotateY: 180,
            duration: 0.6,
            ease: "power2.out"
        });

        // Check if all wishes are opened
        if (wishes.openedWishes.size === wishes.wishesData.length) {
            setTimeout(() => {
                wishes.celebrateCompletion();
            }, 1000);
        }
    },

    playOpenSound: () => {
        // Create a simple "pop" sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    },

    celebrateCompletion: () => {
        // Show celebration message
        const container = document.getElementById('wishes-container');
        const celebration = document.createElement('div');
        celebration.className = 'wishes-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <h3>🎉 You've opened all your wishes! 🎉</h3>
                <p>May they all come true! ✨</p>
            </div>
        `;

        container.appendChild(celebration);

        gsap.from(celebration, {
            scale: 0,
            opacity: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
        });

        // Trigger confetti if available
        if (typeof confetti !== 'undefined' && confetti.burst) {
            confetti.burst();
        }
    }
};
