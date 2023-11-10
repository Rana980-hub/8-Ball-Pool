const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Logical dimensions of the table
const TABLE_WIDTH = 800;
const TABLE_HEIGHT = 400;
canvas.width = TABLE_WIDTH;
canvas.height = TABLE_HEIGHT;

const CUSHION = 25;
const POCKET_RADIUS = 22; // Slightly larger than ball radius (13)

const POCKETS = [
    { x: CUSHION, y: CUSHION },
    { x: TABLE_WIDTH / 2, y: CUSHION - 8 },
    { x: TABLE_WIDTH - CUSHION, y: CUSHION },
    { x: CUSHION, y: TABLE_HEIGHT - CUSHION },
    { x: TABLE_WIDTH / 2, y: TABLE_HEIGHT - CUSHION + 8 },
    { x: TABLE_WIDTH - CUSHION, y: TABLE_HEIGHT - CUSHION }
];

// Game State Variables
let balls = [];
let cueBall = null;
let isPlaying = false;
let currentPlayer = 1; // 1 or 2
let p1Name = "Player 1", p2Name = "Player 2";
let p1Group = null, p2Group = null; // 'solid' or 'stripe'
let p1BallsPocketed = [], p2BallsPocketed = [];

// Turn State
let state = 'AIMING'; // AIMING, CHARGING, MOVING
let aimAngle = 0;
let chargePower = 0;
let maxPower = 25;
let mousePos = { x: 0, y: 0 };
let firstHitBall = null;
let pocketedThisTurn = [];
let cueBallPocketed = false;
let cueBallPlaced = false;

let turnTimer = 30;
let timerInterval = null;

// UI Elements
const p1Card = document.getElementById('p1Card');
const p2Card = document.getElementById('p2Card');
const turnIndicator = document.getElementById('turnIndicator');
const foulMsg = document.getElementById('foulMsg');
const timerText = document.getElementById('timerText');
const timerCircle = document.getElementById('timerCircle');
const powerBar = document.getElementById('powerBar');
const powerValue = document.getElementById('powerValue');

// Event Listeners
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
canvas.addEventListener('touchstart', handleTouchDown, { passive: false });
window.addEventListener('touchend', handleTouchUp);

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: ((clientX - rect.left) / rect.width) * TABLE_WIDTH,
        y: ((clientY - rect.top) / rect.height) * TABLE_HEIGHT
    };
}

function handleMouseMove(e) {
    if (state === 'AIMING' && cueBall && !cueBall.pocketed) {
        mousePos = getMousePos(e);
        const dx = mousePos.x - cueBall.x;
        const dy = mousePos.y - cueBall.y;
        aimAngle = Math.atan2(dy, dx);
    } else if (state === 'BALL_IN_HAND') {
        mousePos = getMousePos(e);
        cueBall.x = Math.max(CUSHION + cueBall.radius, Math.min(TABLE_WIDTH - CUSHION - cueBall.radius, mousePos.x));
        cueBall.y = Math.max(CUSHION + cueBall.radius, Math.min(TABLE_HEIGHT - CUSHION - cueBall.radius, mousePos.y));
    }
}

function handleMouseDown(e) {
    if (state === 'AIMING') {
        state = 'CHARGING';
        chargePower = 0;
    } else if (state === 'BALL_IN_HAND') {
        state = 'AIMING';
    }
}

function handleMouseUp(e) {
    if (state === 'CHARGING') {
        shoot();
    }
}

// Touch wrappers
function handleTouchMove(e) { e.preventDefault(); handleMouseMove(e); }
function handleTouchDown(e) { handleMouseDown(e); }
function handleTouchUp(e) { handleMouseUp(e); }

function shoot() {
    if (!cueBall || cueBall.pocketed) return;
    state = 'MOVING';
    
    // Apply velocity
    cueBall.vx = Math.cos(aimAngle) * chargePower;
    cueBall.vy = Math.sin(aimAngle) * chargePower;
    
    chargePower = 0;
    powerBar.style.height = '0%';
    powerValue.innerText = '0%';
    
    firstHitBall = null;
    pocketedThisTurn = [];
    cueBallPocketed = false;
    
    stopTimer();
}

