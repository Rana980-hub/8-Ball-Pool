<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>8 Ball Pool - Professional Snooker</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>

<!-- SPLASH SCREEN -->
<div id="splashScreen">
    <div class="splash-content">
        <div class="logo-container">
            <div class="ball-logo">
                <div class="ball b8">8</div>
            </div>
            <h1>8 BALL POOL</h1>
            <p class="tagline">Professional Snooker Experience</p>
        </div>
        <div class="player-setup">
            <div class="input-group">
                <label>Player 1</label>
                <input type="text" id="player1Name" placeholder="Enter name..." maxlength="15" value="Player 1">
            </div>
            <div class="vs-badge">VS</div>
            <div class="input-group">
                <label>Player 2</label>
                <input type="text" id="player2Name" placeholder="Enter name..." maxlength="15" value="Player 2">
            </div>
        </div>
        <button class="btn-play" onclick="startGame()">
            <span>PLAY NOW</span>
            <div class="btn-shine"></div>
        </button>
        <button class="btn-scores" onclick="showLeaderboard()">🏆 LEADERBOARD</button>
    </div>
    <div class="floating-balls">
        <div class="fb fb1">1</div>
        <div class="fb fb2">2</div>
        <div class="fb fb3">3</div>
        <div class="fb fb4">4</div>
        <div class="fb fb5">5</div>
        <div class="fb fb6">6</div>
        <div class="fb fb7">7</div>
        <div class="fb fb8">8</div>
    </div>
</div>

<!-- GAME SCREEN -->
<div id="gameScreen" style="display:none;">
    <div class="game-wrapper">

        <!-- TOP HUD -->
        <div class="hud">
            <div class="player-card" id="p1Card">
                <div class="player-avatar p1-avatar">P1</div>
                <div class="player-info">
                    <span class="player-name" id="p1DisplayName">Player 1</span>
                    <div class="ball-indicators" id="p1Balls"></div>
                </div>
                <div class="player-score" id="p1Score">0</div>
            </div>

            <div class="center-hud">
                <div class="turn-indicator" id="turnIndicator">BREAK SHOT</div>
                <div class="foul-msg" id="foulMsg"></div>
                <div class="timer-ring">
                    <svg viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="26" class="timer-bg"/>
                        <circle cx="30" cy="30" r="26" class="timer-fill" id="timerCircle"/>
                    </svg>
                    <span id="timerText">30</span>
                </div>
            </div>

            <div class="player-card right" id="p2Card">
                <div class="player-score" id="p2Score">0</div>
                <div class="player-info">
                    <span class="player-name" id="p2DisplayName">Player 2</span>
                    <div class="ball-indicators" id="p2Balls"></div>
                </div>
                <div class="player-avatar p2-avatar">P2</div>
            </div>
        </div>

        <!-- TABLE AREA -->
        <div class="table-container">
            <div class="table-frame">
                <div class="table-felt">
                    <canvas id="gameCanvas"></canvas>
                    <!-- Power Meter -->
                    <div class="power-container" id="powerContainer">
                        <div class="power-label">POWER</div>
                        <div class="power-bar-wrap">
                            <div class="power-bar" id="powerBar"></div>
                        </div>
                        <div class="power-value" id="powerValue">0%</div>
                    </div>
                </div>
            </div>
            <!-- Pocket Labels -->
            <div class="pocket-label tl">●</div>
            <div class="pocket-label tr">●</div>
            <div class="pocket-label ml">●</div>
            <div class="pocket-label mr">●</div>
            <div class="pocket-label bl">●</div>
            <div class="pocket-label br">●</div>
        </div>

        <!-- CONTROLS -->
        <div class="controls-bar">
            <button class="ctrl-btn" onclick="toggleSpin()" id="spinBtn">🎯 SPIN</button>
            <div class="spin-pad" id="spinPad" style="display:none;">
                <canvas id="spinCanvas" width="80" height="80"></canvas>
                <div class="spin-label">Tap to set spin</div>
            </div>
            <button class="ctrl-btn" onclick="undoShot()">↩ UNDO</button>
            <button class="ctrl-btn" onclick="pauseGame()">⏸ PAUSE</button>
            <button class="ctrl-btn danger" onclick="confirmQuit()">✕ QUIT</button>
        </div>

    </div>
</div>

<!-- WIN SCREEN -->
<div id="winScreen" style="display:none;">
    <div class="win-content">
        <div class="trophy-anim">🏆</div>
        <h2 id="winnerName">Player 1 WINS!</h2>
        <div class="win-stats" id="winStats"></div>
        <div class="confetti-container" id="confettiContainer"></div>
        <button class="btn-play" onclick="restartGame()">PLAY AGAIN</button>
        <button class="btn-scores" onclick="goHome()">🏠 HOME</button>
    </div>
</div>

<!-- LEADERBOARD -->
<div id="leaderboardScreen" style="display:none;">
    <div class="lb-content">
        <h2>🏆 LEADERBOARD</h2>
        <div id="lbList"></div>
        <button class="btn-scores" onclick="hideLeaderboard()">← BACK</button>
    </div>
</div>

<!-- PAUSE MODAL -->
<div id="pauseModal" style="display:none;">
    <div class="modal-box">
        <h3>⏸ PAUSED</h3>
        <button class="btn-play" onclick="resumeGame()">▶ RESUME</button>
        <button class="btn-scores" onclick="restartGame()">↺ RESTART</button>
        <button class="btn-scores danger" onclick="goHome()">🏠 HOME</button>
    </div>
</div>

<script src="/js/physics.js"></script>
<script src="/js/game.js"></script>
</body>
</html>
