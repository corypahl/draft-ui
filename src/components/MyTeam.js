import React from 'react';
import './MyTeam.css';

const MyTeam = ({ draftState, currentLeague }) => {
  // This is a placeholder - you'll need to identify which team is "mine"
  // For now, I'll show all drafted players or you can pass a specific team ID
  const getMyTeamPlayers = () => {
    // This is a simplified approach - you might need to adjust based on your data structure
    // You could pass a specific team ID or user ID to identify "my team"
    return draftState.draftedPlayers || [];
  };

  const getPositionColor = (position) => {
    const colors = {
      'QB': '#e53e3e',
      'RB': '#38a169',
      'WR': '#3182ce',
      'TE': '#805ad5',
      'K': '#d69e2e',
      'DEF': '#dd6b20'
    };
    return colors[position] || '#718096';
  };

  const groupPlayersByPosition = (players) => {
    const grouped = {
      'QB': [],
      'RB': [],
      'WR': [],
      'TE': [],
      'K': [],
      'DEF': []
    };

    players.forEach(player => {
      const position = player.position || player.metadata?.position;
      if (grouped[position]) {
        grouped[position].push(player);
      }
    });

    return grouped;
  };

  const myPlayers = getMyTeamPlayers();
  const playersByPosition = groupPlayersByPosition(myPlayers);

  return (
    <div className="my-team">
      <div className="my-team-header">
        <h2>My Team</h2>
        <div className="team-count">
          {myPlayers.length} players
        </div>
      </div>

      <div className="team-roster">
        {myPlayers.length > 0 ? (
          Object.entries(playersByPosition).map(([position, players]) => {
            if (players.length === 0) return null;
            
            return (
              <div key={position} className="position-group">
                <div className="position-header">
                  <span className="position-label">{position}</span>
                  <span className="position-count">({players.length})</span>
                </div>
                <div className="position-players">
                  {players.map((player, index) => (
                    <div key={index} className="roster-player">
                      <div className="player-info">
                        <span className="player-name">
                          {player.metadata?.first_name && player.metadata?.last_name 
                            ? `${player.metadata.first_name} ${player.metadata.last_name}`
                            : player.metadata?.name || player.name || 'Unknown Player'
                          }
                        </span>
                        <span className="player-team">
                          {player.metadata?.team || player.team || ''}
                        </span>
                      </div>
                      <div className="player-meta">
                        {player.metadata?.search_rank && (
                          <span className="player-rank">#{player.metadata.search_rank}</span>
                        )}
                        {player.metadata?.adp && (
                          <span className="player-adp">ADP: {player.metadata.adp}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-players">
            <p>No players drafted yet</p>
            <p className="subtitle">Your drafted players will appear here</p>
          </div>
        )}
      </div>

      <div className="team-summary">
        <div className="summary-item">
          <span className="summary-label">Total Players:</span>
          <span className="summary-value">{myPlayers.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Positions:</span>
          <span className="summary-value">
            {Object.entries(playersByPosition).filter(([pos, players]) => players.length > 0).length}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">League:</span>
          <span className="summary-value">{currentLeague}</span>
        </div>
      </div>
    </div>
  );
};

export default MyTeam; 