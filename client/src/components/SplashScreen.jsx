import { useState } from 'react'

export default function SplashScreen({ onPlay, onLeaderboard }) {
  const [p1, setP1] = useState('Player 1')
  const [p2, setP2] = useState('Player 2')

  return (
    <div id="splashScreen">
      <div className="splash-content">
        <div className="logo-container">
            <div className="ball-logo">
                <div className="ball b8">8</div>
            </div>
            <h1>8 BALL POOL</h1>
            <p className="tagline">Professional Snooker Experience</p>
        </div>
        <div className="player-setup">
            <div className="input-group">
                <label>Player 1</label>
                <input type="text" maxLength="15" value={p1} onChange={e => setP1(e.target.value)} />
            </div>
            <div className="vs-badge">VS</div>
            <div className="input-group">
                <label>Player 2</label>
                <input type="text" maxLength="15" value={p2} onChange={e => setP2(e.target.value)} />
            </div>
        </div>
        <button className="btn-play" onClick={() => onPlay(p1 || 'Player 1', p2 || 'Player 2')}>
            <span>PLAY NOW</span>
            <div className="btn-shine"></div>
        </button>
        <button className="btn-scores" onClick={onLeaderboard}>🏆 LEADERBOARD</button>
      </div>
      <div className="floating-balls">
          <div className="fb fb1">1</div><div className="fb fb2">2</div>
          <div className="fb fb3">3</div><div className="fb fb4">4</div>
          <div className="fb fb5">5</div><div className="fb fb6">6</div>
          <div className="fb fb7">7</div><div className="fb fb8">8</div>
      </div>
    </div>
  )
}
