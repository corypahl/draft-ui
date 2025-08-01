import React from 'react';
import './DraftInfo.css';

const DraftInfo = ({ draftState, currentLeague }) => {
  const getCurrentTeam = () => {
    if (!draftState.teams || draftState.teams.length === 0) return null;
    const teamIndex = (draftState.currentPick - 1) % draftState.teams.length;
    return draftState.teams[teamIndex];
  };

  const getCurrentTeamName = () => {
    const currentTeam = getCurrentTeam();
    return currentTeam ? currentTeam.name : 'No Team';
  };

  const getCurrentTeamPlayers = () => {
    const currentTeam = getCurrentTeam();
    if (!currentTeam) return [];
    
    // Get players drafted by this team
    return draftState.draftedPlayers.filter(player => {
      // This is a simplified filter - you might need to adjust based on your data structure
      return player.owner_id === currentTeam.owner_id || 
             player.team_id === currentTeam.team_id;
    });
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

  return (
    <div className="draft-info">
      <div className="draft-info-header">
        <h2>Draft Info</h2>
        <div className="draft-status">
          {draftState.draftStatus === 'in_progress' ? (
            <span className="status-active">Draft in Progress</span>
          ) : (
            <span className="status-pending">Draft Pending</span>
          )}
        </div>
      </div>

      <div className="current-pick-section">
        <div className="pick-number">
          <span className="pick-label">Current Pick</span>
          <span className="pick-value">#{draftState.currentPick}</span>
        </div>
        
        <div className="current-team">
          <span className="team-label">On the Clock</span>
          <span className="team-name">{getCurrentTeamName()}</span>
        </div>
      </div>

      <div className="team-preview">
        <h3>Team Preview</h3>
        <div className="team-players">
          {getCurrentTeamPlayers().length > 0 ? (
            getCurrentTeamPlayers().map((player, index) => (
              <div key={index} className="team-player">
                <span 
                  className="player-position"
                  style={{ color: getPositionColor(player.position) }}
                >
                  {player.position}
                </span>
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
            ))
          ) : (
            <div className="no-players">
              <p>No players drafted yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="draft-summary">
        <div className="summary-item">
          <span className="summary-label">Total Picks:</span>
          <span className="summary-value">{draftState.totalRounds || 0}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Teams:</span>
          <span className="summary-value">{draftState.teams?.length || 0}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Drafted:</span>
          <span className="summary-value">{draftState.draftedPlayers?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default DraftInfo; 