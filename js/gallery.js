const gallery = {
    photos: [
        { id: 1, msg: "Remember this? lol" },
        { id: 2, msg: "You look so happy here" },
        { id: 3, msg: "AOT Marathon night!" },
        { id: 4, msg: "That time we got lost" },
        { id: 5, msg: "Best food ever" },
        { id: 6, msg: "Classic Dhanya moment" },
        { id: 7, msg: "Don't kill me for this one" },
        { id: 8, msg: "Happy vibes only" },
        { id: 9, msg: "Adventure time" },
        { id: 10, msg: "Happy Birthday!!" }
    ],

    rainItems: ['✨', '💖', '🦋', '🌷', '🎂' , '💕', '⭐', '💫', '💐', '🌸', '💮', '🪷', '🌹', '🌺'],
    rainParticles: [],
    resizeTimeout: null,
    isInitialized: false,

    init: () => {
        const container = document.getElementById('gallery-container');
        if (!container) return;

        // Prevent multiple initializations
        if (gallery.isInitialized) {
            gallery.clearRain();
        }
        
        gallery.isInitialized = true;
        container.innerHTML = '';

        const angleStep = (2 * Math.PI) / gallery.photos.length;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = Math.min(window.innerWidth, window.innerHeight) * (window.innerWidth < 768 ? 0.4 : 0.35);

        gallery.photos.forEach((photo, index) => {
            const frame = document.createElement('div');
            frame.className = 'photo-frame';

            const angle = index * angleStep;
            const x = centerX + radius * Math.cos(angle) - 60;
            const y = centerY + radius * Math.sin(angle) - 60;

            frame.style.left = `${x}px`;
            frame.style.top = `${y}px`;
            frame.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;

            const img = document.createElement('img');
            img.loading = 'lazy';
            img.decoding = 'async';
            img.src = `assets/images/photos/${photo.id}.jpg`;
            img.alt = `Photo ${photo.id}`;

            img.onerror = function() {
                this.src = 'https://placehold.co/300x400?text=Photo+' + photo.id;
                this.onerror = null;
            };

            frame.appendChild(img);
            frame.onclick = () => gallery.openModal(photo);
            container.appendChild(frame);

            // Smoother floating animation
            const duration = 2.5 + Math.random() * 1.5;
            gsap.to(frame, {
                y: Math.random() * 15 - 7.5,
                duration: duration,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 2
            });
        });

        gallery.createRain(container);
    },

    createRain: (container) => {
        const particleCount = window.innerWidth < 768 ? 15 : 25; // Reduced count

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'rain-particle';
            
            particle.innerText = gallery.rainItems[Math.floor(Math.random() * gallery.rainItems.length)];
            
            const fontSize = Math.random() * 15 + 12; // Smaller on average
            particle.style.fontSize = `${fontSize}px`;
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            
            const startX = Math.random() * 100;
            particle.style.left = `${startX}vw`;
            particle.style.top = '-30px';

            container.appendChild(particle);
            gallery.rainParticles.push(particle);

            const duration = Math.random() * 4 + 4;
            gsap.to(particle, {
                y: '110vh',
                x: `+=${Math.random() * 80 - 40}`,
                rotation: Math.random() * 180,
                duration: duration,
                ease: "none",
                repeat: -1,
                delay: Math.random() * 4
            });
        }
    },

    clearRain: () => {
        gallery.rainParticles.forEach(particle => {
            if (particle && particle.parentNode) {
                gsap.killTweensOf(particle);
                particle.parentNode.removeChild(particle);
            }
        });
        gallery.rainParticles = [];
    },

    openModal: (photoData) => {
        const modal = document.getElementById('photo-modal');
        const img = document.getElementById('modal-img');
        const msg = document.getElementById('modal-msg');

        img.src = `assets/images/photos/${photoData.id}.jpg`;
        img.onerror = function() {
            this.src = 'https://placehold.co/400x600?text=Photo+' + photoData.id;
        };
        msg.textContent = photoData.msg;

        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    },

    closeModal: () => {
        const modal = document.getElementById('photo-modal');
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
};

// Throttled resize handler
window.addEventListener('resize', () => {
    const galleryScreen = document.getElementById('screen-gallery');
    if (galleryScreen && !galleryScreen.classList.contains('hidden')) {
        if (gallery.resizeTimeout) {
            clearTimeout(gallery.resizeTimeout);
        }
        
        gallery.resizeTimeout = setTimeout(() => {
            if (gallery.isInitialized) {
                requestAnimationFrame(() => gallery.init());
            }
        }, 250);
    }
});