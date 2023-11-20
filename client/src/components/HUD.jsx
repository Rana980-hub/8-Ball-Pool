export default function HUD({ state, players, foulMsg, timer }) {
  
  const timerDashoffset = ((30 - timer) / 30) * 163
  
  return (
    <div className="hud">
      <div className={`player-card ${state.currentPlayer === 1 ? 'active' : ''}`} id="p1Card">
          <div className="player-avatar p1-avatar">P1</div>
          <div className="player-info">
              <span className="player-name">{players.p1}</span>
              <div className="ball-indicators">
                {state.p1Group && <span style={{fontSize:'0.7em', color:'#aaa'}}>{state.p1Group.toUpperCase()}S: </span>}
                {state.p1Balls.map((color, i) => <div key={i} className="ball-dot" style={{background: color}}></div>)}
              </div>
          </div>
          <div className="player-score">{state.p1Score}</div>
      </div>

      <div className="center-hud">
          <div className="turn-indicator">
              {(state.currentPlayer === 1 ? players.p1 : players.p2).toUpperCase()}'S TURN
          </div>
          <div className="foul-msg">{foulMsg}</div>
          <div className="timer-ring">
              <svg viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" className="timer-bg"/>
                  <circle cx="30" cy="30" r="26" className="timer-fill" 
                          style={{
                              strokeDashoffset: timerDashoffset, 
                              stroke: timer <= 5 ? 'red' : 'var(--gold)'
                          }}/>
              </svg>
              <span>{timer}</span>
          </div>
      </div>

      <div className={`player-card right ${state.currentPlayer === 2 ? 'active' : ''}`} id="p2Card">
          <div className="player-score">{state.p2Score}</div>
          <div className="player-info">
              <span className="player-name">{players.p2}</span>
              <div className="ball-indicators">
                  {state.p2Group && <span style={{fontSize:'0.7em', color:'#aaa'}}>{state.p2Group.toUpperCase()}S: </span>}
                  {state.p2Balls.map((color, i) => <div key={i} className="ball-dot" style={{background: color}}></div>)}
              </div>
          </div>
          <div className="player-avatar p2-avatar">P2</div>
      </div>
    </div>
  )
}
