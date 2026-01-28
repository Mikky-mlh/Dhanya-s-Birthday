let whackGame = null;

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const { width, height } = this.cameras.main;
        
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x1a1a1a, 0.9);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 30, 320, 60, 10);
        progressBox.lineStyle(3, 0xFF6B9D, 1);
        progressBox.strokeRoundedRect(width / 2 - 160, height / 2 - 30, 320, 60, 10);
        
        const progressBar = this.add.graphics();
        
        const loadingText = this.add.text(width / 2, height / 2 - 60, 'LOADING', {
            fontSize: '28px',
            fontFamily: 'Poppins',
            fill: '#FFD700',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xFF6B9D, 1);
            progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 8);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        this.load.image('target1', 'assets/images/whack/target1.png');
        this.load.image('target2', 'assets/images/whack/target2.png');
        this.load.image('target3', 'assets/images/whack/target3.png');
        this.load.image('target4', 'assets/images/whack/target4.png');
        this.load.image('hammer', 'assets/images/whack/hammer.png');
        this.load.image('bomb', 'assets/images/whack/bomb.png');
        this.load.image('game-bg', 'assets/images/whack/bg.jpg');
        this.load.audio('hit-sound', 'assets/audio/sfx/target-hit.mp3');
        this.load.audio('bomb-sound', 'assets/audio/sfx/bomb.mp3');
        this.load.audio('whack-bgm', 'assets/audio/bgm/whack-bgm.mp3');
        
        this.load.on('loaderror', (file) => console.warn(`Failed: ${file.src}`));
    }

    create() {
        this.scene.start('MenuScene');
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        const gradient = this.add.graphics();
        gradient.fillGradientStyle(0x2D0A1F, 0x2D0A1F, 0x5C1A3D, 0x5C1A3D, 1);
        gradient.fillRect(0, 0, width, height);

        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 6);
            const particle = this.add.circle(x, y, size, 0xFF6B9D, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(100, 300),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 7000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = height + 20;
                    particle.alpha = 0.3;
                }
            });
        }

        const panel = this.add.graphics();
        panel.fillStyle(0x1a0a14, 0.85);
        panel.fillRoundedRect(width / 2 - 280, height / 2 - 220, 560, 440, 20);
        panel.lineStyle(4, 0xFF6B9D, 1);
        panel.strokeRoundedRect(width / 2 - 280, height / 2 - 220, 560, 440, 20);
        
        panel.lineStyle(2, 0xFFD700, 0.5);
        panel.strokeRoundedRect(width / 2 - 270, height / 2 - 210, 540, 420, 18);

        const title = this.add.text(width / 2, height / 2 - 160, 'WHACK-A-MOLE', {
            fontSize: '56px',
            fontFamily: 'Playfair Display',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            scale: { from: 1, to: 1.08 },
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const subtitle = this.add.text(width / 2, height / 2 - 100, 'Release Your Fury!', {
            fontSize: '22px',
            fontFamily: 'Poppins',
            fill: '#FF6B9D',
            fontStyle: '600'
        }).setOrigin(0.5);

        const highScore = localStorage.getItem('whackHighScore') || 0;
        const hsText = this.add.text(width / 2, height / 2 - 55, `🏆 ${highScore}`, {
            fontSize: '32px',
            fontFamily: 'Poppins',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const divider = this.add.graphics();
        divider.lineStyle(2, 0xFF6B9D, 0.5);
        divider.lineBetween(width / 2 - 200, height / 2 - 20, width / 2 + 200, height / 2 - 20);

        const rules = [
            { icon: '🎯', text: 'Hit targets for points', color: '#FFFFFF' },
            { icon: '💣', text: 'Bombs = -30 points', color: '#FF4444' },
            { icon: '🔥', text: 'Combo chains multiply score', color: '#FF6B9D' }
        ];

        rules.forEach((rule, i) => {
            const y = height / 2 + 10 + (i * 32);
            
            this.add.text(width / 2 - 180, y, rule.icon, {
                fontSize: '24px'
            }).setOrigin(0, 0.5);
            
            this.add.text(width / 2 - 140, y, rule.text, {
                fontSize: '18px',
                fontFamily: 'Poppins',
                fill: rule.color,
                fontStyle: '500'
            }).setOrigin(0, 0.5);
        });

        const startBtn = this.createButton(width / 2, height / 2 + 170, 'START GAME', () => {
            this.cameras.main.flash(250, 255, 255, 255);
            this.time.delayedCall(250, () => this.scene.start('WhackScene'));
        });

        this.tweens.add({
            targets: startBtn,
            y: height / 2 + 175,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createButton(x, y, text, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        
        bg.fillStyle(0xFF6B9D, 1);
        bg.fillRoundedRect(-130, -28, 260, 56, 28);
        bg.lineStyle(3, 0xFFD700, 1);
        bg.strokeRoundedRect(-130, -28, 260, 56, 28);
        
        const btnText = this.add.text(0, 0, text, {
            fontSize: '24px',
            fontFamily: 'Poppins',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, btnText]);
        btn.setSize(260, 56);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scale: 1.1, duration: 100 });
            bg.clear();
            bg.fillStyle(0xFFD700, 1);
            bg.fillRoundedRect(-130, -28, 260, 56, 28);
            bg.lineStyle(3, 0xFF6B9D, 1);
            bg.strokeRoundedRect(-130, -28, 260, 56, 28);
            btnText.setFill('#000000');
        });

        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scale: 1, duration: 100 });
            bg.clear();
            bg.fillStyle(0xFF6B9D, 1);
            bg.fillRoundedRect(-130, -28, 260, 56, 28);
            bg.lineStyle(3, 0xFFD700, 1);
            bg.strokeRoundedRect(-130, -28, 260, 56, 28);
            btnText.setFill('#FFFFFF');
        });

        btn.on('pointerdown', callback);
        return btn;
    }
}


class WhackScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WhackScene' });
    }

    init() {
        this.score = 0;
        this.timeLeft = 45;
        this.isGameOver = false;
        this.isPaused = true;
        this.holes = [];
        this.combo = 0;
        this.maxCombo = 0;
        this.totalHits = 0;
        this.totalMisses = 0;
        this.bombsHit = 0;
        this.spawnDelay = 1100;
        this.targetDuration = 1300;
        
        // Audio ducking properties
        this.bgmVolume = 0.25;
        this.bgmDuckedVolume = 0.03;
        this.bgmRestoreTimer = null;
        this.isDucking = false;
    }

    create() {
        this.createBackground();
        this.createHoles();
        this.createHammerCursor();
        this.setupInputs();
        this.updateUI();
        this.cameras.main.fadeIn(400);
        this.playBGM();
        this.showCountdown();
    }

    showCountdown() {
        const { width, height } = this.cameras.main;
        let count = 3;
        
        const countText = this.add.text(width / 2, height / 2, count, {
            fontSize: '140px',
            fontFamily: 'Playfair Display',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(600);

        const timer = this.time.addEvent({
            delay: 900,
            callback: () => {
                count--;
                if (count > 0) {
                    countText.setText(count);
                    this.tweens.add({
                        targets: countText,
                        scale: { from: 1.6, to: 1 },
                        duration: 400
                    });
                    this.cameras.main.shake(120, 0.006);
                } else if (count === 0) {
                    countText.setText('GO!');
                    countText.setFill('#00FF00');
                    this.cameras.main.flash(250, 255, 255, 255);
                } else {
                    countText.destroy();
                    this.isPaused = false;
                    this.startGame();
                }
            },
            repeat: 3
        });
    }

    startGame() {
        this.spawnEvent = this.time.addEvent({
            delay: this.spawnDelay,
            callback: this.spawnTarget,
            callbackScope: this,
            loop: true
        });

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.isGameOver && !this.isPaused) {
                    this.timeLeft--;
                    this.updateUI();
                    
                    if (this.timeLeft <= 0) this.endGame();
                }
            },
            loop: true
        });

        this.difficultyEvent = this.time.addEvent({
            delay: 6000,
            callback: () => {
                if (!this.isGameOver && !this.isPaused) {
                    this.spawnDelay = Math.max(450, this.spawnDelay - 100);
                    this.targetDuration = Math.max(650, this.targetDuration - 100);
                    this.spawnEvent.delay = this.spawnDelay;
                    
                    this.showFloatingText(this.scale.width / 2, 120, 'FASTER!', '#FF6B9D', 32);
                }
            },
            loop: true
        });
    }

    createBackground() {
        if (this.textures.exists('game-bg')) {
            const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'game-bg');
            bg.setScale(Math.max(this.scale.width / bg.width, this.scale.height / bg.height));
            bg.setAlpha(0.7);
        }

        const overlay = this.add.graphics();
        overlay.fillGradientStyle(0x1a0505, 0x1a0505, 0x3d0a0a, 0x3d0a0a, 0.75);
        overlay.fillRect(0, 0, this.scale.width, this.scale.height);
    }

    createHoles() {
        const startX = this.scale.width * 0.2;
        const startY = this.scale.height * 0.3;
        const stepX = this.scale.width * 0.3;
        const stepY = this.scale.height * 0.23;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const x = startX + (col * stepX);
                const y = startY + (row * stepY);
                
                const hole = this.add.graphics();
                hole.fillStyle(0x000000, 0.9);
                hole.fillEllipse(0, 0, 120, 45);
                hole.lineStyle(3, 0x4a0e0e, 1);
                hole.strokeEllipse(0, 0, 120, 45);
                hole.setPosition(x, y);
                
                const glow = this.add.ellipse(x, y + 3, 130, 50, 0x000000, 0.4);
                glow.setDepth(-1);
                
                this.holes.push({ x, y, busy: false, sprite: null });
            }
        }
    }

    createHammerCursor() {
        if (this.textures.exists('hammer')) {
            this.hammerCursor = this.add.sprite(0, 0, 'hammer');
            this.hammerCursor.setScale(0.18);
            this.hammerCursor.setOrigin(0.2, 0.1);
            this.hammerCursor.setDepth(1000);
            this.hammerCursor.setVisible(false);
        }
        this.input.setDefaultCursor('none');
    }

    setupInputs() {
        this.input.on('pointermove', (pointer) => {
            if (this.hammerCursor) {
                this.hammerCursor.setVisible(true);
                this.hammerCursor.setPosition(pointer.x, pointer.y);
            }
        });

        this.input.on('pointerdown', (pointer) => {
            if (!this.isGameOver && !this.isPaused) {
                this.animateHammer(pointer.x, pointer.y);
                
                const hitAny = this.holes.some(hole => {
                    if (hole.sprite && hole.sprite.active) {
                        const bounds = hole.sprite.getBounds();
                        return bounds.contains(pointer.x, pointer.y);
                    }
                    return false;
                });

                if (!hitAny && this.combo > 0) {
                    this.combo = 0;
                    this.totalMisses++;
                    this.showFloatingText(pointer.x, pointer.y, 'MISS', '#888888', 22);
                }
            }
        });
    }

    spawnTarget() {
        if (this.isGameOver || this.isPaused) return;

        const availableHoles = this.holes.filter(h => !h.busy);
        if (availableHoles.length === 0) return;

        const hole = Phaser.Utils.Array.GetRandom(availableHoles);
        hole.busy = true;

        const rand = Math.random();
        let type, points, color;
        
        if (rand < 0.2) {
            type = 'bomb';
            points = -30;
            color = 0x333333;
        } else {
            type = 'regular';
            points = 10;
            color = 0xFF4444;
        }

        this.createTarget(hole, type, points, color);
    }

    createTarget(hole, type, points, color) {
        const container = this.add.container(hole.x, hole.y + 70);
        container.setDepth(50);
        container.targetType = type;
        container.pointValue = points;

        const glow = this.add.circle(0, 0, 70, color, 0.4);
        container.add(glow);

        this.tweens.add({
            targets: glow,
            scale: { from: 1, to: 1.5 },
            alpha: { from: 0.4, to: 0.1 },
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        let visual;
        if (type === 'bomb') {
            if (this.textures.exists('bomb')) {
                visual = this.add.sprite(0, 0, 'bomb');
                visual.setScale(100 / Math.max(visual.width, visual.height));
                visual.setOrigin(0.5, 0.5);
            } else {
                visual = this.add.text(0, 0, '💣', { fontSize: '50px' }).setOrigin(0.5);
            }
        } else {
            const targetKey = `target${Phaser.Math.Between(1, 4)}`;
            if (this.textures.exists(targetKey)) {
                visual = this.add.sprite(0, 0, targetKey);
                visual.setScale(100 / Math.max(visual.width, visual.height));
                visual.setOrigin(0.5, 0.5);
            } else {
                visual = this.add.text(0, 0, '😠', { fontSize: '50px' }).setOrigin(0.5);
            }
        }
        
        container.add(visual);

        const hitArea = this.add.circle(0, 0, 85, 0xffffff, 0);
        hitArea.setInteractive({ useHandCursor: false });
        container.add(hitArea);

        hole.sprite = container;

        this.tweens.add({
            targets: container,
            y: hole.y - 35,
            duration: 180,
            ease: 'Back.easeOut'
        });

        hitArea.on('pointerdown', (pointer) => {
            if (!this.isGameOver && !this.isPaused) {
                this.onTargetHit(container, hole, pointer);
            }
        });

        const hideDelay = this.targetDuration;
        this.time.delayedCall(hideDelay, () => {
            if (container && container.active) {
                this.hideTarget(container, hole, false);
            }
        });
    }


    onTargetHit(container, hole, pointer) {
        const type = container.targetType;
        const basePoints = container.pointValue;

        this.animateHammer(pointer.x, pointer.y);

        if (type === 'bomb') {
            this.combo = 0;
            this.bombsHit++;
            this.score = this.score + basePoints;
            this.playBombSound();
            this.createExplosion(container.x, container.y);
            this.cameras.main.shake(350, 0.035);
            this.cameras.main.flash(220, 255, 0, 0);
            this.showFloatingText(container.x, container.y - 60, basePoints.toString(), '#FF0000', 40);
        } else {
            this.combo++;
            this.totalHits++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;

            const multiplier = Math.min(1 + (this.combo * 0.25), 3.5);
            const finalPoints = Math.floor(basePoints * multiplier);
            this.score += finalPoints;

            this.playHitSound();
            this.createHitEffect(container.x, container.y, finalPoints, type);
            this.cameras.main.shake(90, 0.01);
        }

        this.updateUI();
        this.hideTarget(container, hole, true);
    }

    createHitEffect(x, y, points, type) {
        const color = '#00FF00';
        const comboText = this.combo > 1 ? ` x${this.combo}` : '';
        this.showFloatingText(x, y - 50, `+${points}${comboText}`, color, 32);

        const colors = [0xFF4444, 0xFF6666, 0xFF0000];
        const count = 15;

        for (let i = 0; i < count; i++) {
            const particle = this.add.circle(x, y, Phaser.Math.Between(5, 12), Phaser.Utils.Array.GetRandom(colors));
            particle.setDepth(200);

            const angle = (i / count) * Math.PI * 2;
            const distance = Phaser.Math.Between(70, 140);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(350, 600),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }

        const ring = this.add.circle(x, y, 25, 0xffffff, 0);
        ring.setStrokeStyle(5, 0xFF4444);
        ring.setDepth(180);

        this.tweens.add({
            targets: ring,
            scale: 3.5,
            alpha: 0,
            duration: 350,
            onComplete: () => ring.destroy()
        });
    }

    createExplosion(x, y) {
        for (let i = 0; i < 30; i++) {
            const colors = [0xFF0000, 0xFF6600, 0xFFFF00, 0x333333];
            const particle = this.add.circle(x, y, Phaser.Math.Between(8, 18), Phaser.Utils.Array.GetRandom(colors));
            particle.setDepth(220);

            const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.6;
            const distance = Phaser.Math.Between(90, 200);

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.3,
                duration: Phaser.Math.Between(450, 800),
                ease: 'Cubic.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    hideTarget(container, hole, wasHit) {
        container.each(child => {
            if (child.disableInteractive) child.disableInteractive();
        });

        if (wasHit) {
            this.tweens.add({
                targets: container,
                scaleX: 1.4,
                scaleY: 0.2,
                alpha: 0,
                duration: 120,
                onComplete: () => {
                    container.destroy();
                    hole.busy = false;
                    hole.sprite = null;
                }
            });
        } else {
            this.tweens.add({
                targets: container,
                y: hole.y + 70,
                alpha: 0.4,
                duration: 220,
                ease: 'Back.easeIn',
                onComplete: () => {
                    container.destroy();
                    hole.busy = false;
                    hole.sprite = null;
                }
            });
        }
    }

    animateHammer(x, y) {
        if (!this.hammerCursor) return;

        this.tweens.add({
            targets: this.hammerCursor,
            angle: { from: -35, to: 35 },
            duration: 90,
            yoyo: true,
            ease: 'Cubic.easeOut'
        });

        const impact = this.add.circle(x, y, 18, 0xffffff, 0.9);
        impact.setDepth(950);

        this.tweens.add({
            targets: impact,
            scale: 2.5,
            alpha: 0,
            duration: 180,
            onComplete: () => impact.destroy()
        });
    }

    showFloatingText(x, y, text, color, size) {
        const floatText = this.add.text(x, y, text, {
            fontSize: `${size}px`,
            fontFamily: 'Poppins',
            fill: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(350);

        this.tweens.add({
            targets: floatText,
            y: y - 90,
            alpha: 0,
            scale: { from: 1.3, to: 0.7 },
            duration: 900,
            ease: 'Cubic.easeOut',
            onComplete: () => floatText.destroy()
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // AUDIO DUCKING SYSTEM - Makes SFX clearly audible over BGM
    // ═══════════════════════════════════════════════════════════════
    
    duckBGM(durationMs) {
        if (!this.bgm || this.isGameOver) return;
        
        // Kill any existing volume tweens to prevent conflicts
        this.tweens.killTweensOf(this.bgm);
        
        // Clear any pending restore timer
        if (this.bgmRestoreTimer) {
            this.bgmRestoreTimer.destroy();
            this.bgmRestoreTimer = null;
        }
        
        // Immediately duck the volume
        this.bgm.setVolume(this.bgmDuckedVolume);
        this.isDucking = true;
        
        // Schedule volume restoration
        this.bgmRestoreTimer = this.time.delayedCall(durationMs, () => {
            if (this.bgm && !this.isGameOver) {
                this.isDucking = false;
                this.tweens.add({
                    targets: this.bgm,
                    volume: this.bgmVolume,
                    duration: 150,
                    ease: 'Sine.easeOut'
                });
            }
        });
    }

    playHitSound() {
        if (this.cache.audio.exists('hit-sound')) {
            // Duck the BGM for the duration of the hit sound
            this.duckBGM(250);
            
            // Play hit sound with increased volume
            this.sound.play('hit-sound', { 
                volume: 0.7,
                rate: 1 + (Math.random() * 0.1 - 0.05) // Slight pitch variation
            });
        }
    }

    playBombSound() {
        if (this.cache.audio.exists('bomb-sound')) {
            // Duck the BGM longer for bomb explosion
            this.duckBGM(500);
            
            // Play bomb sound with higher volume
            this.sound.play('bomb-sound', { 
                volume: 0.85
            });
        }
    }

    playBGM() {
        if (this.cache.audio.exists('whack-bgm')) {
            this.bgm = this.sound.add('whack-bgm', { 
                volume: this.bgmVolume, 
                loop: true 
            });
            this.bgm.play();
        }
    }

    updateUI() {
        const scoreEl = document.getElementById('whack-score');
        const timerEl = document.getElementById('whack-timer');
        if (scoreEl) scoreEl.innerText = this.score;
        if (timerEl) timerEl.innerText = this.timeLeft;
    }

    endGame() {
        this.isGameOver = true;

        if (this.spawnEvent) this.spawnEvent.destroy();
        if (this.timerEvent) this.timerEvent.destroy();
        if (this.difficultyEvent) this.difficultyEvent.destroy();
        if (this.bgmRestoreTimer) this.bgmRestoreTimer.destroy();

        this.input.off('pointerdown');
        this.input.off('pointermove');
        
        // Fade out BGM smoothly
        if (this.bgm) {
            this.tweens.add({
                targets: this.bgm,
                volume: 0,
                duration: 800,
                onComplete: () => {
                    if (this.bgm) this.bgm.stop();
                }
            });
        }
        
        if (this.hammerCursor) this.hammerCursor.setVisible(false);
        this.input.setDefaultCursor('auto');

        const highScore = parseInt(localStorage.getItem('whackHighScore') || '0');
        const isNewHighScore = this.score > highScore;
        if (isNewHighScore) {
            localStorage.setItem('whackHighScore', this.score.toString());
        }

        this.time.delayedCall(600, () => this.showGameOver(isNewHighScore));
    }


    showGameOver(isNewHighScore) {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0);
        overlay.setOrigin(0).setDepth(450);

        this.tweens.add({
            targets: overlay,
            fillAlpha: 0.85,
            duration: 900,
            ease: 'Power2'
        });

        const container = this.add.container(width / 2, height / 2);
        container.setDepth(500);
        container.setAlpha(0);
        container.setScale(0.6);

        const panel = this.add.graphics();
        panel.fillStyle(0x1a0a14, 0.95);
        panel.fillRoundedRect(-240, -260, 480, 520, 25);
        panel.lineStyle(5, 0xFF6B9D, 1);
        panel.strokeRoundedRect(-240, -260, 480, 520, 25);
        panel.lineStyle(2, 0xFFD700, 0.6);
        panel.strokeRoundedRect(-230, -250, 460, 500, 22);
        container.add(panel);

        const title = this.add.text(0, -210, isNewHighScore ? '🏆 NEW RECORD! 🏆' : (this.score < 0 ? 'LAWDE LAG GYE!' : 'GAME OVER'), {
            fontSize: isNewHighScore ? '36px' : (this.score < 0 ? '40px' : '44px'),
            fontFamily: 'Playfair Display',
            fill: isNewHighScore ? '#FFD700' : (this.score < 0 ? '#FF0000' : '#FF4444'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        container.add(title);

        const scoreLabel = this.add.text(0, -150, 'FINAL SCORE', {
            fontSize: '26px',
            fontFamily: 'Poppins',
            fill: '#FF6B9D',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(scoreLabel);

        const scoreValue = this.add.text(0, -95, this.score.toString(), {
            fontSize: '80px',
            fontFamily: 'Playfair Display',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);
        container.add(scoreValue);

        const stats = [
            `🎯 Hits: ${this.totalHits}`,
            `🔥 Max Combo: ${this.maxCombo}x`,
            `💣 Bombs: ${this.bombsHit}`
        ];

        stats.forEach((stat, i) => {
            const statText = this.add.text(0, -5 + (i * 38), stat, {
                fontSize: '22px',
                fontFamily: 'Poppins',
                fill: '#FFFFFF',
                fontStyle: '600',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            container.add(statText);
        });

        const playAgainBtn = this.createGameOverButton(0, 180, '🔄 PLAY AGAIN', () => {
            this.cameras.main.fade(350, 0, 0, 0);
            this.time.delayedCall(350, () => this.scene.restart());
        });
        container.add(playAgainBtn);

        const hubBtn = this.createGameOverButton(0, 240, '🏠 MAIN MENU', () => {
            this.cameras.main.fade(350, 0, 0, 0);
            this.time.delayedCall(350, () => app.showScreen('screen-gallery'));
        });
        container.add(hubBtn);

        this.tweens.add({
            targets: container,
            alpha: 1,
            scale: 1,
            duration: 900,
            ease: 'Back.easeOut',
            delay: 350
        });

        if (isNewHighScore) {
            this.createConfetti();
        }
    }

    createGameOverButton(x, y, text, callback) {
        const btn = this.add.container(x, y);
        const bg = this.add.graphics();
        
        bg.fillStyle(0xFF6B9D, 1);
        bg.fillRoundedRect(-130, -26, 260, 52, 26);
        bg.lineStyle(3, 0xFFD700, 1);
        bg.strokeRoundedRect(-130, -26, 260, 52, 26);

        const btnText = this.add.text(0, 0, text, {
            fontSize: '22px',
            fontFamily: 'Poppins',
            fill: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        btn.add([bg, btnText]);
        btn.setSize(260, 52);
        btn.setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            this.tweens.add({ targets: btn, scale: 1.12, duration: 120 });
            bg.clear();
            bg.fillStyle(0xFFD700, 1);
            bg.fillRoundedRect(-130, -26, 260, 52, 26);
            bg.lineStyle(3, 0xFF6B9D, 1);
            bg.strokeRoundedRect(-130, -26, 260, 52, 26);
            btnText.setFill('#000000');
        });

        btn.on('pointerout', () => {
            this.tweens.add({ targets: btn, scale: 1, duration: 120 });
            bg.clear();
            bg.fillStyle(0xFF6B9D, 1);
            bg.fillRoundedRect(-130, -26, 260, 52, 26);
            bg.lineStyle(3, 0xFFD700, 1);
            bg.strokeRoundedRect(-130, -26, 260, 52, 26);
            btnText.setFill('#FFFFFF');
        });

        btn.on('pointerdown', () => {
            this.cameras.main.shake(120, 0.012);
            callback();
        });

        return btn;
    }

    createConfetti() {
        const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFD700];
        
        for (let i = 0; i < 120; i++) {
            this.time.delayedCall(i * 25, () => {
                const x = Phaser.Math.Between(0, this.scale.width);
                const confetti = this.add.rectangle(x, -30, Phaser.Math.Between(6, 14), Phaser.Math.Between(12, 20), Phaser.Utils.Array.GetRandom(colors));
                confetti.setDepth(550);
                confetti.setAngle(Phaser.Math.Between(0, 360));

                this.tweens.add({
                    targets: confetti,
                    y: this.scale.height + 60,
                    angle: confetti.angle + Phaser.Math.Between(-400, 400),
                    x: x + Phaser.Math.Between(-120, 120),
                    duration: Phaser.Math.Between(2200, 4500),
                    ease: 'Cubic.easeIn',
                    onComplete: () => confetti.destroy()
                });
            });
        }
    }
}

function initWhackGame() {
    if (whackGame) {
        try {
            whackGame.destroy(true);
        } catch (e) {
            console.warn("Error destroying game:", e);
        }
        whackGame = null;
    }

    const container = document.getElementById('whack-game-container');
    if (!container) {
        console.error("Container not found!");
        return;
    }

    container.innerHTML = '';

    const config = {
        type: Phaser.AUTO,
        parent: 'whack-game-container',
        width: 800,
        height: 600,
        transparent: true,
        scene: [BootScene, MenuScene, WhackScene],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        audio: {
            disableWebAudio: false
        }
    };

    try {
        whackGame = new Phaser.Game(config);
        console.log("🎮 Whack-a-Mole initialized!");
    } catch (e) {
        console.error("Error:", e);
        container.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:20px;text-align:center;padding:20px;">
                Failed to load game.<br>Please refresh.
            </div>
        `;
    }
}

function destroyWhackGame() {
    if (whackGame) {
        if (whackGame.scene && whackGame.scene.scenes) {
            whackGame.scene.scenes.forEach(scene => {
                if (scene.tweens) scene.tweens.killAll();
                if (scene.time) scene.time.removeAllEvents();
            });
        }
        
        whackGame.destroy(true);
        whackGame = null;
    }
}