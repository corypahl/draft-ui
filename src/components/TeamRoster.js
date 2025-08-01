import React from 'react';
import './TeamRoster.css';

const TeamRoster = ({ selectedTeam, draftedPlayers, currentLeague }) => {
  const getPositionCount = (position) => {
    return draftedPlayers.filter(player => player.position === position).length;
  };

  const getPositionColor = (position) => {
    switch (position) {
      case 'QB': return '#ff6b6b';
      case 'RB': return '#4ecdc4';
      case 'WR': return '#45b7d1';
      case 'TE': return '#96ceb4';
      case 'K': return '#feca57';
      case 'D': return '#ff9ff3';
      default: return '#ddd';
    }
  };

  if (!selectedTeam) {
    return (
      <div className="team-roster">
        <div className="roster-header">
          <h2>Team Roster</h2>
          <div className="league-info">
            <span className="league-name">{currentLeague}</span>
          </div>
        </div>
        <div className="no-team-selected">
          <p>Select a team from the draft board to view their roster.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-roster">
      <div className="roster-header">
        <h2>
          {selectedTeam.name}
        </h2>
        <div className="team-stats">
          <span>{draftedPlayers.length} players drafted</span>
          {selectedTeam.draftPosition && (
            <span className="draft-position">• Pick #{selectedTeam.draftPosition}</span>
          )}
        </div>
        <div className="league-info">
          <span className="league-name">{currentLeague}</span>
        </div>
      </div>

      <div className="position-summary">
        <div className="position-count">
          <span className="position-label">QB:</span>
          <span className="position-number">{getPositionCount('QB')}</span>
        </div>
        <div className="position-count">
          <span className="position-label">RB:</span>
          <span className="position-number">{getPositionCount('RB')}</span>
        </div>
        <div className="position-count">
          <span className="position-label">WR:</span>
          <span className="position-number">{getPositionCount('WR')}</span>
        </div>
        <div className="position-count">
          <span className="position-label">TE:</span>
          <span className="position-number">{getPositionCount('TE')}</span>
        </div>
        <div className="position-count">
          <span className="position-label">K:</span>
          <span className="position-number">{getPositionCount('K')}</span>
        </div>
        <div className="position-count">
          <span className="position-label">D:</span>
          <span className="position-number">{getPositionCount('D')}</span>
        </div>
      </div>

      <div className="roster-players">
        <h3>Drafted Players</h3>
        {draftedPlayers.length === 0 ? (
          <p className="no-players">No players drafted yet.</p>
        ) : (
          <div className="players-list">
            {draftedPlayers.map((player, index) => (
              <div key={player.id} className="roster-player">
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className="player-details">
                    <span 
                      className="player-position"
                      style={{ backgroundColor: getPositionColor(player.position) }}
                    >
                      {player.position}
                    </span>
                    <span className="player-team">{player.team}</span>
                    <span className="draft-round">Round {player.draftRound}</span>
                    {player.pickNumber && (
                      <span className="pick-number">Pick #{player.pickNumber}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="roster-analysis">
        <h3>Roster Analysis</h3>
        <div className="analysis-item">
          <span className="analysis-label">Strength:</span>
          <span className="analysis-value">
            {draftedPlayers.length > 0 ? 'Building...' : 'No players yet'}
          </span>
        </div>
        <div className="analysis-item">
          <span className="analysis-label">Needs:</span>
          <span className="analysis-value">
            {getPositionCount('RB') < 2 ? 'RB' : 
             getPositionCount('WR') < 2 ? 'WR' : 
             getPositionCount('QB') < 1 ? 'QB' : 'Depth'}
          </span>
        </div>
        <div className="analysis-item">
          <span className="analysis-label">Total Value:</span>
          <span className="analysis-value">
            {draftedPlayers.reduce((sum, player) => sum + (player.rank || 999), 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TeamRoster; 