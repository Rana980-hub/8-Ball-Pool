export default function WinScreen({ winner, reason, score, onPlayAgain, onHome }) {
  return (
    <div id="winScreen">
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
