import { useEffect, useRef, useState } from 'react'
import { GameEngine } from '../game/engine'
import HUD from './HUD'

export default function GameCanvas({ players, onGameOver, onQuit }) {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  
  const [gameState, setGameState] = useState({
    currentPlayer: 1,
    p1Score: 0,
    p2Score: 0,
    p1Group: null,
    p2Group: null,
    p1Balls: [],
    p2Balls: [],
    powerPercent: 0
  })
  
  const [foulMsg, setFoulMsg] = useState('')
  const [turnTimer, setTurnTimer] = useState(30)
  
  useEffect(() => {
    if (!canvasRef.current) return
    
    const callbacks = {
      onStateUpdate: (state) => setGameState(state),
      onFoul: (msg) => { setFoulMsg(msg); setTimeout(()=>setFoulMsg(''), 3000) },
      onMessage: (msg) => { setFoulMsg(msg); setTimeout(()=>setFoulMsg(''), 3000) },
      onTurnReady: () => setTurnTimer(30),
      onGameOver: (winnerNum, reason) => {
        // Calculate score
        let score = winnerNum === 1 ? gameState.p1Balls.length * 100 + 1000 : gameState.p2Balls.length * 100 + 1000;
        onGameOver(winnerNum, reason, score)
      },
      onShoot: () => setTurnTimer(30) // Reset timer visually, or pause it during shot
    }
    
    engineRef.current = new GameEngine(canvasRef.current, callbacks)
    engineRef.current.p1Name = players.p1
    engineRef.current.p2Name = players.p2
    engineRef.current.start()
    
    return () => {
      engineRef.current.detachEvents()
    }
  }, [players])

  // Timer logic
  useEffect(() => {
    if (turnTimer <= 0) {
      if (engineRef.current && engineRef.current.state !== 'MOVING') {
         setFoulMsg("TIME UP! BALL IN HAND.")
         setTimeout(()=>setFoulMsg(''), 3000)
         engineRef.current.state = 'BALL_IN_HAND'
         engineRef.current.currentPlayer = engineRef.current.currentPlayer === 1 ? 2 : 1
         engineRef.current.notifyStateUpdate()
         setTurnTimer(30)
      }
    }
    
    const timer = setInterval(() => {
      if (engineRef.current && engineRef.current.state !== 'MOVING') {
        setTurnTimer(t => Math.max(0, t - 1))
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [turnTimer])

  return (
    <div id="gameScreen">
      <div className="game-wrapper">
        <HUD 
          state={gameState} 
          players={players} 
          foulMsg={foulMsg} 
          timer={turnTimer} 
        />
        
        <div className="table-container">
            <div className="table-frame">
                <div className="table-felt">
                    <canvas ref={canvasRef} id="gameCanvas"></canvas>
                    <div className="power-container">
                        <div className="power-label">POWER</div>
                        <div className="power-bar-wrap">
                            <div className="power-bar" style={{height: `${gameState.powerPercent}%`}}></div>
                        </div>
                        <div className="power-value">{Math.round(gameState.powerPercent)}%</div>
                    </div>
                </div>
            </div>
            <div className="pocket-label tl">●</div>
            <div className="pocket-label tr">●</div>
            <div className="pocket-label ml">●</div>
            <div className="pocket-label mr">●</div>
            <div className="pocket-label bl">●</div>
            <div className="pocket-label br">●</div>
        </div>
        
        <div className="controls-bar">
            <button className="ctrl-btn danger" onClick={onQuit}>✕ QUIT</button>
        </div>
      </div>
    </div>
  )
}
