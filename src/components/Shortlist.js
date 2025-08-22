import React, { useMemo } from 'react';
import './Shortlist.css';

const Shortlist = ({ draftState, currentLeague, playerData, onPlayerClick }) => {
  // Calculate which team should pick at a given pick number (snake draft logic)
  const getTeamForPick = (pickNumber, totalTeams) => {
    if (totalTeams === 0) return null;
    
    const round = Math.ceil(pickNumber / totalTeams);
    const positionInRound = ((pickNumber - 1) % totalTeams) + 1;
    
    // Odd rounds go forward (1, 2, 3, 4, 5, 6), even rounds go backward (6, 5, 4, 3, 2, 1)
    if (round % 2 === 1) {
      // Odd round - forward order
      return positionInRound;
    } else {
      // Even round - reverse order
      return totalTeams - positionInRound + 1;
    }
  };

  // Calculate when it's the user's next turn and which players are likely to be picked
  const projectedPicks = useMemo(() => {
    if (!draftState.userTeam || !draftState.teams || draftState.teams.length === 0) {
      return { playersToPick: [], picksUntilMyTurn: 0 };
    }

    const userTeam = draftState.userTeam;
    const totalTeams = draftState.teams.length;
    const currentPick = draftState.currentPick;
    
    // Calculate picks until user's next turn
    let picksUntilMyTurn = 0;
    let nextUserPick = 0;
    
    // Find the next pick that belongs to the user using snake draft logic
    for (let pick = currentPick; pick <= draftState.totalPicks; pick++) {
      const teamNumber = getTeamForPick(pick, totalTeams);
      const team = draftState.teams[teamNumber - 1]; // Convert to 0-based index
      
      if (team && team.id === userTeam.id) {
        nextUserPick = pick;
        picksUntilMyTurn = pick - currentPick;
        break;
      }
    }
    
    // If we couldn't find the next user pick, it might be the end of the draft
    if (nextUserPick === 0) {
      picksUntilMyTurn = draftState.totalPicks - currentPick + 1;
    }
    
    // Get players likely to be picked before user's next turn
    const playersToPick = [];
    if (picksUntilMyTurn > 0 && playerData.allPlayers) {
      // Get available players (not drafted)
      const draftedPlayerNames = draftState.draftedPlayers.map(p => {
        if (p.metadata?.first_name && p.metadata?.last_name) {
          return `${p.metadata.first_name} ${p.metadata.last_name}`;
        }
        return p.name || '';
      }).filter(name => name);
      
      const availablePlayers = playerData.allPlayers.filter(player => 
        !draftedPlayerNames.some(draftedName => 
          player.name.toLowerCase() === draftedName.toLowerCase()
        )
      );
      
      // Sort by ADP if available, otherwise by rank
      const sortedByADP = availablePlayers
        .filter(player => player.adp && !isNaN(parseFloat(player.adp)))
        .sort((a, b) => parseFloat(a.adp) - parseFloat(b.adp));
      
      const sortedByRank = availablePlayers
        .filter(player => !player.adp || isNaN(parseFloat(player.adp)))
        .sort((a, b) => a.rank - b.rank);
      
      // Combine ADP-sorted and rank-sorted players
      const allSorted = [...sortedByADP, ...sortedByRank];
      
      // Take the top players based on picks until user's turn
      playersToPick.push(...allSorted.slice(0, picksUntilMyTurn));
    }
    
    return { playersToPick, picksUntilMyTurn };
  }, [draftState, playerData.allPlayers]);

  // Calculate player scores using the same logic as Recommendations
  const calculatePlayerScore = (player, myPlayers, positionNeeds, currentRound) => {
    let totalScore = 0;
    const reasons = [];
    
    // 1. Position Need Score (0-30 points)
    const positionNeed = positionNeeds[player.position] || 0;
    const positionScore = positionNeed * 30;
    totalScore += positionScore;
    
    // 2. Rank Score (0-25 points)
    const rankScore = Math.max(0, (200 - player.rank) * 0.125);
    totalScore += rankScore;
    
    // 3. ADP Value Score (0-10 points) - Reduced weight
    if (player.adp) {
      const adpMatch = player.adp.toString().match(/^(\d+)\./);
      if (adpMatch) {
        const adpRound = parseInt(adpMatch[1]);
        const roundDiff = currentRound - adpRound;
        
        if (roundDiff >= 2) {
          totalScore += 10;
        } else if (roundDiff >= 1) {
          totalScore += 7;
        } else if (roundDiff === 0) {
          totalScore += 5;
        } else if (roundDiff >= -1) {
          totalScore += 2;
        }
      }
    }
    
    return Math.round(totalScore);
  };

  // Filter out drafted players and sort by global rank
  const shortlistPlayers = useMemo(() => {
    if (!playerData.allPlayers || playerData.allPlayers.length === 0) {
      return [];
    }

    // Get drafted player names from both Sleeper and Google Apps Script data
    const draftedPlayerNames = draftState.draftedPlayers.map(p => {
      // Handle Sleeper format (metadata.first_name + metadata.last_name)
      if (p.metadata?.first_name && p.metadata?.last_name) {
        return `${p.metadata.first_name} ${p.metadata.last_name}`;
      }
      // Handle Google Apps Script format (direct name field)
      return p.name || '';
    }).filter(name => name); // Remove empty names
    
    // Filter out players who have been drafted
    const available = playerData.allPlayers.filter(player => 
      !draftedPlayerNames.some(draftedName => 
        player.name.toLowerCase() === draftedName.toLowerCase()
      )
    );
    
    // Calculate position needs
    const myPlayers = draftState.userTeam?.picks || [];
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
    
    // Calculate current round
    const totalTeams = draftState.teams.length;
    const currentRound = Math.ceil(draftState.currentPick / totalTeams);
    
    // Add scores to players and sort by score (highest first), then by rank
    const playersWithScores = available.map(player => ({
      ...player,
      score: calculatePlayerScore(player, myPlayers, positionNeeds, currentRound)
    }));
    
    return playersWithScores.sort((a, b) => a.rank - b.rank);
  }, [draftState.draftedPlayers, playerData.allPlayers, draftState.userTeam, draftState.currentPick, draftState.teams.length]);

  // Calculate position rank for a player
  const getPositionRank = (player, availablePlayers) => {
    // Use the positionalRank field if available, otherwise calculate it
    if (player.positionalRank) {
      return player.positionalRank;
    }
    
    // Fallback calculation based on global rank within position (only among available players)
    const samePositionPlayers = availablePlayers.filter(p => p.position === player.position);
    const sortedByRank = samePositionPlayers.sort((a, b) => a.rank - b.rank);
    const positionRank = sortedByRank.findIndex(p => p.id === player.id) + 1;
    return positionRank;
  };

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

  // Check if a player is likely to be picked before user's next turn
  const isLikelyToBePicked = (player) => {
    return projectedPicks.playersToPick.some(p => p.id === player.id);
  };

  if (playerData.isLoading) {
    return (
      <div className="shortlist">
        <div className="shortlist-header">
          <h3>Shortlist</h3>
        </div>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (playerData.error) {
    return (
      <div className="shortlist">
        <div className="shortlist-header">
          <h3>Shortlist</h3>
        </div>
        <div className="error-message">{playerData.error}</div>
      </div>
    );
  }

  return (
    <div className="shortlist">
      <div className="shortlist-header">
        <h3>Shortlist</h3>
        <div className="shortlist-count">
          {shortlistPlayers.length} available
          {projectedPicks.picksUntilMyTurn > 0 && (
            <span className="picks-until-turn">
              • {projectedPicks.picksUntilMyTurn} picks until your turn
            </span>
          )}
        </div>
      </div>

      <div className="shortlist-container">
        {shortlistPlayers.length === 0 ? (
          <div className="no-players">
            All players have been drafted!
          </div>
        ) : (
          shortlistPlayers.map((player) => {
            const positionRank = getPositionRank(player, shortlistPlayers);
            const likelyToBePicked = isLikelyToBePicked(player);
            
            return (
              <div 
                key={player.id} 
                className="shortlist-item"
                onClick={() => onPlayerClick && onPlayerClick(player)}
                style={{ cursor: onPlayerClick ? 'pointer' : 'default' }}
              >
                <span 
                  className="player-info-compact"
                  style={{ color: getPositionColor(player.position) }}
                >
                  #{player.rank} {player.name} ({player.position}{positionRank}) [{player.score}]
                  {player.injury && <span style={{ color: '#e53e3e', marginLeft: '4px', fontWeight: 'bold' }}>I</span>}
                  {player.isRookie && <span style={{ color: '#805ad5', marginLeft: '4px', fontWeight: 'bold' }}>R</span>}
                  {likelyToBePicked && <span style={{ color: 'white', marginLeft: '4px' }}>•</span>}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Shortlist; 