var app = {
    currentGame: null,
    mainBGM: null,
    parallaxScene: null,
    
    init: () => {
        setTimeout(() => {
            app.hideLoadingScreen();
            app.showScreen('screen-gallery');
        }, 1500);
    },
    
    hideLoadingScreen: () => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    },
    
    showScreen: (screenId) => {
        if (screenId !== 'screen-gallery') {
            app.stopMainBGM();
        }

        if (typeof destroyWhackGame === 'function') {
            destroyWhackGame();
        }
        if (app.parallaxScene) {
            app.parallaxScene.destroy();
            app.parallaxScene = null;
        }

        document.querySelectorAll('.screen').forEach(el => {
            el.classList.remove('active');
            setTimeout(() => {
                el.classList.add('hidden');
            }, 300);
        });

        const target = document.getElementById(screenId);
        target.classList.remove('hidden');

        target.style.opacity = '1';
        target.style.visibility = 'visible';

        requestAnimationFrame(() => {
            target.classList.add('active');

            if (screenId === 'screen-whack') {
                if (typeof initWhackGame === 'function') {
                    initWhackGame();
                }
            } else if (screenId === 'screen-wishes') {
                if (typeof wishes !== 'undefined' && wishes.init) {
                    wishes.init();
                }
            } else if (screenId === 'screen-reasons') {
                if (typeof reasons !== 'undefined' && reasons.init) {
                    reasons.init();
                }
            } else if (screenId === 'screen-final') {
                if (typeof showFinalMessage === 'function') {
                    showFinalMessage();
                }
            } else if (screenId === 'scene-screen') {
                if (typeof ParallaxScene !== 'undefined') {
                    if (!app.parallaxScene) {
                        app.parallaxScene = new ParallaxScene();
                    }
                    app.parallaxScene.init();
                } else {
                    console.error('ParallaxScene is not defined');
                }
            } else if (screenId === 'screen-gallery') {
                if (typeof gallery !== 'undefined' && gallery.init) {
                    gallery.init();
                }
                app.addFlowersToScreen();
                app.playMainBGM();
            }
        });
    },

    playMainBGM: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop = true;
            app.mainBGM.volume = 0.9;
        }
        app.mainBGM.play().catch(e => console.log('BGM play failed:', e));
    },

    stopMainBGM: () => {
        if (app.mainBGM) {
            app.mainBGM.pause();
            app.mainBGM.currentTime = 0;
        }
    },

    addFlowersToScreen: () => {
        const flowersContainer = document.getElementById('flowers-container');
        if (!flowersContainer) return;

        // Clear previous flowers
        flowersContainer.innerHTML = '';

        // Add 20-30 flowers randomly positioned
        const flowerCount = 25;

        for (let i = 0; i < flowerCount; i++) {
            const flower = document.createElement('img');
            flower.className = 'flower';

            // Randomly select a flower image (flower1 to flower5)
            const flowerNumber = Math.floor(Math.random() * 5) + 1;
            flower.src = `assets/images/main-screen/flower${flowerNumber}.png`;

            // Fallback to emoji if images don't load
            flower.onerror = function() {
                const flowerEmojis = ['🌸', '🌺', '🌻', '🌹', '🌷'];
                const fallbackDiv = document.createElement('div');
                fallbackDiv.className = 'flower';
                fallbackDiv.style.fontSize = '40px';
                fallbackDiv.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
                fallbackDiv.style.left = this.style.left;
                fallbackDiv.style.top = this.style.top;
                fallbackDiv.style.transform = this.style.transform;
                this.parentNode.replaceChild(fallbackDiv, this);
            };

            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;

            flower.style.left = `${posX}%`;
            flower.style.top = `${posY}%`;

            // Random rotation
            const rotation = Math.random() * 360;
            flower.style.transform = `rotate(${rotation}deg)`;

            // Random size variation
            const sizeVariation = 0.7 + Math.random() * 0.6; // Between 0.7x and 1.3x original size
            flower.style.width = `${80 * sizeVariation}px`;

            // Add floating animation using GSAP if available
            if (typeof gsap !== 'undefined') {
                gsap.to(flower, {
                    y: Math.random() * 20 - 10,
                    duration: 3 + Math.random() * 3,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: Math.random() * 2
                });
            }

            flowersContainer.appendChild(flower);
        }
    }
};

function showFinalMessage() {
    const text = "Happy Birthday Dhanya! 🎂\n\nOn this special day, I want you to know how much you mean to me. Your smile lights up every room, and your kindness touches everyone around you.\n\nMay this year bring you endless joy, amazing adventures, and all the happiness you deserve. Here's to another year of wonderful memories together!\n\nThank you for being such an incredible person. Wishing you the best birthday ever!";
    
    const typewriterEl = document.getElementById('typewriter-text');
    if (!typewriterEl) return;
    
    typewriterEl.textContent = '';
    let index = 0;
    
    function typeWriter() {
        if (index < text.length) {
            typewriterEl.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 30);
        }
    }
    
    typeWriter();
    
    const finalBGM = document.getElementById('bgm-final');
    if (finalBGM) {
        finalBGM.play().catch(e => console.log('Audio play failed:', e));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}
