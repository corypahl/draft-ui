import React, { useMemo } from 'react';
import './Shortlist.css';

const Shortlist = ({ draftState, currentLeague, playerData, onPlayerClick }) => {
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
    
    // Sort by global rank
    return available.sort((a, b) => a.rank - b.rank);
  }, [draftState.draftedPlayers, playerData.allPlayers]);

  // Calculate position rank for a player
  const getPositionRank = (player, allPlayers) => {
    // Use the positionalRank field if available, otherwise calculate it
    if (player.positionalRank) {
      return player.positionalRank;
    }
    
    // Fallback calculation based on global rank within position
    const samePositionPlayers = allPlayers.filter(p => p.position === player.position);
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
        </div>
      </div>

      <div className="shortlist-container">
        {shortlistPlayers.length === 0 ? (
          <div className="no-players">
            All players have been drafted!
          </div>
        ) : (
          shortlistPlayers.map((player) => {
            const positionRank = getPositionRank(player, playerData.allPlayers);
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
                    #{player.rank} {player.name} ({player.position}{positionRank})
                    {player.injury && <span style={{ color: '#e53e3e', marginLeft: '4px' }}>*</span>}
                    {player.isRookie && <span style={{ color: '#805ad5', marginLeft: '4px', fontWeight: 'bold' }}>R</span>}
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