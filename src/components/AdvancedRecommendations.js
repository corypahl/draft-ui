import React, { useMemo } from 'react';
import './AdvancedRecommendations.css';

const AdvancedRecommendations = ({ draftState, allPlayers, onPlayerClick }) => {
  const recommendations = useMemo(() => {
    if (!draftState.userTeam || !allPlayers) {
      return null;
    }

    const myPlayers = draftState.userTeam.picks;
    const draftedPlayerNames = draftState.draftedPlayers.map(p => 
      p.metadata?.first_name && p.metadata?.last_name 
        ? `${p.metadata.first_name} ${p.metadata.last_name}`
        : p.name
    );

    const availablePlayers = allPlayers.filter(player => 
      !draftedPlayerNames.includes(player.name)
    );

    // Get my team's QBs and their teams
    const myQBs = myPlayers.filter(p => p.position === 'QB');
    const myQBTeams = myQBs.map(qb => qb.team);

    // Find stack opportunities
    const stackOpportunities = [];
    myQBTeams.forEach(qbTeam => {
      const qb = myQBs.find(qb => qb.team === qbTeam);
      if (!qb) return;

      const qbPlayerData = allPlayers.find(p => p.name === qb.name);
      if (!qbPlayerData) return;

      // Find WRs and TEs from same team
      const stackTargets = availablePlayers.filter(player => 
        player.team === qbTeam && (player.position === 'WR' || player.position === 'TE')
      );

      if (stackTargets.length > 0) {
        stackOpportunities.push({
          qb: qb,
          qbData: qbPlayerData,
          targets: stackTargets.slice(0, 3), // Top 3 targets
          team: qbTeam
        });
      }
    });

    // Bye week analysis
    const myByeWeeks = new Set();
    myPlayers.forEach(player => {
      const playerData = allPlayers.find(p => p.name === player.name);
      if (playerData?.bye) {
        myByeWeeks.add(playerData.bye);
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

    // Find bye week alternatives
    const byeWeekAlternatives = [];
    byeWeekConflicts.forEach(conflict => {
      const alternatives = availablePlayers.filter(player => 
        player.bye !== conflict.week && player.rank <= 100
      ).slice(0, 5);
      
      byeWeekAlternatives.push({
        week: conflict.week,
        alternatives
      });
    });

    // Reach vs Value analysis
    const reachValueAnalysis = availablePlayers
      .filter(player => player.rank && player.adp)
      .map(player => {
        const reach = player.rank - player.adp;
        const value = player.adp - player.rank;
        return {
          ...player,
          reach,
          value,
          isReach: reach > 0,
          isValue: value > 0
        };
      })
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 10);

    // Positional scarcity analysis
    const positionScarcity = {};
    ['QB', 'RB', 'WR', 'TE', 'K', 'D'].forEach(pos => {
      const topPlayers = availablePlayers
        .filter(p => p.position === pos)
        .sort((a, b) => (a.rank || 999) - (b.rank || 999))
        .slice(0, 12);

      const scarcityLevel = topPlayers.length < 6 ? 'Critical' : 
                           topPlayers.length < 10 ? 'Low' : 'Good';

      positionScarcity[pos] = {
        topPlayers,
        count: topPlayers.length,
        scarcityLevel,
        nextPick: topPlayers[0] || null
      };
    });

    // Critical scarcity alerts
    const scarcityAlerts = Object.entries(positionScarcity)
      .filter(([pos, data]) => data.scarcityLevel === 'Critical')
      .map(([pos, data]) => ({
        position: pos,
        ...data
      }));

    return {
      stackOpportunities,
      byeWeekConflicts,
      byeWeekAlternatives,
      reachValueAnalysis,
      positionScarcity,
      scarcityAlerts
    };
  }, [draftState, allPlayers]);

  if (!recommendations) {
    return (
      <div className="advanced-recommendations">
        <div className="recommendations-header">
          <h3>🎯 Advanced Recommendations</h3>
          <p>Connect to a draft to see advanced analysis</p>
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

  const getScarcityColor = (level) => {
    if (level === 'Critical') return '#e53e3e';
    if (level === 'Low') return '#d69e2e';
    return '#38a169';
  };

  return (
    <div className="advanced-recommendations">
      <div className="recommendations-header">
        <h3>🎯 Advanced Recommendations</h3>
        <div className="recommendations-subtitle">
          Stack opportunities, bye week management, and value analysis
        </div>
      </div>

      <div className="recommendations-grid">
        {/* Stack Opportunities */}
        {recommendations.stackOpportunities.length > 0 && (
          <div className="recommendation-section">
            <h4>🔗 Stack Opportunities</h4>
            <div className="stack-opportunities">
              {recommendations.stackOpportunities.map((stack, index) => (
                <div key={index} className="stack-opportunity">
                  <div className="stack-qb">
                    <span className="qb-name">{stack.qb.name}</span>
                    <span className="qb-team">{stack.team}</span>
                  </div>
                  <div className="stack-targets">
                    {stack.targets.map((target, tIndex) => (
                      <div key={tIndex} className="stack-target">
                        <span 
                          className="target-position"
                          style={{ color: getPositionColor(target.position) }}
                        >
                          {target.position}
                        </span>
                        <span 
                          className="target-name"
                          onClick={() => onPlayerClick && onPlayerClick(target)}
                          style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
                        >
                          {target.name}
                        </span>
                        <span className="target-rank">#{target.rank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bye Week Management */}
        {recommendations.byeWeekConflicts.length > 0 && (
          <div className="recommendation-section">
            <h4>⚠️ Bye Week Conflicts</h4>
            <div className="bye-week-alerts">
              {recommendations.byeWeekConflicts.map((conflict, index) => (
                <div key={index} className="bye-week-alert">
                  <div className="bye-week-header">
                    <span className="bye-week-number">Week {conflict.week}</span>
                    <span className="bye-week-count">{conflict.count} players</span>
                  </div>
                  <div className="bye-week-players">
                    {conflict.players.map((player, pIndex) => (
                      <span key={pIndex} className="bye-player">
                        {player.name} ({player.position})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {recommendations.byeWeekAlternatives.length > 0 && (
              <div className="bye-alternatives">
                <h5>Suggested Alternatives</h5>
                {recommendations.byeWeekAlternatives.map((alt, index) => (
                  <div key={index} className="bye-alternative">
                    <span className="alt-week">Week {alt.week}:</span>
                    <div className="alt-players">
                      {alt.alternatives.map((player, pIndex) => (
                        <span key={pIndex} className="alt-player">
                          {player.name} ({player.position})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reach vs Value Analysis */}
        <div className="recommendation-section">
          <h4>💰 Value Analysis</h4>
          <div className="value-analysis">
            <div className="value-categories">
              <div className="value-category">
                <h5>Best Values</h5>
                <div className="value-players">
                  {recommendations.reachValueAnalysis
                    .filter(p => p.isValue)
                    .slice(0, 5)
                    .map((player, index) => (
                      <div key={index} className="value-player positive">
                        <span className="player-name">{player.name}</span>
                        <span className="value-diff">+{player.value}</span>
                      </div>
                    ))}
                </div>
              </div>
              
              <div className="value-category">
                <h5>Biggest Reaches</h5>
                <div className="value-players">
                  {recommendations.reachValueAnalysis
                    .filter(p => p.isReach)
                    .slice(0, 5)
                    .map((player, index) => (
                      <div key={index} className="value-player negative">
                        <span className="player-name">{player.name}</span>
                        <span className="value-diff">-{player.reach}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Positional Scarcity Alerts */}
        {recommendations.scarcityAlerts.length > 0 && (
          <div className="recommendation-section">
            <h4>🚨 Scarcity Alerts</h4>
            <div className="scarcity-alerts">
              {recommendations.scarcityAlerts.map((alert, index) => (
                <div key={index} className="scarcity-alert">
                  <div className="scarcity-header">
                    <span 
                      className="scarcity-position"
                      style={{ color: getPositionColor(alert.position) }}
                    >
                      {alert.position}
                    </span>
                    <span 
                      className="scarcity-level"
                      style={{ color: getScarcityColor(alert.scarcityLevel) }}
                    >
                      {alert.count} remaining
                    </span>
                  </div>
                  {alert.nextPick && (
                    <div className="next-best">
                      Next: {alert.nextPick.name} (#{alert.nextPick.rank})
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positional Overview */}
        <div className="recommendation-section">
          <h4>📊 Position Overview</h4>
          <div className="position-overview">
            {Object.entries(recommendations.positionScarcity).map(([pos, data]) => (
              <div key={pos} className="position-status">
                <div className="position-header">
                  <span 
                    className="position-name"
                    style={{ color: getPositionColor(pos) }}
                  >
                    {pos}
                  </span>
                  <span 
                    className="position-count"
                    style={{ color: getScarcityColor(data.scarcityLevel) }}
                  >
                    {data.count} available
                  </span>
                </div>
                <div className="position-bar">
                  <div 
                    className="position-fill"
                    style={{ 
                      width: `${(data.count / 12) * 100}%`,
                      backgroundColor: getScarcityColor(data.scarcityLevel)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedRecommendations; 
