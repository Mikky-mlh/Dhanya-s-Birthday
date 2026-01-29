const reasons = {
    // ... (keep reasonsList as is) ...
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

            // Front
            const front = document.createElement('div');
            front.className = 'reason-front';
            front.innerHTML = `<div class="reason-number">${index + 1}</div><div class="reason-icon">⭐</div>`;

            // Back
            const back = document.createElement('div');
            back.className = 'reason-back';
            back.innerHTML = `<p>${reason}</p>`;

            reasonCard.appendChild(front);
            reasonCard.appendChild(back);
            container.appendChild(reasonCard);

            reasonCard.addEventListener('click', () => reasons.reveal(reasonCard, index));

            gsap.from(reasonCard, {
                scale: 0.8,
                opacity: 0,
                duration: 0.4,
                delay: index * 0.03,
                ease: "back.out(1.7)"
            });
        });
    },

    reveal: (card, index) => {
        if (card.classList.contains('revealed')) return;

        card.classList.add('revealed');
        reasons.revealed.add(index);

        // --- NEW IMPRESSIVELY SMOOTH ANIMATION ---
        const tl = gsap.timeline();

        // 1. Pop up slightly
        tl.to(card, {
            scale: 1.1,
            zIndex: 50,
            duration: 0.2,
            ease: "power1.out"
        })
        // 2. Flip around center
        .to(card, {
            rotateY: 180,
            duration: 0.5,
            ease: "power2.inOut",
        })
        // 3. Settle back down
        .to(card, {
            scale: 1,
            zIndex: 1,
            duration: 0.3,
            ease: "power1.in"
        });

        reasons.addSparkles(card);
        reasons.playRevealSound(index);
    },

    // ... (keep revealAll, addSparkles, playRevealSound as is) ...
    revealAll: () => {
        const cards = document.querySelectorAll('.reason-card:not(.revealed)');
        cards.forEach((card, i) => {
            const index = parseInt(card.dataset.index);
            setTimeout(() => {
                reasons.reveal(card, index);
            }, i * 100);
        });

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
        
        // Fix: Ensure sparkles are positioned relative to the card container correctly
        // Use card's offsetParent for cleaner positioning if needed, or simple append
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = '✨';
            
            // Randomize start position near center of card
            sparkle.style.left = '50%';
            sparkle.style.top = '50%';
            
            card.appendChild(sparkle); // Append to card so it moves with it

            const angle = (Math.PI * 2 * i) / sparkleCount;
            const distance = 60 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            gsap.to(sparkle, {
                x: tx,
                y: ty,
                opacity: 0,
                scale: 0,
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => sparkle.remove()
            });
        }
    },
    
    playRevealSound: (index) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        const frequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
        oscillator.frequency.value = frequencies[index % frequencies.length];
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
};