function setupRack() {
    balls = [];
    
    // Create Cue Ball
    cueBall = new CueBall(TABLE_WIDTH * 0.25, TABLE_HEIGHT / 2);
    balls.push(cueBall);

    // Standard 8-ball triangle
    const startX = TABLE_WIDTH * 0.7;
    const startY = TABLE_HEIGHT / 2;
    const rowWidth = BALL_RADIUS * Math.sqrt(3);
    const colHeight = BALL_RADIUS * 2.05; // slight gap

    const ballColors = [
        '#f0c040', '#1a6bcc', '#e03030', '#8b2fc9', '#e08a30', '#1a9e4b', '#800000', '#111111', 
        '#f0c040', '#1a6bcc', '#e03030', '#8b2fc9', '#e08a30', '#1a9e4b', '#800000'
    ];
    
    // Pattern: solid, stripe, stripe, 8-ball, solid, etc.
    const pattern = [
        1,  // Row 1
        9, 2, // Row 2
        10, 8, 3, // Row 3
        11, 4, 12, 13, // Row 4
        5, 14, 6, 15, 7 // Row 5
    ];

    let idx = 0;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col <= row; col++) {
            const num = pattern[idx++];
            const isStripe = num > 8;
            const x = startX + row * rowWidth;
            const y = startY + (col - row / 2) * colHeight;
            balls.push(new Ball(x, y, num, ballColors[num-1], isStripe));
        }
    }
}

function startGame() {
    p1Name = document.getElementById('player1Name').value || "Player 1";
    p2Name = document.getElementById('player2Name').value || "Player 2";
    
    document.getElementById('p1DisplayName').innerText = p1Name;
    document.getElementById('p2DisplayName').innerText = p2Name;
    
    document.getElementById('splashScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    
    resetGame();
}

function resetGame() {
    isPlaying = true;
    currentPlayer = 1;
    p1Group = null;
    p2Group = null;
    p1BallsPocketed = [];
    p2BallsPocketed = [];
    document.getElementById('p1Score').innerText = '0';
    document.getElementById('p2Score').innerText = '0';
    document.getElementById('p1Balls').innerHTML = '';
    document.getElementById('p2Balls').innerHTML = '';
    
    setupRack();
    state = 'AIMING';
    updateHUD();
    startTimer();
    
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (!isPlaying) return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    if (state === 'CHARGING') {
        chargePower += 0.4;
        if (chargePower > maxPower) {
            chargePower = 0; // Loop or bounce back
        }
        const pct = (chargePower / maxPower) * 100;
        powerBar.style.height = pct + '%';
        powerValue.innerText = Math.round(pct) + '%';
    }

    let isMoving = false;

    // Update positions and check wall collisions
    for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.pocketed) continue;
        
        b.update();
        if (b.isMoving()) isMoving = true;
        
        wallBounce(b, CUSHION, TABLE_WIDTH - CUSHION, CUSHION, TABLE_HEIGHT - CUSHION);
    }

    // Check ball-ball collisions
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            const b1 = balls[i];
            const b2 = balls[j];
            if (b1.pocketed || b2.pocketed) continue;
            
            if (resolveCollision(b1, b2)) {
                // Track first hit ball
                if (!firstHitBall && (b1 === cueBall || b2 === cueBall)) {
                    firstHitBall = b1 === cueBall ? b2 : b1;
                }
            }
        }
    }

    // Check pockets
    for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.pocketed) continue;
        
        if (checkPocket(b, POCKETS, POCKET_RADIUS)) {
            b.pocketed = true;
            b.vx = 0; b.vy = 0;
            if (b === cueBall) {
                cueBallPocketed = true;
            } else {
                pocketedThisTurn.push(b);
            }
        }
    }

    if (state === 'MOVING' && !isMoving) {
        evaluateTurn();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cushions inner shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(CUSHION, CUSHION, TABLE_WIDTH - CUSHION*2, TABLE_HEIGHT - CUSHION*2);
    
    // Draw aiming line
    if ((state === 'AIMING' || state === 'CHARGING') && cueBall && !cueBall.pocketed) {
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(cueBall.x + Math.cos(aimAngle) * 500, cueBall.y + Math.sin(aimAngle) * 500);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Cue Stick
        const cueDistance = 20 + chargePower * 2;
        ctx.save();
        ctx.translate(cueBall.x, cueBall.y);
        ctx.rotate(aimAngle);
        ctx.beginPath();
        ctx.moveTo(-cueDistance, 0);
        ctx.lineTo(-cueDistance - 150, 0);
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        // Wood gradient
        let grad = ctx.createLinearGradient(-cueDistance, 0, -cueDistance-150, 0);
        grad.addColorStop(0, '#cce6ff'); // tip
        grad.addColorStop(0.05, '#333');
        grad.addColorStop(0.1, '#8b4513');
        grad.addColorStop(0.8, '#5c3010');
        grad.addColorStop(1, '#111');
        ctx.strokeStyle = grad;
        ctx.stroke();
        ctx.restore();
    }
    
    // Draw pockets overlay (optional, since CSS handles outer frame)
    POCKETS.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();
    });

    // Draw balls (sort by y to make pseudo-3D look better)
    let visibleBalls = balls.filter(b => !b.pocketed).sort((a,b) => a.y - b.y);
    visibleBalls.forEach(b => b.draw(ctx));
}

