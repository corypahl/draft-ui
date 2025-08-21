import React, { useMemo } from 'react';
import './Recommendations.css';

const Recommendations = ({ draftState, allPlayers, onPlayerClick }) => {
  const recommendations = useMemo(() => {
    if (!draftState.userTeam || !allPlayers) {
      return null;
    }

    const myPlayers = draftState.userTeam.picks;
    const totalTeams = draftState.teams.length;
    const currentPick = draftState.currentPick;
    
    // Calculate user's next pick
    const userTeamId = draftState.userTeam.id;
    const userNextPick = calculateNextUserPick(currentPick, userTeamId, totalTeams);
    
    // Get drafted player names
    const draftedPlayerNames = draftState.draftedPlayers.map(p => 
      p.metadata?.first_name && p.metadata?.last_name 
        ? `${p.metadata.first_name} ${p.metadata.last_name}`
        : p.name
    );

    const availablePlayers = allPlayers.filter(player => 
      !draftedPlayerNames.includes(player.name)
    );

    // Position needs analysis
    const positionCounts = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, D: 0 };
    myPlayers.forEach(player => {
      if (positionCounts.hasOwnProperty(player.position)) {
        positionCounts[player.position]++;
      }
    });

    const positionNeeds = {
      QB: Math.max(0, 1 - positionCounts.QB),
      RB: Math.max(0, 2 - positionCounts.RB),
      WR: Math.max(0, 2 - positionCounts.WR),
      TE: Math.max(0, 1 - positionCounts.TE),
      K: Math.max(0, 1 - positionCounts.K),
      D: Math.max(0, 1 - positionCounts.D)
    };

    // Comprehensive positional breakdown with table format
    const positionalBreakdown = {};
    ['RB', 'WR', 'QB', 'TE', 'D', 'K'].forEach(pos => {
      const myPosPlayers = myPlayers.filter(p => p.position === pos);
      const availablePosPlayers = availablePlayers.filter(p => p.position === pos);
      
      // Process drafted players with full data
      const draftedWithData = myPosPlayers.map(player => {
        const playerData = allPlayers.find(p => p.name === player.name);
        const adp = playerData?.adp || 999;
        const projectedPoints = playerData?.projectedPoints || 0;
        const upside = playerData?.upside || 5; // Use actual upside value (1-10)
        
        return {
          ...player,
          rank: playerData?.rank || 999,
          adp,
          projectedPoints,
          upside,
          tier: playerData?.tier || 11
        };
      }).sort((a, b) => (a.rank || 999) - (b.rank || 999));
      
      // Process available players
      const availableWithData = availablePosPlayers.map(player => {
        const adp = player.adp || 999;
        const projectedPoints = player.projectedPoints || 0;
        const upside = player.upside || 5; // Use actual upside value (1-10)
        
        return {
          ...player,
          adp,
          projectedPoints,
          upside,
          tier: player.tier || 11
        };
      });
      
      // Sort by different criteria
      const byRank = [...availableWithData].sort((a, b) => (a.rank || 999) - (b.rank || 999));
      const byADP = [...availableWithData].sort((a, b) => (a.adp || 999) - (b.adp || 999));
      const byUpside = [...availableWithData].sort((a, b) => b.upside - a.upside);
      
      positionalBreakdown[pos] = {
        drafted: draftedWithData,
        available: availableWithData,
        byRank: byRank.slice(0, 3),
        byADP: byADP.slice(0, 3),
        byUpside: byUpside.slice(0, 3),
        need: positionNeeds[pos] > 0,
        count: myPosPlayers.length
      };
    });

    // Tier drop analysis (less sensitive)
    const tierDrops = analyzeTierDrops(availablePlayers, userNextPick);

    // Stack opportunities (improved)
    const stackOpportunities = findStackOpportunities(myPlayers, availablePlayers, userNextPick);

    return {
      userNextPick,
      positionalBreakdown,
      tierDrops,
      stackOpportunities,
      positionNeeds
    };
  }, [draftState, allPlayers]);

  // Helper functions
  function calculateNextUserPick(currentPick, userTeamId, totalTeams) {
    // Find the next pick that belongs to the user
    for (let pick = currentPick; pick <= currentPick + totalTeams * 2; pick++) {
      const teamForPick = getTeamForPick(pick, totalTeams);
      if (teamForPick === userTeamId) {
        return pick;
      }
    }
    return currentPick + totalTeams; // Fallback
  }

  function getTeamForPick(pickNumber, totalTeams) {
    if (totalTeams === 0) return null;
    
    const round = Math.ceil(pickNumber / totalTeams);
    const positionInRound = ((pickNumber - 1) % totalTeams) + 1;
    
    if (round % 2 === 1) {
      return positionInRound;
    } else {
      return totalTeams - positionInRound + 1;
    }
  }

  function analyzeTierDrops(availablePlayers, nextPick) {
    const tierDrops = {};
    ['QB', 'RB', 'WR', 'TE'].forEach(pos => {
      const posPlayers = availablePlayers
        .filter(p => p.position === pos)
        .sort((a, b) => (a.tier || 11) - (b.tier || 11));

      let currentTier = null;
      let dropPoint = null;

      for (let i = 0; i < posPlayers.length; i++) {
        const player = posPlayers[i];
        const tier = player.tier || 11;
        
        if (currentTier === null) {
          currentTier = tier;
        } else if (tier > currentTier) {
          dropPoint = i;
          break;
        }
      }

      if (dropPoint !== null) {
        // Less sensitive: only alert if drop is within 3 picks and it's a significant tier jump
        const isSignificantDrop = posPlayers[dropPoint].tier - currentTier >= 2;
        const isNearDrop = dropPoint <= 3;
        
        if (isSignificantDrop && isNearDrop) {
          tierDrops[pos] = {
            currentTier,
            nextTier: posPlayers[dropPoint].tier,
            playersUntilDrop: dropPoint,
            nextPickInRange: dropPoint <= 2
          };
        }
      }
    });

    return tierDrops;
  }

  function findStackOpportunities(myPlayers, availablePlayers, nextPick) {
    const myQBs = myPlayers.filter(p => p.position === 'QB');
    const opportunities = [];

    myQBs.forEach(qb => {
      const qbData = allPlayers.find(p => p.name === qb.name);
      if (!qbData?.team) return;

      const stackTargets = availablePlayers
        .filter(player => 
          player.team === qbData.team && 
          (player.position === 'WR' || player.position === 'TE')
        )
        .sort((a, b) => (a.adp || 999) - (b.adp || 999))
        .slice(0, 3);

      if (stackTargets.length > 0) {
        opportunities.push({
          qb: qb,
          qbTeam: qbData.team,
          targets: stackTargets,
          projectedPoints: qbData.projectedPoints || 0
        });
      }
    });

    return opportunities;
  }

  if (!recommendations) {
    return (
      <div className="recommendations">
        <div className="recommendations-header">
          <h3>🎯 Recommendations</h3>
          <p>Connect to a draft to see recommendations</p>
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

  return (
    <div className="recommendations">
      <div className="recommendations-header">
        <h3>🎯 Next Pick Analysis</h3>
        <div className="recommendations-subtitle">
          Your next pick: #{recommendations.userNextPick}
        </div>
      </div>

      <div className="recommendations-grid">
        {/* Positional Breakdown */}
        <div className="recommendation-section">
          <h4>📊 Positional Breakdown</h4>
          
          {/* Tier Drop Alerts - Compact at top */}
          {Object.keys(recommendations.tierDrops).length > 0 && (
            <div className="tier-drop-compact">
              <div className="tier-drop-header">⚠️ Tier Drops Coming</div>
              <div className="tier-drop-items">
                {Object.entries(recommendations.tierDrops).map(([pos, data]) => (
                  <span 
                    key={pos} 
                    className={`tier-drop-item ${data.nextPickInRange ? 'urgent' : 'warning'}`}
                    style={{ color: getPositionColor(pos) }}
                  >
                    {pos}: T{data.currentTier}→T{data.nextTier} ({data.playersUntilDrop} picks)
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="positional-breakdown">
            {Object.entries(recommendations.positionalBreakdown).map(([pos, data]) => (
              <div key={pos} className={`position-card ${data.need ? 'needed' : 'filled'}`}>
                <div className="position-header">
                  <span 
                    className="position-name"
                    style={{ color: getPositionColor(pos) }}
                  >
                    {pos}
                  </span>
                  <span className="position-count">
                    {data.count} drafted
                  </span>
                  {data.need && (
                    <span className="position-need">Need {recommendations.positionNeeds[pos]}</span>
                  )}
                </div>
                
                {/* Drafted Players Table */}
                <div className="players-section">
                  <div className="section-label">Drafted Players</div>
                  {data.drafted.length > 0 ? (
                    <div className="players-table">
                      <div className="table-header">
                        <span className="header-player">Player</span>
                        <span className="header-rank">Rank</span>
                        <span className="header-adp">ADP</span>
                        <span className="header-proj">Proj</span>
                        <span className="header-upside">Upside</span>
                      </div>
                      {data.drafted.map((player, index) => (
                        <div key={index} className="table-row drafted-row">
                          <span className="cell-player">{player.name}</span>
                          <span className="cell-rank">{player.rank}</span>
                          <span className="cell-adp">{player.adp}</span>
                          <span className="cell-proj">{player.projectedPoints}</span>
                          <span className="cell-upside">{player.upside}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-players">No players drafted</div>
                  )}
                </div>

                {/* Available Players Tables */}
                <div className="players-section">
                  <div className="section-label">Available Players</div>
                  <div className="available-tables">
                    {/* By Rank */}
                    <div className="table-group">
                      <div className="table-title">By Rank</div>
                      <div className="players-table">
                        <div className="table-header">
                          <span className="header-player">Player</span>
                          <span className="header-rank">Rank</span>
                          <span className="header-adp">ADP</span>
                          <span className="header-proj">Proj</span>
                          <span className="header-upside">Upside</span>
                        </div>
                        {data.byRank.map((player, index) => (
                          <div 
                            key={index} 
                            className="table-row available-row"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                            style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
                          >
                            <span className="cell-player">{player.name}</span>
                            <span className="cell-rank">{player.rank}</span>
                            <span className="cell-adp">{player.adp}</span>
                            <span className="cell-proj">{player.projectedPoints}</span>
                            <span className="cell-upside">{player.upside}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By ADP */}
                    <div className="table-group">
                      <div className="table-title">By ADP</div>
                      <div className="players-table">
                        <div className="table-header">
                          <span className="header-player">Player</span>
                          <span className="header-rank">Rank</span>
                          <span className="header-adp">ADP</span>
                          <span className="header-proj">Proj</span>
                          <span className="header-upside">Upside</span>
                        </div>
                        {data.byADP.map((player, index) => (
                          <div 
                            key={index} 
                            className="table-row available-row"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                            style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
                          >
                            <span className="cell-player">{player.name}</span>
                            <span className="cell-rank">{player.rank}</span>
                            <span className="cell-adp">{player.adp}</span>
                            <span className="cell-proj">{player.projectedPoints}</span>
                            <span className="cell-upside">{player.upside}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By Upside */}
                    <div className="table-group">
                      <div className="table-title">By Upside</div>
                      <div className="players-table">
                        <div className="table-header">
                          <span className="header-player">Player</span>
                          <span className="header-rank">Rank</span>
                          <span className="header-adp">ADP</span>
                          <span className="header-proj">Proj</span>
                          <span className="header-upside">Upside</span>
                        </div>
                        {data.byUpside.map((player, index) => (
                          <div 
                            key={index} 
                            className="table-row available-row"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                            style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
                          >
                            <span className="cell-player">{player.name}</span>
                            <span className="cell-rank">{player.rank}</span>
                            <span className="cell-adp">{player.adp}</span>
                            <span className="cell-proj">{player.projectedPoints}</span>
                            <span className="cell-upside">{player.upside}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stack Opportunities */}
        {recommendations.stackOpportunities.length > 0 && (
          <div className="recommendation-section">
            <h4>🔗 Stack Opportunities</h4>
            <div className="stack-opportunities">
              {recommendations.stackOpportunities.map((stack, index) => (
                <div key={index} className="stack-opportunity">
                  <div className="stack-qb">
                    <span className="qb-name">{stack.qb.name}</span>
                    <span className="qb-team">{stack.qbTeam}</span>
                  </div>
                  <div className="stack-targets">
                    {stack.targets.map((target, tIndex) => (
                      <div 
                        key={tIndex} 
                        className="stack-target"
                        onClick={() => onPlayerClick && onPlayerClick(target)}
                        style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
                      >
                        <span 
                          className="target-position"
                          style={{ color: getPositionColor(target.position) }}
                        >
                          {target.position}
                        </span>
                        <span className="target-name">{target.name}</span>
                        <span className="target-adp">ADP: {target.adp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations; 
