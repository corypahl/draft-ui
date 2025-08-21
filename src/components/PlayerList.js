import React, { useState, useMemo } from 'react';
import './PlayerList.css';

const PlayerList = ({ availablePlayers, draftState, currentLeague, playerData }) => {
  const [visiblePositions, setVisiblePositions] = useState({
    'QB': true,
    'RB': true,
    'WR': true,
    'TE': true,
    'K': false,
    'D': false
  });

  // Filter out drafted players
  const filteredPlayers = useMemo(() => {
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
    
    return available.sort((a, b) => a.rank - b.rank);
  }, [draftState.draftedPlayers, playerData.allPlayers]);

  // Group players by position
  const playersByPosition = useMemo(() => {
    const grouped = {
      'QB': [],
      'RB': [],
      'WR': [],
      'TE': [],
      'K': [],
      'D': []
    };
    
    filteredPlayers.forEach(player => {
      if (grouped[player.position]) {
        grouped[player.position].push(player);
      }
    });
    
    // Sort players within each position by rank
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => a.rank - b.rank);
    });
    
    return grouped;
  }, [filteredPlayers]);

  // Handle position toggle
  const togglePosition = (position) => {
    setVisiblePositions(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

  const getTierColor = (tier) => {
    if (!tier || tier === 0) return '#4a5568'; // Dark grey for no tier
    if (tier <= 2) return '#3182ce'; // Blue for tiers 1-2
    if (tier <= 4) return '#38a169'; // Green for tiers 3-4
    if (tier <= 6) return '#d69e2e'; // Yellow for tiers 5-6
    if (tier <= 8) return '#dd6b20'; // Orange for tiers 7-8
    if (tier <= 10) return '#e53e3e'; // Red for tiers 9-10
    return '#4a5568'; // Dark grey for tiers 11+
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
      <div className="player-list">
        <div className="loading-message">
          Loading player data for {currentLeague} league...
        </div>
      </div>
    );
  }

  if (playerData.error) {
    return (
      <div className="player-list">
        <div className="error-message">
          {playerData.error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="player-list">
        <div className="player-list-header">
          <h2>Available Players - {currentLeague}</h2>
          <div className="player-count">
            {filteredPlayers.length} players available
          </div>
        </div>

        <div className="position-filters">
          {Object.entries(visiblePositions).map(([position, isVisible]) => (
            <button
              key={position}
              className={`position-filter-btn ${isVisible ? 'active' : ''}`}
              onClick={() => togglePosition(position)}
              style={{ 
                backgroundColor: isVisible ? getPositionColor(position) : 'var(--bg-tertiary)',
                color: isVisible ? 'white' : 'var(--text-primary)'
              }}
            >
              {position}
            </button>
          ))}
        </div>

        <div className="players-container">
          {filteredPlayers.length === 0 ? (
            <div className="no-players">
              All players have been drafted!
            </div>
          ) : (
            <div className="position-columns">
              {Object.entries(playersByPosition)
                .filter(([position]) => visiblePositions[position])
                .map(([position, players]) => (
                  <div key={position} className="position-column">
                    <div className="position-header">
                      <span className="position-label">{position}</span>
                      <span className="position-count">({players.length})</span>
                    </div>
                    <div className="position-players">
                      {players.map((player, index) => (
                        <div
                          key={player.id}
                          className="player-item"
                        >
                          <div className="player-rank" style={{ color: getTierColor(player.tier) }}>
                            #{player.rank}
                          </div>
                          <div className="player-name" style={{ color: getTierColor(player.tier) }}>
                            {player.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerList; 