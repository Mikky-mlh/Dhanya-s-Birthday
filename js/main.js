var app = {
    currentGame: null,
    mainBGM: null,
    parallaxScene: null,
    isTransitioning: false,
    resizeThrottleTimer: null,
    
    init: () => {
        // Initialize with hardware acceleration hints
        document.documentElement.style.setProperty('--scrollbar-width', (window.innerWidth - document.documentElement.clientWidth) + 'px');
        
        // Preload critical assets
        app.preloadCriticalAssets();
        
        setTimeout(() => {
            app.hideLoadingScreen();
            app.showScreen('screen-gallery');
        }, 1500);
    },
    
    preloadCriticalAssets: () => {
        // Preload gallery images
        const preloadImages = [];
        for (let i = 1; i <= 10; i++) {
            const img = new Image();
            img.src = `assets/images/photos/${i}.jpg`;
            preloadImages.push(img);
        }
        
        // Preload main BGM
        app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
        app.mainBGM.preload = 'auto';
        app.mainBGM.loop = true;
        app.mainBGM.volume = 0.7;
    },
    
    hideLoadingScreen: () => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Use hardware-accelerated transform instead of opacity for better performance
            gsap.to(loadingScreen, {
                opacity: 0,
                scale: 0.95,
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => {
                    loadingScreen.style.display = 'none';
                    // Force GPU layer creation
                    loadingScreen.style.willChange = 'auto';
                }
            });
        }
    },
    
    showScreen: (screenId) => {
        if (app.isTransitioning) return;
        app.isTransitioning = true;
        
        if (screenId !== 'screen-gallery') {
            app.stopMainBGM();
        }

        // Clean up previous screens efficiently
        app.cleanupPreviousScreen();
        
        // Fade out current screen
        const currentScreens = document.querySelectorAll('.screen.active');
        currentScreens.forEach(el => {
            el.style.willChange = 'transform, opacity';
            gsap.to(el, {
                opacity: 0,
                scale: 0.95,
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    el.classList.remove('active');
                    el.classList.add('hidden');
                    el.style.willChange = 'auto';
                }
            });
        });

        const target = document.getElementById(screenId);
        target.classList.remove('hidden');
        
        // Prepare target for animation
        target.style.opacity = '0';
        target.style.scale = '0.95';
        target.style.visibility = 'visible';
        target.style.willChange = 'transform, opacity';

        // Animate in the new screen with improved timing
        gsap.to(target, {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: 0.15,
            ease: "power3.out",
            onComplete: () => {
                target.classList.add('active');
                target.style.willChange = 'auto';
                
                // Initialize screen content
                app.initializeScreenContent(screenId);
                
                app.isTransitioning = false;
            }
        });
    },
    
    cleanupPreviousScreen: () => {
        // Use requestIdleCallback for non-critical cleanup
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                if (typeof destroyWhackGame === 'function') {
                    destroyWhackGame();
                }
                if (app.parallaxScene) {
                    app.parallaxScene.destroy();
                    app.parallaxScene = null;
                }
            });
        } else {
            setTimeout(() => {
                if (typeof destroyWhackGame === 'function') {
                    destroyWhackGame();
                }
                if (app.parallaxScene) {
                    app.parallaxScene.destroy();
                    app.parallaxScene = null;
                }
            }, 300);
        }
    },
    
    initializeScreenContent: (screenId) => {
        const initFunctions = {
            'screen-whack': () => {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    if (typeof initWhackGame === 'function') {
                        initWhackGame();
                    }
                }, 50);
            },
            'screen-wishes': () => {
                if (typeof wishes !== 'undefined' && wishes.init) {
                    requestAnimationFrame(() => wishes.init());
                }
            },
            'screen-reasons': () => {
                if (typeof reasons !== 'undefined' && reasons.init) {
                    requestAnimationFrame(() => reasons.init());
                }
            },
            'screen-final': () => {
                if (typeof showFinalMessage === 'function') {
                    requestAnimationFrame(() => showFinalMessage());
                }
            },
            'scene-screen': () => {
                if (typeof ParallaxScene !== 'undefined') {
                    if (!app.parallaxScene) {
                        app.parallaxScene = new ParallaxScene();
                    }
                    requestAnimationFrame(() => app.parallaxScene.init());
                }
            },
            'screen-gallery': () => {
                if (typeof gallery !== 'undefined' && gallery.init) {
                    // Use requestAnimationFrame for smoother initialization
                    requestAnimationFrame(() => {
                        gallery.init();
                        app.addFlowersToScreen();
                        app.playMainBGM();
                    });
                }
            }
        };
        
        if (initFunctions[screenId]) {
            initFunctions[screenId]();
        }
    },

    playMainBGM: () => {
        if (!app.mainBGM) {
            app.mainBGM = new Audio('assets/audio/bgm/bgm-main.mp3');
            app.mainBGM.loop = true;
            app.mainBGM.volume = 0.7;
        }
        
        // Fade in audio
        app.mainBGM.volume = 0;
        app.mainBGM.play().catch(e => console.log('BGM play failed:', e));
        
        gsap.to(app.mainBGM, {
            volume: 0.7,
            duration: 1.5,
            ease: "power2.out"
        });
    },

    stopMainBGM: () => {
        if (app.mainBGM) {
            gsap.to(app.mainBGM, {
                volume: 0,
                duration: 0.8,
                ease: "power2.in",
                onComplete: () => {
                    app.mainBGM.pause();
                    app.mainBGM.currentTime = 0;
                }
            });
        }
    },

    addFlowersToScreen: () => {
        const flowersContainer = document.getElementById('flowers-container');
        if (!flowersContainer) return;

        // Clear previous flowers efficiently
        while (flowersContainer.firstChild) {
            flowersContainer.removeChild(flowersContainer.firstChild);
        }

        const flowerCount = window.innerWidth < 768 ? 20 : 30; // Reduced count for better performance
        const flowerEmojis = ['🌸', '🌺', '🌻', '🌹', '🌷'];

        // Use DocumentFragment for batch DOM operations
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < flowerCount; i++) {
            const flower = document.createElement('div');
            flower.className = 'flower';

            // Use emoji as fallback - lighter than images
            const useEmoji = Math.random() > 0.5 || window.innerWidth < 768;
            
            if (useEmoji) {
                flower.textContent = flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)];
                flower.style.fontSize = '40px';
                flower.style.display = 'flex';
                flower.style.alignItems = 'center';
                flower.style.justifyContent = 'center';
            } else {
                const img = document.createElement('img');
                const flowerNumber = Math.floor(Math.random() * 5) + 1;
                img.src = `assets/images/main-screen/flower${flowerNumber}.png`;
                img.alt = 'Flower';
                img.loading = 'lazy';
                flower.appendChild(img);
            }

            const posX = Math.random() * 100;
            const posY = Math.random() * 100;

            flower.style.left = `${posX}%`;
            flower.style.top = `${posY}%`;

            const rotation = Math.random() * 360;
            const sizeVariation = 0.7 + Math.random() * 0.6;
            
            flower.style.transform = `rotate(${rotation}deg) scale(${sizeVariation})`;
            flower.style.transformOrigin = 'center';
            
            if (useEmoji) {
                flower.style.width = '40px';
                flower.style.height = '40px';
            } else {
                flower.style.width = `${80 * sizeVariation}px`;
            }

            // Smoother floating animation
            if (typeof gsap !== 'undefined') {
                const duration = 4 + Math.random() * 3;
                const delay = Math.random() * 2;
                
                gsap.to(flower, {
                    y: Math.random() * 15 - 7.5,
                    rotation: rotation + Math.random() * 20 - 10,
                    duration: duration,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: delay
                });
            }

            fragment.appendChild(flower);
        }

        flowersContainer.appendChild(fragment);
    },

    // Handle resize events smoothly
    handleResize: () => {
        if (app.resizeThrottleTimer) {
            clearTimeout(app.resizeThrottleTimer);
        }
        
        app.resizeThrottleTimer = setTimeout(() => {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen) {
                const screenId = activeScreen.id;
                
                // Only reinitialize certain screens on resize
                if (screenId === 'screen-gallery' && typeof gallery !== 'undefined' && gallery.init) {
                    requestAnimationFrame(() => gallery.init());
                }
                
                // Update flower positions
                if (screenId === 'screen-gallery') {
                    app.addFlowersToScreen();
                }
            }
        }, 200);
    }
};

// Add resize listener with throttling
window.addEventListener('resize', app.handleResize);

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
    
    // Small delay before starting for smoother experience
    setTimeout(typeWriter, 300);
    
    const finalBGM = document.getElementById('bgm-final');
    if (finalBGM) {
        finalBGM.volume = 0;
        finalBGM.play().catch(e => console.log('Audio play failed:', e));
        
        gsap.to(finalBGM, {
            volume: 0.8,
            duration: 1.5,
            ease: "power2.out"
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
} else {
    app.init();
}