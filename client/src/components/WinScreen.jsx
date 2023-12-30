export default function WinScreen({ winner, reason, score, onPlayAgain, onHome }) {
  const confettiCount = 50;
  const confettiArr = Array.from({ length: confettiCount });

  return (
    <div id="winScreen">
      <div className="confetti-container">
        {confettiArr.map((_, i) => (
          <div 
            key={i} 
            className="confetti-piece" 
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#f0c040', '#ff4444', '#4488ff', '#44cc44', '#ffffff'][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      <div className="win-content">
          <div className="trophy-anim">🏆</div>
          <h2 id="winnerName">{winner} WINS!</h2>
          <div className="win-stats">
            {reason}<br/>
            SCORE: {score}
          </div>
          <button className="btn-play" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="btn-scores" onClick={onHome}>🏠 HOME</button>
      </div>
    </div>
  )
}
