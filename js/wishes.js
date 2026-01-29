const wishes = {
    wishesData: [
        { id: 1, text: "May your birthday be filled with laughter, joy, and all the things that make you smile! 🎉", color: "#FF6B9D" },
        { id: 2, text: "Wishing you endless adventures and unforgettable memories this year! 🌟", color: "#4ECDC4" },
        { id: 3, text: "May all your dreams come true and your heart be filled with happiness! 💖", color: "#FFD93D" },
        { id: 4, text: "Here's to another year of being absolutely amazing and inspiring everyone around you! ✨", color: "#A8E6CF" },
        { id: 5, text: "May this year bring you success in everything you do and peace in your heart! 🌈", color: "#FFB6C1" },
        { id: 6, text: "Wishing you countless reasons to smile and endless moments of pure joy! 😊", color: "#DDA0DD" },
        { id: 7, text: "May you always find courage to chase your dreams and strength to overcome any challenge! 💪", color: "#87CEEB" },
        { id: 8, text: "Here's to celebrating YOU today and every day! You deserve all the happiness in the world! 🎂", color: "#FFB347" }
    ],

    openedWishes: new Set(),

    init: () => {
        const container = document.getElementById('wishes-container');
        if (!container) return;

        container.innerHTML = '';
        wishes.openedWishes.clear();

        wishes.wishesData.forEach((wish, index) => {
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card';
            wishCard.dataset.id = wish.id;

            const envelope = document.createElement('div');
            envelope.className = 'wish-envelope';
            envelope.innerHTML = `
                <div class="envelope-flap"></div>
                <div class="envelope-body">
                    <span class="envelope-number">#${wish.id}</span>
                    <div class="envelope-icon">💌</div>
                </div>
            `;

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

            wishCard.addEventListener('click', () => wishes.openWish(wishCard, wish.id));

            gsap.from(wishCard, {
                y: 50,
                opacity: 0,
                duration: 0.6,
                delay: index * 0.05,
                ease: "power2.out"
            });
        });
    },

    openWish: (cardElement, wishId) => {
        if (cardElement.classList.contains('opened')) return;

        cardElement.classList.add('opened');
        wishes.openedWishes.add(wishId);

        wishes.playOpenSound();

        const tl = gsap.timeline();

        tl.to(cardElement, {
            scale: 1.1,
            zIndex: 100,
            duration: 0.2,
            ease: "power2.out"
        })
        .to(cardElement, {
            rotateY: 180,
            duration: 0.6,
            ease: "back.out(1.2)",
        })
        .to(cardElement, {
            scale: 1,
            zIndex: 1,
            duration: 0.3,
            ease: "power2.in"
        });
    },

    revealAll: () => {
        const cards = document.querySelectorAll('.wish-card:not(.opened)');
        cards.forEach((card, i) => {
            const wishId = parseInt(card.dataset.id);
            setTimeout(() => {
                wishes.openWish(card, wishId);
            }, i * 150);
        });
        
        const btn = document.querySelector('.reveal-all-wishes-btn');
        if (btn && cards.length > 0) {
            btn.disabled = true;
            btn.textContent = "All Revealed! ✨";
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = "Reveal All 💝";
            }, 3000);
        }
    },
    
    playOpenSound: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
};
