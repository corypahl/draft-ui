import React from 'react';
import './MyTeam.css';
import TeamAnalysis from './TeamAnalysis';

const MyTeam = ({ draftState, currentLeague, playerData }) => {
  const { userTeam } = draftState;

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

  if (!userTeam) {
    return (
      <div className="my-team">
        <div className="my-team-header">
          <h2>My Team</h2>
        </div>
        <div className="no-team-message">
          <p>Your team could not be identified in this league.</p>
          <p>Make sure your username matches one of these:</p>
          <ul>
            <li>Sleeper: <strong>CoryPahl</strong></li>
            <li>Google Apps Script: <strong>Cory</strong></li>
          </ul>
          <p>For mock drafts, you can manually set your team name in the Google Apps Script.</p>
        </div>
      </div>
    );
  }

  // Sort players by draft round and pick number
  const sortedPlayers = [...userTeam.picks].sort((a, b) => {
    if (a.draftRound !== b.draftRound) {
      return a.draftRound - b.draftRound;
    }
    return a.pickNumber - b.pickNumber;
  });

  return (
    <div className="my-team">
      <div className="my-team-header">
        <h2>My Team - {userTeam.name}</h2>
        <div className="team-info">
          <span className="draft-position">Draft Position: {userTeam.draftPosition}</span>
          <span className="players-count">{userTeam.picks.length} players drafted</span>
        </div>
      </div>

      {/* Team Analysis Section */}
      <div className="team-analysis-section">
        <TeamAnalysis 
          draftState={draftState} 
          allPlayers={playerData?.allPlayers || []} 
        />
      </div>

      {/* Team Roster Section */}
      <div className="team-roster-section">
        <h3 className="roster-section-title">Team Roster</h3>
        <div className="team-roster">
          {sortedPlayers.length === 0 ? (
            <div className="no-players-message">
              <p>No players drafted yet.</p>
            </div>
          ) : (
            <div className="players-list">
                             {sortedPlayers.map((player) => (
                 <div key={player.id} className="roster-player">
                   <div className="player-info">
                     <span className="draft-info-inline">
                       R{player.draftRound} #{player.pickNumber}
                     </span>
                     <span className="player-position" style={{ color: getPositionColor(player.position) }}>
                       {player.position}
                     </span>
                     <span className="player-name" style={{ color: getPositionColor(player.position) }}>
                       {player.name}
                     </span>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTeam; 