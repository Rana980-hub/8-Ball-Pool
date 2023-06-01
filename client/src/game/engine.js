import { Ball, CueBall, resolveCollision, wallBounce, checkPocket, BALL_RADIUS } from './physics.js';

export class GameEngine {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.callbacks = callbacks;
        
        this.TABLE_WIDTH = 800;
        this.TABLE_HEIGHT = 400;
        this.canvas.width = this.TABLE_WIDTH;
        this.canvas.height = this.TABLE_HEIGHT;
        
        this.CUSHION = 25;
        this.POCKET_RADIUS = 22;
        
        this.POCKETS = [
            { x: this.CUSHION, y: this.CUSHION },
            { x: this.TABLE_WIDTH / 2, y: this.CUSHION - 8 },
            { x: this.TABLE_WIDTH - this.CUSHION, y: this.CUSHION },
            { x: this.CUSHION, y: this.TABLE_HEIGHT - this.CUSHION },
            { x: this.TABLE_WIDTH / 2, y: this.TABLE_HEIGHT - this.CUSHION + 8 },
            { x: this.TABLE_WIDTH - this.CUSHION, y: this.TABLE_HEIGHT - this.CUSHION }
        ];

        this.resetGame();
        
        // Input binding
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchDown = this.handleTouchDown.bind(this);
        this.handleTouchUp = this.handleTouchUp.bind(this);
        this.loop = this.loop.bind(this);
        