function evaluateTurn() {
    let foul = false;
    let switchTurn = true;
    let gameWon = false;
    let msg = "";

    // Determine current player's group
    let currentGroup = currentPlayer === 1 ? p1Group : p2Group;

    // Check Foul: Cue ball pocketed
    if (cueBallPocketed) {
        foul = true;
        msg = "FOUL: CUE BALL POCKETED";
        cueBall.pocketed = false;
        cueBall.vx = 0; cueBall.vy = 0;
        state = 'BALL_IN_HAND';
    }
    // Check Foul: No balls hit
    else if (!firstHitBall) {
        foul = true;
        msg = "FOUL: NO BALL HIT";
        state = 'BALL_IN_HAND';
    }
    // Check Foul: Wrong ball hit first
    else if (currentGroup && firstHitBall.number !== 8) {
        let firstHitIsStripe = firstHitBall.isStripe;
        if ((currentGroup === 'solid' && firstHitIsStripe) || (currentGroup === 'stripe' && !firstHitIsStripe)) {
            foul = true;
            msg = "FOUL: WRONG BALL HIT";
            state = 'BALL_IN_HAND';
        }
    } else if (currentGroup && firstHitBall.number === 8) {
        // Hitting 8 ball first is only legal if that's the only ball left
        let remainingOwn = currentGroup === 'solid' ? getRemainingSolids() : getRemainingStripes();
        if (remainingOwn > 0) {
            foul = true;
            msg = "FOUL: HIT 8 BALL FIRST";
            state = 'BALL_IN_HAND';
        }
    }

    // Assign groups if open table
    if (!p1Group && pocketedThisTurn.length > 0 && !foul) {
        let firstLegal = pocketedThisTurn.find(b => b.number !== 8);
        if (firstLegal) {
            let isStripe = firstLegal.isStripe;
            if (currentPlayer === 1) {
                p1Group = isStripe ? 'stripe' : 'solid';
                p2Group = isStripe ? 'solid' : 'stripe';
            } else {
                p2Group = isStripe ? 'stripe' : 'solid';
                p1Group = isStripe ? 'solid' : 'stripe';
            }
        }
    }

    // Process pocketed balls
    let pocketedOwn = false;
    pocketedThisTurn.forEach(b => {
        if (b.number === 8) {
            // Game Over evaluation
            let remainingOwn = currentGroup === 'solid' ? getRemainingSolids() : getRemainingStripes();
            if (foul || remainingOwn > 0) {
                // Lost
                endGame(currentPlayer === 1 ? 2 : 1, "POCKETED 8-BALL EARLY/FOUL");
                gameWon = true;
            } else {
                // Won
                endGame(currentPlayer, "SANK THE 8-BALL!");
                gameWon = true;
            }
        } else {
            let isStripe = b.isStripe;
            if (p1Group === 'stripe') {
                if (isStripe) { p1BallsPocketed.push(b.number); if(currentPlayer===1) pocketedOwn = true; }
                else { p2BallsPocketed.push(b.number); if(currentPlayer===2) pocketedOwn = true; }
            } else if (p1Group === 'solid') {
                if (!isStripe) { p1BallsPocketed.push(b.number); if(currentPlayer===1) pocketedOwn = true; }
                else { p2BallsPocketed.push(b.number); if(currentPlayer===2) pocketedOwn = true; }
            } else {
                // Still open table, they pocketed something and no foul
                pocketedOwn = true;
            }
        }
    });

    if (gameWon) return;

    if (!foul && pocketedOwn) {
        switchTurn = false;
        msg = "GOOD SHOT!";
    }

    if (foul) {
        showFoul(msg);
    }

    if (switchTurn) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnIndicator.innerText = (currentPlayer === 1 ? p1Name : p2Name).toUpperCase() + "'S TURN";
    }

    updateHUD();

    if (state !== 'BALL_IN_HAND') {
        state = 'AIMING';
    }
    
    startTimer();
}

function getRemainingSolids() {
    return balls.filter(b => b.number >= 1 && b.number <= 7 && !b.pocketed).length;
}

function getRemainingStripes() {
    return balls.filter(b => b.number >= 9 && b.number <= 15 && !b.pocketed).length;
}

