import React, { useMemo } from 'react';
import './TeamAnalysis.css';

const TeamAnalysis = ({ draftState, allPlayers }) => {
  const analysis = useMemo(() => {
    if (!draftState.userTeam || !allPlayers) {
      return null;
    }

    const myPlayers = draftState.userTeam.picks;
    
    // Position counts
    const positionCounts = {
      QB: 0, RB: 0, WR: 0, TE: 0, K: 0, D: 0
    };

    // Tier counts
    const tierCounts = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0
    };

    // Projected points by position
    const projectedPoints = {
      QB: 0, RB: 0, WR: 0, TE: 0, K: 0, D: 0
    };

    // Bye weeks
    const byeWeeks = new Set();

    myPlayers.forEach(player => {
      const pos = player.position;
      if (positionCounts.hasOwnProperty(pos)) {
        positionCounts[pos]++;
      }

      // Get player data for enhanced analysis
      const playerData = allPlayers.find(p => p.name === player.name);
      if (playerData) {
        const tier = playerData.tier || 11;
        tierCounts[tier]++;
        
        if (playerData.projectedPoints) {
          projectedPoints[pos] += playerData.projectedPoints;
        }

        if (playerData.bye) {
          byeWeeks.add(playerData.bye);
        }
      }
    });

    // Calculate team balance score (0-100, higher is more balanced)
    const totalPlayers = myPlayers.length;
    const idealDistribution = { QB: 1, RB: 2, WR: 2, TE: 1, K: 1, D: 1 };
    let balanceScore = 0;
    
    Object.keys(idealDistribution).forEach(pos => {
      const ideal = idealDistribution[pos];
      const actual = positionCounts[pos] || 0;
      const diff = Math.abs(actual - ideal);
      balanceScore += (1 - diff / ideal) * 100;
    });
    balanceScore = Math.round(balanceScore / 6);

    // Identify team composition type
    let teamType = 'Balanced';
    if (positionCounts.RB > positionCounts.WR + 1) teamType = 'RB-Heavy';
    else if (positionCounts.WR > positionCounts.RB + 1) teamType = 'WR-Heavy';
    else if (positionCounts.QB > 1) teamType = 'QB-Heavy';
    else if (positionCounts.TE > 1) teamType = 'TE-Heavy';

    // Tier analysis
    const topTiers = tierCounts[1] + tierCounts[2] + tierCounts[3];
    const midTiers = tierCounts[4] + tierCounts[5] + tierCounts[6];
    const lateTiers = tierCounts[7] + tierCounts[8] + tierCounts[9] + tierCounts[10] + tierCounts[11];

    // Bye week analysis
    const myByeWeeks = new Set();
    const byeWeekPlayers = {};
    
    myPlayers.forEach(player => {
      const playerData = allPlayers.find(p => p.name === player.name);
      if (playerData?.bye) {
        myByeWeeks.add(playerData.bye);
        
        if (!byeWeekPlayers[playerData.bye]) {
          byeWeekPlayers[playerData.bye] = [];
        }
        byeWeekPlayers[playerData.bye].push({
          ...player,
          position: player.position
        });
      }
    });

    const byeWeekConflicts = [];
    myByeWeeks.forEach(bye => {
      const playersOnBye = myPlayers.filter(player => {
        const playerData = allPlayers.find(p => p.name === player.name);
        return playerData?.bye === bye;
      });

      if (playersOnBye.length >= 2) {
        byeWeekConflicts.push({
          week: bye,
          players: playersOnBye,
          count: playersOnBye.length
        });
      }
    });

    // Create bye week overview for all weeks 5-14
    const byeWeekOverview = [];
    for (let week = 5; week <= 14; week++) {
      const playersOnBye = byeWeekPlayers[week] || [];
      byeWeekOverview.push({
        week,
        players: playersOnBye,
        count: playersOnBye.length,
        hasConflict: playersOnBye.length >= 2
      });
    }

    return {
      positionCounts,
      tierCounts,
      projectedPoints,
      balanceScore,
      teamType,
      topTiers,
      midTiers,
      lateTiers,
      byeWeeks: Array.from(byeWeeks).sort((a, b) => a - b),
      totalPlayers,
      byeWeekConflicts,
      byeWeekOverview
    };
  }, [draftState.userTeam, allPlayers]);

  if (!analysis) {
    return (
      <div className="team-analysis">
        <div className="analysis-header">
          <h3>📊 Team Analysis</h3>
          <p>Draft some players to see your team analysis</p>
        </div>
      </div>
    );
  }

  const getPositionColor = (position) => {
    const colors = {
      'QB': '#e53e3e',
      'RB': '#38a169',
      'WR': '#3182ce',
      'TE': '#805ad5',
      'K': '#d69e2e',
      'D': '#dd6b20'
    };
    return colors[position] || '#718096';
  };

  const getBalanceColor = (score) => {
    if (score >= 80) return '#38a169';
    if (score >= 60) return '#d69e2e';
    return '#e53e3e';
  };

  return (
    <div className="team-analysis">
      <div className="analysis-header">
        <h3>📊 Team Analysis</h3>
        <div className="team-type-badge" style={{ backgroundColor: getPositionColor('WR') }}>
          {analysis.teamType}
        </div>
      </div>

      <div className="analysis-grid">
        {/* Team Balance */}
        <div className="analysis-section">
          <h4>⚖️ Team Balance</h4>
          <div className="balance-score">
            <div className="score-circle" style={{ 
              backgroundColor: getBalanceColor(analysis.balanceScore),
              '--score': analysis.balanceScore
            }}>
              {analysis.balanceScore}%
            </div>
            <p>Position Balance Score</p>
          </div>
          
          <div className="balance-details">
            <div className="balance-summary">
              <span className="summary-label">Total Players:</span>
              <span className="summary-value">{analysis.totalPlayers}</span>
            </div>
            <div className="balance-summary">
              <span className="summary-label">Positions:</span>
              <span className="summary-value">{Object.keys(analysis.positionCounts).length}</span>
            </div>
          </div>
          
          <div className="position-distribution">
            <h5 className="distribution-title">Position Breakdown</h5>
            {Object.entries(analysis.positionCounts).map(([pos, count]) => (
              <div key={pos} className="position-bar">
                <div className="position-label" style={{ color: getPositionColor(pos) }}>
                  {pos}
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      backgroundColor: getPositionColor(pos),
                      width: `${(count / 8) * 100}%`
                    }}
                  />
                  <span className="count">{count}</span>
                </div>
                <div className="position-percentage">
                  {Math.round((count / analysis.totalPlayers) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bye Week Analysis */}
        <div className="analysis-section">
          <h4>📅 Bye Weeks</h4>
          <div className="bye-weeks">
            <div className="bye-week-overview">
              {analysis.byeWeekOverview.map(week => (
                <div key={week.week} className={`bye-week-row ${week.hasConflict ? 'has-conflict' : ''}`}>
                  <div className="bye-week-header">
                    <span className="bye-week-number">Week {week.week}</span>
                    <span className="bye-week-count">{week.count} player{week.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="bye-week-players">
                    {week.players.length > 0 ? (
                      <div className="position-icons">
                        {week.players.map((player, index) => (
                          <span 
                            key={`${player.name}-${index}`}
                            className="position-icon"
                            style={{ 
                              backgroundColor: getPositionColor(player.position),
                              color: 'white'
                            }}
                            title={`${player.name} (${player.position})`}
                          >
                            {player.position}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="no-players-placeholder">X</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projected Points */}
        <div className="analysis-section">
          <h4>📈 Projected Points</h4>
          <div className="projected-points">
            {Object.entries(analysis.projectedPoints)
              .filter(([pos, points]) => points > 0)
              .sort(([,a], [,b]) => b - a)
              .map(([pos, points]) => (
                <div key={pos} className="points-row">
                  <span className="position" style={{ color: getPositionColor(pos) }}>
                    {pos}
                  </span>
                  <span className="points">{Math.round(points)} pts</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamAnalysis; 