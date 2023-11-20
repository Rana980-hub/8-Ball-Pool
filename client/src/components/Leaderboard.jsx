import { useEffect, useState } from 'react'

export default function Leaderboard({ onBack }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/scores')
      .then(res => res.json())
      .then(data => {
        setScores(data || [])
        setLoading(false)
      })
      .catch(e => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  return (
    <div id="leaderboardScreen">
      <div className="lb-content">
          <h2>🏆 LEADERBOARD</h2>
          <div id="lbList">
            {loading ? <div className="lb-empty">Loading...</div> : 
              scores.length === 0 ? <div className="lb-empty">No scores yet</div> :
              scores.map((s, i) => (
                <div className="lb-row" key={i}>
                    <div className={`lb-rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}`}>#{i+1}</div>
                    <div className="lb-name">{s.player}</div>
                    <div className="lb-score">{s.score}</div>
                </div>
              ))
            }
          </div>
          <button className="btn-scores" onClick={onBack}>← BACK</button>
      </div>
    </div>
  )
}