function updateHUD() {
    p1Card.classList.toggle('active', currentPlayer === 1);
    p2Card.classList.toggle('active', currentPlayer === 2);
    
    document.getElementById('p1Score').innerText = p1BallsPocketed.length * 100;
    document.getElementById('p2Score').innerText = p2BallsPocketed.length * 100;
    
    let p1BallsHTML = '';
    if (p1Group) p1BallsHTML += `<span style="font-size:0.7em; color:#aaa">${p1Group.toUpperCase()}S: </span>`;
    p1BallsPocketed.forEach(num => {
        let b = balls.find(x => x.number === num);
        p1BallsHTML += `<div class="ball-dot" style="background:${b.color}"></div>`;
    });
    document.getElementById('p1Balls').innerHTML = p1BallsHTML;
    
    let p2BallsHTML = '';
    if (p2Group) p2BallsHTML += `<span style="font-size:0.7em; color:#aaa">${p2Group.toUpperCase()}S: </span>`;
    p2BallsPocketed.forEach(num => {
        let b = balls.find(x => x.number === num);
        p2BallsHTML += `<div class="ball-dot" style="background:${b.color}"></div>`;
    });
    document.getElementById('p2Balls').innerHTML = p2BallsHTML;
}

function showFoul(msg) {
    foulMsg.innerText = msg;
    setTimeout(() => { foulMsg.innerText = ""; }, 3000);
}

function startTimer() {
    stopTimer();
    turnTimer = 30;
    timerText.innerText = turnTimer;
    timerCircle.style.strokeDashoffset = 0;
    
    timerInterval = setInterval(() => {
        turnTimer--;
        timerText.innerText = turnTimer;
        
        let pct = (30 - turnTimer) / 30;
        timerCircle.style.strokeDashoffset = pct * 163;
        
        if (turnTimer <= 5) timerCircle.style.stroke = 'red';
        else timerCircle.style.stroke = 'var(--gold)';
        
        if (turnTimer <= 0) {
            stopTimer();
            showFoul("TIME UP! BALL IN HAND.");
            state = 'BALL_IN_HAND';
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateHUD();
            startTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function endGame(winnerNum, reason) {
    isPlaying = false;
    stopTimer();
    let winner = winnerNum === 1 ? p1Name : p2Name;
    let score = winnerNum === 1 ? p1BallsPocketed.length * 100 + 1000 : p2BallsPocketed.length * 100 + 1000;
    
    document.getElementById('winnerName').innerText = winner + " WINS!";
    document.getElementById('winStats').innerText = reason + "\nSCORE: " + score;
    document.getElementById('winScreen').style.display = 'flex';
    
    // Save Score
    fetch('/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: winner, score: score })
    }).catch(e => console.error("Score save error", e));
}

// Controls
function pauseGame() { document.getElementById('pauseModal').style.display = 'flex'; stopTimer(); }
function resumeGame() { document.getElementById('pauseModal').style.display = 'none'; startTimer(); }
function restartGame() { document.getElementById('pauseModal').style.display = 'none'; document.getElementById('winScreen').style.display = 'none'; resetGame(); }
function goHome() { location.reload(); }
function confirmQuit() { if(confirm("Are you sure you want to quit?")) goHome(); }

// Spin pad logic (visual only for now)
let spinPadVisible = false;
function toggleSpin() {
    spinPadVisible = !spinPadVisible;
    document.getElementById('spinPad').style.display = spinPadVisible ? 'block' : 'none';
    document.getElementById('spinBtn').classList.toggle('active', spinPadVisible);
    if(spinPadVisible) {
        let sc = document.getElementById('spinCanvas');
        let sctx = sc.getContext('2d');
        sctx.fillStyle = '#f5f5f5'; sctx.beginPath(); sctx.arc(40,40,38,0,Math.PI*2); sctx.fill();
        sctx.fillStyle = 'red'; sctx.beginPath(); sctx.arc(40,40,4,0,Math.PI*2); sctx.fill();
    }
}

// Leaderboard Display
function showLeaderboard() {
    document.getElementById('leaderboardScreen').style.display = 'flex';
    fetch('/scores')
        .then(r => r.json())
        .then(data => {
            let html = '';
            if(!data || data.length === 0) html = '<div class="lb-empty">No scores yet</div>';
            else {
                data.forEach((s, i) => {
                    let rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
                    html += `<div class="lb-row">
                        <div class="lb-rank ${rankClass}">#${i+1}</div>
                        <div class="lb-name">${s.player}</div>
                        <div class="lb-score">${s.score}</div>
                    </div>`;
                });
            }
            document.getElementById('lbList').innerHTML = html;
        });
}
function hideLeaderboard() { document.getElementById('leaderboardScreen').style.display = 'none'; }

function undoShot() { console.log('Undo not implemented yet'); }

