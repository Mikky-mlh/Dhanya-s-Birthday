const wishes = {
    wishesData: [
        { 
            id: 1, 
            text: "May your birthday be filled with laughter, joy, and all the things that make you smile! 🎉", 
            color: "#FF6B9D",
            gradient: "linear-gradient(135deg, #FF6B9D, #FF8FAB)"
        },
        { 
            id: 2, 
            text: "Wishing you endless adventures and unforgettable memories this year! 🌟", 
            color: "#4ECDC4",
            gradient: "linear-gradient(135deg, #4ECDC4, #44A08D)"
        },
        { 
            id: 3, 
            text: "May all your dreams come true and your heart be filled with happiness! 💖", 
            color: "#FFD93D",
            gradient: "linear-gradient(135deg, #FFD93D, #FF9A3C)"
        },
        { 
            id: 4, 
            text: "Here's to another year of being absolutely amazing and inspiring everyone around you! ✨", 
            color: "#A8E6CF",
            gradient: "linear-gradient(135deg, #A8E6CF, #88D8B0)"
        },
        { 
            id: 5, 
            text: "May this year bring you success in everything you do and peace in your heart! 🌈", 
            color: "#FFB6C1",
            gradient: "linear-gradient(135deg, #FFB6C1, #FF69B4)"
        },
        { 
            id: 6, 
            text: "Wishing you countless reasons to smile and endless moments of pure joy! 😊", 
            color: "#DDA0DD",
            gradient: "linear-gradient(135deg, #DDA0DD, #BA55D3)"
        },
        { 
            id: 7, 
            text: "May you always find courage to chase your dreams and strength to overcome any challenge! 💪", 
            color: "#87CEEB",
            gradient: "linear-gradient(135deg, #87CEEB, #00BFFF)"
        },
        { 
            id: 8, 
            text: "Here's to celebrating YOU today and every day! You deserve all the happiness in the world! 🎂", 
            color: "#FFB347",
            gradient: "linear-gradient(135deg, #FFB347, #FF8C00)"
        }
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
            content.style.background = wish.gradient;
            content.innerHTML = `
                <div class="wish-text">${wish.text}</div>
                <div class="wish-hearts">💝</div>
            `;

            wishCard.appendChild(envelope);
            wishCard.appendChild(content);
            container.appendChild(wishCard);

            wishCard.addEventListener('click', () => wishes.openWish(wishCard, wish.id));

            // Staggered entrance animation
            gsap.from(wishCard, {
                y: 80,
                opacity: 0,
                rotation: Math.random() * 10 - 5,
                duration: 0.8,
                delay: index * 0.1,
                ease: "back.out(1.7)"
            });
        });
    },

    openWish: (cardElement, wishId) => {
        if (cardElement.classList.contains('opened')) return;

        cardElement.classList.add('opened');
        wishes.openedWishes.add(wishId);

        wishes.playOpenSound();
        wishes.addSparkles(cardElement);

        const tl = gsap.timeline();

        tl.to(cardElement, {
            scale: 1.15,
            zIndex: 100,
            duration: 0.3,
            ease: "power2.out"
        })
        .to(cardElement, {
            rotateY: 180,
            duration: 0.7,
            ease: "back.out(1.5)",
        })
        .to(cardElement, {
            scale: 1,
            zIndex: 1,
            duration: 0.4,
            ease: "power2.in"
        });

        // Check if all wishes opened
        if (wishes.openedWishes.size === wishes.wishesData.length) {
            setTimeout(() => {
                if (typeof confetti !== 'undefined') {
                    confetti.rain(3000);
                }
            }, 1000);
        }
    },

    revealAll: () => {
        const cards = document.querySelectorAll('.wish-card:not(.opened)');
        cards.forEach((card, i) => {
            const wishId = parseInt(card.dataset.id);
            setTimeout(() => {
                wishes.openWish(card, wishId);
            }, i * 200);
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
    
    addSparkles: (card) => {
        const sparkleCount = 12;
        const rect = card.getBoundingClientRect();
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.textContent = ['✨', '💖', '⭐', '💫'][Math.floor(Math.random() * 4)];
            
            sparkle.style.left = '50%';
            sparkle.style.top = '50%';
            sparkle.style.position = 'absolute';
            sparkle.style.pointerEvents = 'none';
            sparkle.style.zIndex = '200';
            
            card.appendChild(sparkle);

            const angle = (Math.PI * 2 * i) / sparkleCount;
            const distance = 80 + Math.random() * 40;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            gsap.fromTo(sparkle, 
                { scale: 0, opacity: 1 },
                {
                    x: tx,
                    y: ty,
                    opacity: 0,
                    scale: 1.5,
                    rotation: Math.random() * 360,
                    duration: 0.8,
                    ease: "power2.out",
                    onComplete: () => sparkle.remove()
                }
            );
        }
    },
    
    playOpenSound: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Magical chime sound
            const frequencies = [659.25, 783.99, 987.77]; // E5, G5, B5
            
            frequencies.forEach((freq, i) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const startTime = audioContext.currentTime + i * 0.08;
                gainNode.gain.setValueAtTime(0.12, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        } catch (e) {
            // Audio context not supported
        }
    }
};
