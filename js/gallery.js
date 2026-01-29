const gallery = {
    photos: [
        { id: 1, msg: "Remember this? lol 😂" },
        { id: 2, msg: "You look so happy here 💖" },
        { id: 3, msg: "AOT Marathon night! 🎬" },
        { id: 4, msg: "That time we got lost 🗺️" },
        { id: 5, msg: "Best food ever 🍕" },
        { id: 6, msg: "Classic Dhanya moment 😊" },
        { id: 7, msg: "Don't kill me for this one 😅" },
        { id: 8, msg: "Happy vibes only ✨" },
        { id: 9, msg: "Adventure time! 🌟" },
        { id: 10, msg: "Happy Birthday!! 🎂" }
    ],

    rainItems: ['✨', '💖', '🦋', '🌷', '🎂', '💕', '⭐', '💫', '💐', '🌸', '💮', '🪷', '🌹', '🌺', '🎀', '💝'],
    rainParticles: [],

    init: () => {
        const container = document.getElementById('gallery-container');
        if (!container) return;

        gallery.clearRain();
        container.innerHTML = '';

        const angleStep = (2 * Math.PI) / gallery.photos.length;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = Math.min(window.innerWidth, window.innerHeight) * (window.innerWidth < 768 ? 0.38 : 0.33);

        gallery.photos.forEach((photo, index) => {
            const frame = document.createElement('div');
            frame.className = 'photo-frame';

            const angle = index * angleStep - Math.PI / 2; // Start from top
            const x = centerX + radius * Math.cos(angle) - 60;
            const y = centerY + radius * Math.sin(angle) - 60;

            frame.style.left = `${x}px`;
            frame.style.top = `${y}px`;
            
            const initialRotation = Math.random() * 20 - 10;
            frame.style.transform = `rotate(${initialRotation}deg)`;

            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = `assets/images/photos/${photo.id}.jpg`;
            img.alt = `Photo ${photo.id}`;

            img.onerror = function() {
                this.src = `https://picsum.photos/300/400?random=${photo.id}`;
                this.onerror = null;
            };

            frame.appendChild(img);
            frame.onclick = () => gallery.openModal(photo);
            container.appendChild(frame);

            // Staggered entrance animation
            gsap.from(frame, {
                scale: 0,
                opacity: 0,
                rotation: Math.random() * 60 - 30,
                duration: 0.8,
                delay: index * 0.1,
                ease: "back.out(1.7)"
            });

            // Floating animation
            gsap.to(frame, {
                y: Math.random() * 25 - 12,
                x: Math.random() * 10 - 5,
                rotation: initialRotation + (Math.random() * 6 - 3),
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 2
            });
        });

        gallery.createRain(container);
    },

    createRain: (container) => {
        const particleCount = window.innerWidth < 768 ? 25 : 40;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'rain-particle';
            
            particle.innerText = gallery.rainItems[Math.floor(Math.random() * gallery.rainItems.length)];
            
            const fontSize = Math.random() * 20 + 15;
            particle.style.fontSize = `${fontSize}px`;
            particle.style.opacity = Math.random() * 0.5 + 0.2;
            
            const startX = Math.random() * 100;
            particle.style.left = `${startX}vw`;
            particle.style.top = '-50px';

            container.appendChild(particle);
            gallery.rainParticles.push(particle);

            // Create swaying rain effect
            const duration = Math.random() * 8 + 8;
            const swayAmount = Math.random() * 100 - 50;
            
            gsap.to(particle, {
                y: '120vh',
                x: swayAmount,
                rotation: Math.random() * 720 - 360,
                duration: duration,
                ease: "none",
                repeat: -1,
                delay: Math.random() * 8
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
            this.src = `https://picsum.photos/400/600?random=${photoData.id}`;
        };
        msg.textContent = photoData.msg;

        modal.classList.remove('hidden');
        
        // Animate modal in
        gsap.fromTo(modal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
        );
        
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    },

    closeModal: () => {
        const modal = document.getElementById('photo-modal');
        
        gsap.to(modal, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                modal.classList.remove('active');
                modal.classList.add('hidden');
            }
        });
    }
};

// Handle resize
window.addEventListener('resize', () => {
    const galleryScreen = document.getElementById('screen-gallery');
    if (galleryScreen && !galleryScreen.classList.contains('hidden')) {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            gallery.init();
        }, 300);
    }
});