        this.attachEvents();
    }
    
    resetGame() {
        this.balls = [];
        this.cueBall = null;
        this.isPlaying = true;
        this.currentPlayer = 1;
        this.p1Group = null;
        this.p2Group = null;
        this.p1BallsPocketed = [];
        this.p2BallsPocketed = [];
        
        this.state = 'AIMING';
        this.aimAngle = 0;
        this.chargePower = 0;
        this.maxPower = 25;
        this.mousePos = { x: 0, y: 0 };
        this.firstHitBall = null;
        this.pocketedThisTurn = [];
        this.cueBallPocketed = false;
        
        this.setupRack();
        this.notifyStateUpdate();
    }

    attachEvents() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        window.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchstart', this.handleTouchDown, { passive: false });
        window.addEventListener('touchend', this.handleTouchUp);
    }
    
    detachEvents() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchstart', this.handleTouchDown);
        window.removeEventListener('touchend', this.handleTouchUp);
        cancelAnimationFrame(this.animationId);
    }

    start() {
        this.animationId = requestAnimationFrame(this.loop);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: ((clientX - rect.left) / rect.width) * this.TABLE_WIDTH,
            y: ((clientY - rect.top) / rect.height) * this.TABLE_HEIGHT
        };
    }

    handleMouseMove(e) {
        if (this.state === 'AIMING' && this.cueBall && !this.cueBall.pocketed) {
            this.mousePos = this.getMousePos(e);
            const dx = this.mousePos.x - this.cueBall.x;
            const dy = this.mousePos.y - this.cueBall.y;
            this.aimAngle = Math.atan2(dy, dx);
        } else if (this.state === 'BALL_IN_HAND') {
            this.mousePos = this.getMousePos(e);
            this.cueBall.x = Math.max(this.CUSHION + this.cueBall.radius, Math.min(this.TABLE_WIDTH - this.CUSHION - this.cueBall.radius, this.mousePos.x));
            this.cueBall.y = Math.max(this.CUSHION + this.cueBall.radius, Math.min(this.TABLE_HEIGHT - this.CUSHION - this.cueBall.radius, this.mousePos.y));
        }
    }

    handleMouseDown(e) {
        if (this.state === 'AIMING') {
            this.state = 'CHARGING';
            this.chargePower = 0;
        } else if (this.state === 'BALL_IN_HAND') {
            this.state = 'AIMING';
        }
    }

    handleMouseUp(e) {
        if (this.state === 'CHARGING') {
            this.shoot();
        }
    }

    handleTouchMove(e) { e.preventDefault(); this.handleMouseMove(e); }
    handleTouchDown(e) { this.handleMouseDown(e); }
    handleTouchUp(e) { this.handleMouseUp(e); }

    shoot() {
        if (!this.cueBall || this.cueBall.pocketed) return;
        this.state = 'MOVING';
        this.cueBall.vx = Math.cos(this.aimAngle) * this.chargePower;
        this.cueBall.vy = Math.sin(this.aimAngle) * this.chargePower;
        this.chargePower = 0;
        this.firstHitBall = null;
        this.pocketedThisTurn = [];
        this.cueBallPocketed = false;
        
        if (this.callbacks.onShoot) this.callbacks.onShoot();
        this.notifyStateUpdate();
    }

    setupRack() {
        this.balls = [];
        this.cueBall = new CueBall(this.TABLE_WIDTH * 0.25, this.TABLE_HEIGHT / 2);
        this.balls.push(this.cueBall);

        const startX = this.TABLE_WIDTH * 0.7;
        const startY = this.TABLE_HEIGHT / 2;
        const rowWidth = BALL_RADIUS * Math.sqrt(3);
        const colHeight = BALL_RADIUS * 2.05;

        const ballColors = [
            '#f0c040', '#1a6bcc', '#e03030', '#8b2fc9', '#e08a30', '#1a9e4b', '#800000', '#111111', 
            '#f0c040', '#1a6bcc', '#e03030', '#8b2fc9', '#e08a30', '#1a9e4b', '#800000'
        ];
        
        const pattern = [
            1,  
            9, 2, 
            10, 8, 3, 
            11, 4, 12, 13, 
            5, 14, 6, 15, 7 
        ];

        let idx = 0;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col <= row; col++) {
                const num = pattern[idx++];
                const isStripe = num > 8;
                const x = startX + row * rowWidth;
                const y = startY + (col - row / 2) * colHeight;
                this.balls.push(new Ball(x, y, num, ballColors[num-1], isStripe));
            }
        }
    }

    loop() {
        if (!this.isPlaying) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }

    update() {
        if (this.state === 'CHARGING') {
            this.chargePower += 0.4;
            if (this.chargePower > this.maxPower) this.chargePower = 0;
            this.notifyStateUpdate(); // Update power bar
        }

        let isMoving = false;

        for (let i = 0; i < this.balls.length; i++) {
            const b = this.balls[i];
            if (b.pocketed) continue;
            b.update();
            if (b.isMoving()) isMoving = true;
            wallBounce(b, this.CUSHION, this.TABLE_WIDTH - this.CUSHION, this.CUSHION, this.TABLE_HEIGHT - this.CUSHION);
        }

        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const b1 = this.balls[i];
                const b2 = this.balls[j];
                if (b1.pocketed || b2.pocketed) continue;
                if (resolveCollision(b1, b2)) {
                    if (!this.firstHitBall && (b1 === this.cueBall || b2 === this.cueBall)) {
                        this.firstHitBall = b1 === this.cueBall ? b2 : b1;
                    }
                }
            }
        }

        for (let i = 0; i < this.balls.length; i++) {
            const b = this.balls[i];
            if (b.pocketed) continue;
            if (checkPocket(b, this.POCKETS, this.POCKET_RADIUS)) {
                b.pocketed = true;
                b.vx = 0; b.vy = 0;
                if (b === this.cueBall) {
                    this.cueBallPocketed = true;
                } else {
                    this.pocketedThisTurn.push(b);
                }
            }
        }

        if (this.state === 'MOVING' && !isMoving) {
            this.evaluateTurn();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // --- DRAW TABLE OUTER FRAME (WOODEN RAILS) ---
        const railWidth = this.CUSHION;
        this.ctx.fillStyle = '#5c3010'; // Dark wood
        this.ctx.fillRect(0, 0, this.TABLE_WIDTH, this.TABLE_HEIGHT);
        
        // Bevel effect for rails
        this.ctx.strokeStyle = '#3d1f0a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.TABLE_WIDTH - 2, this.TABLE_HEIGHT - 2);
        
        // Rail markers (Diamonds)
        this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
        for (let i = 1; i < 8; i++) {
            // Horizontal markers
            this.drawDiamond(i * (this.TABLE_WIDTH / 8), railWidth / 2);
            this.drawDiamond(i * (this.TABLE_WIDTH / 8), this.TABLE_HEIGHT - railWidth / 2);
        }
        for (let i = 1; i < 4; i++) {
            // Vertical markers
            this.drawDiamond(railWidth / 2, i * (this.TABLE_HEIGHT / 4));
            this.drawDiamond(this.TABLE_WIDTH - railWidth / 2, i * (this.TABLE_HEIGHT / 4));
        }

        // --- DRAW FELT (CLOTH) ---
        const feltGrad = this.ctx.createRadialGradient(
            this.TABLE_WIDTH / 2, this.TABLE_HEIGHT / 2, 50,
            this.TABLE_WIDTH / 2, this.TABLE_HEIGHT / 2, 400
        );
        feltGrad.addColorStop(0, '#2e7d32'); // Bright green center
        feltGrad.addColorStop(1, '#1b5e20'); // Darker green edges
        
        this.ctx.fillStyle = feltGrad;
        this.ctx.fillRect(this.CUSHION, this.CUSHION, this.TABLE_WIDTH - this.CUSHION * 2, this.TABLE_HEIGHT - this.CUSHION * 2);

        // Subtle Felt Texture (Noise)
        this.ctx.globalAlpha = 0.05;
        for (let i = 0; i < 1000; i++) {
            const x = this.CUSHION + Math.random() * (this.TABLE_WIDTH - this.CUSHION * 2);
            const y = this.CUSHION + Math.random() * (this.TABLE_HEIGHT - this.CUSHION * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(x, y, 1, 1);
        }
        this.ctx.globalAlpha = 1.0;

        // Inner cushion shadows
        this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(this.CUSHION, this.CUSHION, this.TABLE_WIDTH - this.CUSHION * 2, this.TABLE_HEIGHT - this.CUSHION * 2);

        // --- DRAW POCKETS ---
        this.POCKETS.forEach(p => {
            // Outer pocket shadow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.POCKET_RADIUS + 2, 0, Math.PI * 2);
            this.ctx.fillStyle = '#111';
            this.ctx.fill();
            
            // Inner pocket (hole)
            const pGrad = this.ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, this.POCKET_RADIUS);
            pGrad.addColorStop(0, '#000');
            pGrad.addColorStop(1, '#222');
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.POCKET_RADIUS, 0, Math.PI * 2);
            this.ctx.fillStyle = pGrad;
            this.ctx.fill();
            
            // Pocket rim
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });

        // Head string (D-line) - optional but nice
        this.ctx.beginPath();
        this.ctx.moveTo(this.TABLE_WIDTH * 0.25, this.CUSHION);
        this.ctx.lineTo(this.TABLE_WIDTH * 0.25, this.TABLE_HEIGHT - this.CUSHION);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // --- DRAW AIMING LINE & CUE ---
        if ((this.state === 'AIMING' || this.state === 'CHARGING') && this.cueBall && !this.cueBall.pocketed) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.cueBall.x, this.cueBall.y);
            this.ctx.lineTo(this.cueBall.x + Math.cos(this.aimAngle) * 500, this.cueBall.y + Math.sin(this.aimAngle) * 500);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.setLineDash([5, 5]);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            const cueDistance = 20 + this.chargePower * 2;
            this.ctx.save();
            this.ctx.translate(this.cueBall.x, this.cueBall.y);
            this.ctx.rotate(this.aimAngle);
            this.ctx.beginPath();
            this.ctx.moveTo(-cueDistance, 0);
            this.ctx.lineTo(-cueDistance - 150, 0);
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            let grad = this.ctx.createLinearGradient(-cueDistance, 0, -cueDistance-150, 0);
            grad.addColorStop(0, '#cce6ff'); 
            grad.addColorStop(0.05, '#333');
            grad.addColorStop(0.1, '#8b4513');
            grad.addColorStop(0.8, '#5c3010');
            grad.addColorStop(1, '#111');
            this.ctx.strokeStyle = grad;
            this.ctx.stroke();
            this.ctx.restore();
        }

        let visibleBalls = this.balls.filter(b => !b.pocketed).sort((a,b) => a.y - b.y);
        visibleBalls.forEach(b => b.draw(this.ctx));
    }

    evaluateTurn() {
        let foul = false;
        let switchTurn = true;
        let msg = "";

        let currentGroup = this.currentPlayer === 1 ? this.p1Group : this.p2Group;

        if (this.cueBallPocketed) {
            foul = true;
            msg = "FOUL: CUE BALL POCKETED";
            this.cueBall.pocketed = false;
            this.cueBall.vx = 0; this.cueBall.vy = 0;
            this.state = 'BALL_IN_HAND';
        }
        else if (!this.firstHitBall) {
            foul = true;
            msg = "FOUL: NO BALL HIT";
            this.state = 'BALL_IN_HAND';
        }
        else if (currentGroup && this.firstHitBall.number !== 8) {
            let firstHitIsStripe = this.firstHitBall.isStripe;
            if ((currentGroup === 'solid' && firstHitIsStripe) || (currentGroup === 'stripe' && !firstHitIsStripe)) {
                foul = true;
                msg = "FOUL: WRONG BALL HIT";
                this.state = 'BALL_IN_HAND';
            }
        } else if (currentGroup && this.firstHitBall.number === 8) {
            let remainingOwn = currentGroup === 'solid' ? this.getRemainingSolids() : this.getRemainingStripes();
            if (remainingOwn > 0) {
                foul = true;
                msg = "FOUL: HIT 8 BALL FIRST";
                this.state = 'BALL_IN_HAND';
            }
        }

        if (!this.p1Group && this.pocketedThisTurn.length > 0 && !foul) {
            let firstLegal = this.pocketedThisTurn.find(b => b.number !== 8);
            if (firstLegal) {
                let isStripe = firstLegal.isStripe;
                if (this.currentPlayer === 1) {
                    this.p1Group = isStripe ? 'stripe' : 'solid';
                    this.p2Group = isStripe ? 'solid' : 'stripe';
                } else {
                    this.p2Group = isStripe ? 'stripe' : 'solid';
                    this.p1Group = isStripe ? 'solid' : 'stripe';
                }
            }
        }

        let pocketedOwn = false;
        this.pocketedThisTurn.forEach(b => {
            if (b.number === 8) {
                let remainingOwn = currentGroup === 'solid' ? this.getRemainingSolids() : this.getRemainingStripes();
                if (foul || remainingOwn > 0) {
                    this.isPlaying = false;
                    if (this.callbacks.onGameOver) this.callbacks.onGameOver(this.currentPlayer === 1 ? 2 : 1, "POCKETED 8-BALL EARLY/FOUL");
                    return;
                } else {
                    this.isPlaying = false;
                    if (this.callbacks.onGameOver) this.callbacks.onGameOver(this.currentPlayer, "SANK THE 8-BALL!");
                    return;
                }
            } else {
                let isStripe = b.isStripe;
                if (this.p1Group === 'stripe') {
                    if (isStripe) { this.p1BallsPocketed.push(b.number); if(this.currentPlayer===1) pocketedOwn = true; }
                    else { this.p2BallsPocketed.push(b.number); if(this.currentPlayer===2) pocketedOwn = true; }
                } else if (this.p1Group === 'solid') {
                    if (!isStripe) { this.p1BallsPocketed.push(b.number); if(this.currentPlayer===1) pocketedOwn = true; }
                    else { this.p2BallsPocketed.push(b.number); if(this.currentPlayer===2) pocketedOwn = true; }
                } else {
                    pocketedOwn = true;
                }
            }
        });

        if (!this.isPlaying) return;

        if (!foul && pocketedOwn) {
            switchTurn = false;
            msg = "GOOD SHOT!";
        }

        if (foul) {
            if (this.callbacks.onFoul) this.callbacks.onFoul(msg);
        } else if (msg) {
            if (this.callbacks.onMessage) this.callbacks.onMessage(msg);
        }

        if (switchTurn) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        }

        if (this.state !== 'BALL_IN_HAND') {
            this.state = 'AIMING';
        }

        this.notifyStateUpdate();
        if (this.callbacks.onTurnReady) this.callbacks.onTurnReady();
    }

    getRemainingSolids() {
        return this.balls.filter(b => b.number >= 1 && b.number <= 7 && !b.pocketed).length;
    }

    getRemainingStripes() {
        return this.balls.filter(b => b.number >= 9 && b.number <= 15 && !b.pocketed).length;
    }

    drawDiamond(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -3);
        this.ctx.lineTo(2, 0);
        this.ctx.lineTo(0, 3);
        this.ctx.lineTo(-2, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }

    notifyStateUpdate() {
        if (this.callbacks.onStateUpdate) {
            this.callbacks.onStateUpdate({
                currentPlayer: this.currentPlayer,
                p1Score: this.p1BallsPocketed.length * 100,
                p2Score: this.p2BallsPocketed.length * 100,
                p1Group: this.p1Group,
                p2Group: this.p2Group,
                p1Balls: [...this.p1BallsPocketed].map(n => this.balls.find(b => b.number===n)?.color),
                p2Balls: [...this.p2BallsPocketed].map(n => this.balls.find(b => b.number===n)?.color),
                powerPercent: (this.chargePower / this.maxPower) * 100
            });
        }
    }
}
