import { useState, useEffect } from 'react'
import './index.css'
import SplashScreen from './components/SplashScreen'
import GameCanvas from './components/GameCanvas'
import WinScreen from './components/WinScreen'
import Leaderboard from './components/Leaderboard'

function App() {
  const [screen, setScreen] = useState('splash') // splash, game, win, leaderboard
  const [players, setPlayers] = useState({ p1: 'Player 1', p2: 'Player 2' })
  const [winner, setWinner] = useState(null)
  const [winReason, setWinReason] = useState('')
  const [winScore, setWinScore] = useState(0)

  const startGame = (p1, p2) => {
    setPlayers({ p1, p2 })
    setScreen('game')
  }

  const handleGameOver = (winnerNum, reason, score) => {
    const winnerName = winnerNum === 1 ? players.p1 : players.p2
    setWinner(winnerName)
    setWinReason(reason)
    setWinScore(score)
    setScreen('win')
    
    // API Call to PHP backend
    fetch('http://localhost:8000/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: winnerName, score: score })
    }).catch(e => console.error("Score save error", e));
  }

  return (
    <div className="app-container">
      {screen === 'splash' && (
        <SplashScreen 
          onPlay={startGame} 
          onLeaderboard={() => setScreen('leaderboard')} 
        />
      )}
      
      {screen === 'game' && (
        <GameCanvas 
          players={players} 
          onGameOver={handleGameOver}
          onQuit={() => setScreen('splash')}
        />
      )}
      
      {screen === 'win' && (
        <WinScreen 
          winner={winner} 
          reason={winReason}
          score={winScore}
          onPlayAgain={() => setScreen('game')}
          onHome={() => setScreen('splash')}
        />
      )}
      
      {screen === 'leaderboard' && (
        <Leaderboard onBack={() => setScreen('splash')} />
      )}
    </div>
  )
}

export default App
