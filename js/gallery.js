const gallery = {
    photos: [
        { id: 1,  msg: "Remember this? lol 😂" },
        { id: 2,  msg: "You look so happy here 💖" },
        { id: 3,  msg: "AOT Marathon night! 🎬" },
        { id: 4,  msg: "That time we got lost 🗺️" },
        { id: 5,  msg: "Best food ever 🍕" },
        { id: 6,  msg: "Classic Dhanya moment 😊" },
        { id: 7,  msg: "Don't kill me for this one 😅" },
        { id: 8,  msg: "Happy vibes only ✨" },
        { id: 9,  msg: "Adventure time! 🌟" },
        { id: 10, msg: "Happy Birthday!! 🎂" }
    ],

    rainItems: ['✨', '💖', '🦋', '🌷', '🎂', '💕', '⭐', '💫', '💐', '🌸', '🪷', '🎀', '💝'],
    rainParticles: [],

    init: () => {
        const container = document.getElementById('gallery-container');
        if (!container) return;

        gallery.clearRain();
        container.innerHTML = '';

        const isMobile  = window.innerWidth < 768;
        const radius    = Math.min(window.innerWidth, window.innerHeight) * (isMobile ? 0.38 : 0.33);
        const centerX   = window.innerWidth  / 2;
        const centerY   = window.innerHeight / 2;
        const angleStep = (2 * Math.PI) / gallery.photos.length;

        gallery.photos.forEach((photo, index) => {
            const frame = document.createElement('div');
            frame.className = 'photo-frame';

            const angle = index * angleStep - Math.PI / 2;
            frame.style.left = `${centerX + radius * Math.cos(angle) - 60}px`;
            frame.style.top  = `${centerY + radius * Math.sin(angle) - 60}px`;
            frame.style.willChange = 'transform';

            const rot = Math.random() * 20 - 10;
            frame.dataset.baseRot = rot;

            const img = document.createElement('img');
            img.loading = 'lazy';
            img.src = `assets/images/photos/${photo.id}.jpg`;
            img.alt = `Photo ${photo.id}`;
            img.onerror = function () {
                this.src = `https://picsum.photos/300/400?random=${photo.id}`;
                this.onerror = null;
            };

            const caption = document.createElement('div');
            caption.className = 'photo-caption';
            caption.textContent = photo.msg;

            frame.appendChild(img);
            frame.appendChild(caption);
            frame.onclick = () => gallery.openModal(photo);
            container.appendChild(frame);

            // Entrance — stagger so they pop in one by one
            gsap.from(frame, {
                scale: 0,
                opacity: 0,
                rotation: Math.random() * 60 - 30,
                duration: 0.7,
                delay: index * 0.08,
                ease: 'back.out(1.5)'
            });

            // Gentle idle float
            gsap.to(frame, {
                y: Math.random() * 22 - 11,
                x: Math.random() * 8 - 4,
                rotation: rot + (Math.random() * 5 - 2.5),
                duration: 3 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: Math.random() * 2
            });
        });

        gallery.createRain(container);
    },

    createRain: (container) => {
        // 20 desktop / 10 mobile — down from 40/25. Still looks great, way faster
        const count = window.innerWidth < 768 ? 10 : 20;

        for (let i = 0; i < count; i++) {
            const el = document.createElement('div');
            el.className = 'rain-particle';
            el.textContent = gallery.rainItems[Math.floor(Math.random() * gallery.rainItems.length)];

            const size = Math.random() * 18 + 13;
            el.style.cssText = `
                font-size: ${size}px;
                opacity: ${Math.random() * 0.45 + 0.15};
                left: ${Math.random() * 100}vw;
                top: -50px;
                will-change: transform;
            `;

            container.appendChild(el);
            gallery.rainParticles.push(el);

            gsap.to(el, {
                y: '115vh',
                x: Math.random() * 90 - 45,
                rotation: Math.random() * 600 - 300,
                duration: Math.random() * 9 + 8,
                ease: 'none',
                repeat: -1,
                delay: Math.random() * 9,
                // Reset position on repeat so it looks like continuous rain
                onRepeat: () => {
                    el.style.left = `${Math.random() * 100}vw`;
                }
            });
        }
    },

    clearRain: () => {
        gallery.rainParticles.forEach(p => {
            if (p && p.parentNode) {
                gsap.killTweensOf(p);
                p.parentNode.removeChild(p);
            }
        });
        gallery.rainParticles = [];
    },

    openModal: (photoData) => {
        const modal = document.getElementById('photo-modal');
        const img   = document.getElementById('modal-img');
        const msg   = document.getElementById('modal-msg');

        img.src = `assets/images/photos/${photoData.id}.jpg`;
        img.onerror = function () {
            this.src = `https://picsum.photos/400/600?random=${photoData.id}`;
            this.onerror = null;
        };
        msg.textContent = photoData.msg;

        // ── Fix the modal flash bug ──────────────────────────────────────
        // We must set display BEFORE animating opacity, otherwise GSAP
        // animates an invisible element and you get a sudden pop-in.
        modal.classList.remove('hidden');
        modal.classList.add('active');
        modal.style.opacity = '0';

        gsap.to(modal, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Prevent body scroll while modal open
        document.body.style.overflow = 'hidden';
    },

    closeModal: () => {
        const modal = document.getElementById('photo-modal');
        gsap.to(modal, {
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
                modal.classList.remove('active');
                modal.classList.add('hidden');
                modal.style.opacity = '';
                document.body.style.overflow = '';
            }
        });
    }
};

// Debounced resize — only re-init gallery after user stops resizing
let _resizeTimer = null;
window.addEventListener('resize', () => {
    const screen = document.getElementById('screen-gallery');
    if (!screen || screen.classList.contains('hidden')) return;
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(gallery.init, 350);
});