var app = {
    currentGame: null,
    mainBGM: null,
    parallaxScene: null,
    isMusicPlaying: false,
    countdownInterval: null,
    
    // Set Dhanya's birthday here (Month is 0-indexed: January = 0)
    birthdayDate: new Date(new Date().getFullYear(), 0, 15), // January 15th
    
    init: () => {
        // Initialize particles
        app.createParticles();
        
        // Start countdown if applicable
        app.initCountdown();
        
        // Enhanced loading sequence
        setTimeout(() => {
            app.hideLoadingScreen();
            app.showScreen('screen-gallery');
        }, 2500);
    },
    
    hideLoadingScreen: () => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 800);
        }
    },
    
    // Birthday Countdown Feature
    initCountdown: () => {
        const countdownEl = document.getElementById('birthday-countdown');
        if (!countdownEl) return;
        
        const now = new Date();
        let birthday = new Date(app.birthdayDate);
        
        // If birthday has passed this year, set for next year
        if (now > birthday) {
            birthday.setFullYear(birthday.getFullYear() + 1);
        }
        
        const diff = birthday - now;
        
        // Only show countdown if birthday is within 30 days
        if (diff > 0 && diff < 30 * 24 * 60 * 60 * 1000) {
            countdownEl.style.display = 'block';
            app.updateCountdown(birthday);
            app.countdownInterval = setInterval(() => app.updateCountdown(birthday), 1000);
        }
    },
    
    updateCountdown: (birthday) => {
        const now = new Date();
        const diff = birthday - now;
        
        if (diff <= 0) {
            clearInterval(app.countdownInterval);
            document.getElementById('birthday-countdown').innerHTML = '<div class="countdown-title">🎉 Happy Birthday! 🎉</div>';
            confetti.burst();
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('countdown-days').textContent = String(days).padStart(2, '0');
        document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdown-mins').textContent = String(mins).padStart(2, '0');
        document.getElementById('countdown-secs').textContent = String(secs).padStart(2, '0');
    },
    
    // Floating Particles Background
    createParticles: () => {
        const container = document.getElementById('particles-container');
        if (!container) return;
        
        const particleEmojis = ['💖', '✨', '🌸', '💫', '🦋', '💕', '⭐', '🎀', '💗', '🌷'];
        const particleCount = window.innerWidth < 768 ? 15 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
            
            const size = Math.random() * 20 + 15;
            particle.style.fontSize = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 10}s`;
            particle.style.opacity = Math.random() * 0.5 + 0.3;
            
            container.appendChild(particle);
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

        // Animate out current screen
        document.querySelectorAll('.screen').forEach(el => {
            if (el.classList.contains('active')) {
                gsap.to(el, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.5,
                    ease: "power2.inOut",
                    onComplete: () => {
                        el.classList.remove('active');
                        el.classList.add('hidden');
                    }
                });
            }
        });

        const target = document.getElementById(screenId);
        target.classList.remove('hidden');

        target.style.opacity = '0';
        target.style.scale = '0.95';
        target.style.visibility = 'visible';

        // Animate in new screen
        gsap.to(target, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: 0.1,
            ease: "power2.out",
            onComplete: () => {
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
                    }
                } else if (screenId === 'screen-gallery') {
                    if (typeof gallery !== 'undefined' && gallery.init) {
                        gallery.init();
                    }
                    app.addFlowersToScreen();
                    app.playMainBGM();
                }
            }
        });
    },

    playMainBGM: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop = true;
            app.mainBGM.volume = 0.7;
        }
        
        app.mainBGM.play().then(() => {
            app.isMusicPlaying = true;
            app.updateMusicToggle();
        }).catch(e => {
            console.log('BGM play failed (user interaction required):', e);
            app.isMusicPlaying = false;
            app.updateMusicToggle();
        });
    },

    stopMainBGM: () => {
        if (app.mainBGM) {
            app.mainBGM.pause();
            app.mainBGM.currentTime = 0;
            app.isMusicPlaying = false;
            app.updateMusicToggle();
        }
    },
    
    toggleMusic: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop = true;
            app.mainBGM.volume = 0.7;
        }
        
        if (app.isMusicPlaying) {
            app.mainBGM.pause();
            app.isMusicPlaying = false;
        } else {
            app.mainBGM.play().catch(e => console.log('Audio error:', e));
            app.isMusicPlaying = true;
        }
        
        app.updateMusicToggle();
    },
    
    updateMusicToggle: () => {
        const toggleBtn = document.getElementById('music-toggle');
        if (toggleBtn) {
            toggleBtn.textContent = app.isMusicPlaying ? '🔊' : '🔇';
            toggleBtn.classList.toggle('playing', app.isMusicPlaying);
        }
    },

    addFlowersToScreen: () => {
        const flowersContainer = document.getElementById('flowers-container');
        if (!flowersContainer) return;

        flowersContainer.innerHTML = '';

        const flowerCount = window.innerWidth < 768 ? 15 : 25;

        for (let i = 0; i < flowerCount; i++) {
            const flower = document.createElement('img');
            flower.className = 'flower';

            const flowerNumber = Math.floor(Math.random() * 5) + 1;
            flower.src = `assets/images/main-screen/flower${flowerNumber}.png`;

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

            const posX = Math.random() * 100;
            const posY = Math.random() * 100;

            flower.style.left = `${posX}%`;
            flower.style.top = `${posY}%`;

            const rotation = Math.random() * 360;
            flower.style.transform = `rotate(${rotation}deg)`;

            const sizeVariation = 0.6 + Math.random() * 0.6;
            flower.style.width = `${70 * sizeVariation}px`;

            if (typeof gsap !== 'undefined') {
                gsap.to(flower, {
                    y: Math.random() * 20 - 10,
                    x: Math.random() * 10 - 5,
                    rotation: `+=${Math.random() * 20 - 10}`,
                    duration: 4 + Math.random() * 3,
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

// Enhanced Final Message with better typewriter effect
function showFinalMessage() {
    const text = `Happy Birthday, Dhanya! 🎂

On this special day, I want you to know how truly remarkable you are. Your smile has the power to brighten even the darkest days, and your kindness touches everyone fortunate enough to know you.

Every moment with you is a treasure, and I'm grateful for all the memories we've shared. You deserve all the happiness in the world and then some more!

May this year bring you endless adventures, beautiful surprises, and all your dreams coming true. Here's to celebrating YOU – today and every day!

Thank you for being such an incredible person. Wishing you the most magical birthday ever! 🌟`;
    
    const typewriterEl = document.getElementById('typewriter-text');
    const cursorEl = document.querySelector('.typewriter-cursor');
    if (!typewriterEl) return;
    
    typewriterEl.textContent = '';
    let index = 0;
    
    function typeWriter() {
        if (index < text.length) {
            typewriterEl.textContent += text.charAt(index);
            index++;
            
            // Vary typing speed for more natural feel
            const char = text.charAt(index - 1);
            let delay = 25;
            if (char === '.' || char === '!' || char === '?') delay = 150;
            else if (char === ',') delay = 80;
            else if (char === '\n') delay = 100;
            
            setTimeout(typeWriter, delay);
        } else {
            // Hide cursor when done
            if (cursorEl) {
                setTimeout(() => {
                    cursorEl.style.display = 'none';
                }, 500);
            }
            // Trigger celebration confetti
            setTimeout(() => {
                if (typeof confetti !== 'undefined') {
                    confetti.burst();
                }
            }, 1000);
        }
    }
    
    // Show cursor
    if (cursorEl) {
        cursorEl.style.display = 'inline-block';
    }
    
    setTimeout(typeWriter, 500);
}

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}
