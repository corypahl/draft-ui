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
        const prevPoints = playerData?.P_Pts || 0;
        
        return {
          ...player,
          rank: playerData?.rank || 999,
          adp,
          projectedPoints,
          upside,
          prevPoints,
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
      const byPrevPoints = [...availableWithData].sort((a, b) => (b.P_Pts || 0) - (a.P_Pts || 0));
      
      positionalBreakdown[pos] = {
        drafted: draftedWithData,
        available: availableWithData,
        byRank: byRank.slice(0, 3),
        byADP: byADP.slice(0, 3),
        byUpside: byUpside.slice(0, 3),
        byPrevPoints: byPrevPoints.slice(0, 3),
        need: positionNeeds[pos] > 0,
        count: myPosPlayers.length
      };
    });

    // Tier drop analysis (less sensitive)
    const tierDrops = analyzeTierDrops(availablePlayers, userNextPick);

    // Advanced recommendation system
    const topRecommendations = generateTopRecommendations(
      myPlayers, 
      availablePlayers, 
      positionNeeds, 
      userNextPick, 
      totalTeams
    );

    return {
      userNextPick,
      positionalBreakdown,
      tierDrops,
      positionNeeds,
      topRecommendations
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

  function generateTopRecommendations(myPlayers, availablePlayers, positionNeeds, userNextPick, totalTeams) {
    const currentRound = Math.ceil(userNextPick / totalTeams);
    const maxRounds = 15;
    
    // Analyze current team composition
    const teamAnalysis = analyzeTeamComposition(myPlayers);
    
    // Get bye week conflicts
    const byeConflicts = analyzeByeWeeks(myPlayers);
    
    // Filter out kickers and defenses until appropriate rounds
    const filteredPlayers = availablePlayers.filter(player => {
      if (player.position === 'K' && currentRound < 14) {
        return false; // Don't recommend kickers before round 14
      }
      if (player.position === 'D' && currentRound < 13) {
        return false; // Don't recommend defenses before round 13
      }
      return true;
    });
    
    // Score each available player
    const scoredPlayers = filteredPlayers.map(player => {
      const score = calculatePlayerScore(
        player, 
        myPlayers, 
        positionNeeds, 
        currentRound, 
        teamAnalysis, 
        byeConflicts
      );
      
      return {
        ...player,
        score,
        reasons: score.reasons
      };
    });
    
    // Sort by score and return top 6
    return scoredPlayers
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, 6)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
  }

  function analyzeTeamComposition(myPlayers) {
    const positionCounts = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, D: 0 };
    const positionStrength = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, D: 0 };
    
    myPlayers.forEach(player => {
      if (positionCounts.hasOwnProperty(player.position)) {
        positionCounts[player.position]++;
        // Add tier-based strength (lower tier = higher strength)
        const playerData = allPlayers.find(p => p.name === player.name);
        const tier = playerData?.tier || 11;
        positionStrength[player.position] += (12 - tier); // Invert tier for strength
      }
    });
    
    return {
      counts: positionCounts,
      strength: positionStrength,
      isBalanced: Math.abs(positionCounts.RB - positionCounts.WR) <= 1,
      needsQB: positionCounts.QB === 0,
      needsTE: positionCounts.TE === 0,
      needsK: positionCounts.K === 0,
      needsD: positionCounts.D === 0
    };
  }

  function analyzeByeWeeks(myPlayers) {
    const byeWeeks = new Set();
    const byeConflicts = {};
    
    myPlayers.forEach(player => {
      const playerData = allPlayers.find(p => p.name === player.name);
      if (playerData?.bye) {
        byeWeeks.add(playerData.bye);
        if (!byeConflicts[playerData.bye]) {
          byeConflicts[playerData.bye] = [];
        }
        byeConflicts[playerData.bye].push(player);
      }
    });
    
    return {
      byeWeeks: Array.from(byeWeeks),
      conflicts: byeConflicts,
      hasConflicts: Object.keys(byeConflicts).some(bye => byeConflicts[bye].length > 1)
    };
  }

  function calculatePlayerScore(player, myPlayers, positionNeeds, currentRound, teamAnalysis, byeConflicts) {
    const reasons = [];
    let totalScore = 0;
    
    // 1. Position Need Score (0-30 points)
    const positionNeed = positionNeeds[player.position] || 0;
    const positionScore = positionNeed * 30;
    totalScore += positionScore;
    if (positionNeed > 0) {
      reasons.push(`Position need: ${player.position} (${positionNeed} needed)`);
    }
    
    // 2. Rank Score (0-25 points)
    const rankScore = Math.max(0, (200 - player.rank) * 0.125);
    totalScore += rankScore;
    reasons.push(`Rank #${player.rank} player (tier ${player.tier})`);
    
    // 3. ADP Value Score (0-20 points)
    const adpValue = calculateADPValue(player.adp, currentRound);
    totalScore += adpValue.score;
    if (adpValue.score > 0) {
      reasons.push(adpValue.reason);
    }
    
    // 4. Stacking Opportunity Score (0-15 points)
    const stackScore = calculateStackingScore(player, myPlayers);
    totalScore += stackScore.score;
    if (stackScore.score > 0) {
      reasons.push(stackScore.reason);
    }
    
    // 5. Bye Week Mitigation Score (0-10 points)
    const byeScore = calculateByeWeekScore(player, byeConflicts);
    totalScore += byeScore.score;
    if (byeScore.score > 0) {
      reasons.push(byeScore.reason);
    }
    
    // 6. Team Balance Score (0-10 points)
    const balanceScore = calculateBalanceScore(player, teamAnalysis);
    totalScore += balanceScore.score;
    if (balanceScore.score > 0) {
      reasons.push(balanceScore.reason);
    }
    
         return {
       total: totalScore,
       breakdown: {
         position: positionScore,
         rank: rankScore,
         adp: adpValue.score,
         stack: stackScore.score,
         bye: byeScore.score,
         balance: balanceScore.score
       },
       reasons
     };
  }

  function calculateADPValue(adp, currentRound) {
    if (!adp) return { score: 0, reason: '' };
    
    const adpMatch = adp.toString().match(/^(\d+)\./);
    if (!adpMatch) return { score: 0, reason: '' };
    
    const adpRound = parseInt(adpMatch[1]);
    const roundDiff = currentRound - adpRound;
    
    if (roundDiff >= 2) {
      return { score: 10, reason: `Great value: ADP ${adp} (${roundDiff} rounds later)` };
    } else if (roundDiff >= 1) {
      return { score: 7, reason: `Good value: ADP ${adp} (1 round later)` };
    } else if (roundDiff === 0) {
      return { score: 5, reason: `Fair value: ADP ${adp} (at ADP)` };
    } else if (roundDiff >= -1) {
      return { score: 2, reason: `Slight reach: ADP ${adp} (1 round early)` };
    } else {
      return { score: 0, reason: `Reach: ADP ${adp} (${Math.abs(roundDiff)} rounds early)` };
    }
  }

  function calculateStackingScore(player, myPlayers) {
    if (player.position !== 'WR' && player.position !== 'TE') {
      return { score: 0, reason: '' };
    }
    
    const myQBs = myPlayers.filter(p => p.position === 'QB');
    let bestStackScore = 0;
    let bestStackReason = '';
    
    myQBs.forEach(qb => {
      const qbData = allPlayers.find(p => p.name === qb.name);
      if (qbData?.team === player.team) {
        const stackScore = 15;
        if (stackScore > bestStackScore) {
          bestStackScore = stackScore;
          bestStackReason = `Stack with ${qb.name} (${player.team})`;
        }
      }
    });
    
    return { score: bestStackScore, reason: bestStackReason };
  }

  function calculateByeWeekScore(player, byeConflicts) {
    if (!player.bye) return { score: 0, reason: '' };
    
    const conflicts = byeConflicts.conflicts[player.bye] || [];
    if (conflicts.length === 0) {
      return { score: 10, reason: `No bye week conflicts (Week ${player.bye})` };
    } else if (conflicts.length === 1) {
      return { score: 5, reason: `Minimal bye week conflict (Week ${player.bye})` };
    } else {
      return { score: 0, reason: `Bye week conflict with ${conflicts.length} players (Week ${player.bye})` };
    }
  }

  function calculateBalanceScore(player, teamAnalysis) {
    if (player.position === 'QB' && teamAnalysis.needsQB) {
      return { score: 10, reason: 'Fills QB need' };
    }
    if (player.position === 'TE' && teamAnalysis.needsTE) {
      return { score: 10, reason: 'Fills TE need' };
    }
    if (player.position === 'K' && teamAnalysis.needsK) {
      return { score: 10, reason: 'Fills K need' };
    }
    if (player.position === 'D' && teamAnalysis.needsD) {
      return { score: 10, reason: 'Fills D need' };
    }
    if (player.position === 'RB' && teamAnalysis.counts.RB < 2) {
      return { score: 8, reason: 'Strengthens RB depth' };
    }
    if (player.position === 'WR' && teamAnalysis.counts.WR < 2) {
      return { score: 8, reason: 'Strengthens WR depth' };
    }
    // Fix the balance logic - if you have more RBs than WRs, recommend WRs to balance
    if (player.position === 'WR' && teamAnalysis.counts.RB > teamAnalysis.counts.WR) {
      return { score: 5, reason: 'Balances WR/RB ratio' };
    }
    // If you have more WRs than RBs, recommend RBs to balance
    if (player.position === 'RB' && teamAnalysis.counts.WR > teamAnalysis.counts.RB) {
      return { score: 5, reason: 'Balances RB/WR ratio' };
    }
    
    return { score: 0, reason: '' };
  }



  if (!recommendations) {
    return (
      <div className="recommendations">
        <div className="recommendations-header">
          <h3>🎯 Targets</h3>
          <p>Connect to a draft to see targets</p>
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
        <h3>🎯 Targets</h3>
        <div className="recommendations-subtitle">
          Your next pick: #{recommendations.userNextPick}
        </div>
      </div>

      <div className="recommendations-grid">
        {/* Top 6 Recommendations */}
        {recommendations.topRecommendations && recommendations.topRecommendations.length > 0 && (
          <div className="recommendation-section top-recommendations-section">
            <h4>🎯 Top 6 Recommendations</h4>
            <div className="top-recommendations-grid">
              {recommendations.topRecommendations.map((player) => (
                <div 
                  key={player.id} 
                  className="recommendation-card-clean"
                  onClick={() => onPlayerClick && onPlayerClick(player)}
                  style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
                >
                  <div className="recommendation-card-header">
                    <div className="recommendation-rank-clean">#{player.rank}</div>
                    <div className="recommendation-player-info">
                      <div className="player-name-clean">{player.name}</div>
                      <div className="player-meta">
                        <span 
                          className="player-position-clean"
                          style={{ color: getPositionColor(player.position) }}
                        >
                          {player.position}
                        </span>
                        <span className="player-team-clean">{player.team}</span>
                        <span className="player-adp-clean">ADP: {player.adp}</span>
                      </div>
                    </div>
                    <div className="recommendation-score-clean">
                      <div className="score-value-clean">{Math.round(player.score.total)}</div>
                      <div className="score-label-clean">Score</div>
                    </div>
                  </div>
                  
                  <div className="recommendation-reasons-clean">
                    <div className="reasons-title-clean">Why this player:</div>
                    <div className="reasons-list-clean">
                      {player.reasons.slice(0, 3).map((reason, index) => (
                        <div key={index} className="reason-item-clean">
                          • {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                        <span className="header-prev-pts">Prev Pts</span>
                      </div>
                      {data.drafted.map((player, index) => (
                        <div key={index} className="table-row drafted-row">
                          <span className="cell-player">{player.name}</span>
                          <span className="cell-rank">{player.rank}</span>
                          <span className="cell-adp">{player.adp}</span>
                          <span className="cell-proj">{player.projectedPoints}</span>
                          <span className="cell-upside">{player.upside}</span>
                          <span className="cell-prev-pts">{player.prevPoints || 'N/A'}</span>
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
                          <span className="header-prev-pts">Prev Pts</span>
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
                            <span className="cell-prev-pts">{player.P_Pts || 'N/A'}</span>
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
                          <span className="header-prev-pts">Prev Pts</span>
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
                            <span className="cell-prev-pts">{player.P_Pts || 'N/A'}</span>
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
                          <span className="header-prev-pts">Prev Pts</span>
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
                            <span className="cell-prev-pts">{player.P_Pts || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By Previous Points */}
                    <div className="table-group">
                      <div className="table-title">By Previous Points</div>
                      <div className="players-table">
                        <div className="table-header">
                          <span className="header-player">Player</span>
                          <span className="header-rank">Rank</span>
                          <span className="header-adp">ADP</span>
                          <span className="header-proj">Proj</span>
                          <span className="header-prev-pts">Prev Pts</span>
                        </div>
                        {data.byPrevPoints.map((player, index) => (
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
                            <span className="cell-prev-pts">{player.P_Pts || 'N/A'}</span>
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


      </div>
    </div>
  );
};

export default Recommendations; 
