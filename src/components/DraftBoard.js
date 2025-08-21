import React from 'react';
import './DraftBoard.css';

const DraftBoard = ({ draftState, setDraftState, currentLeague, onPlayerClick }) => {
  const handleAddTeam = () => {
    const teamName = prompt('Enter team name:');
    if (teamName) {
      const newTeam = {
        id: Date.now(),
        name: teamName,
        picks: []
      };
      setDraftState(prev => ({
        ...prev,
        teams: [...prev.teams, newTeam]
      }));
    }
  };

  const getCurrentTeamName = () => {
    if (draftState.teams.length === 0) return 'No teams';
    const teamIndex = (draftState.currentPick - 1) % draftState.teams.length;
    return draftState.teams[teamIndex]?.name || 'No teams';
  };

  const getCurrentTeam = () => {
    if (draftState.teams.length === 0) return null;
    const teamIndex = (draftState.currentPick - 1) % draftState.teams.length;
    return draftState.teams[teamIndex];
  };

  const getCurrentRound = () => {
    if (draftState.teams.length === 0) return 1;
    return Math.ceil(draftState.currentPick / draftState.teams.length);
  };

  // Get position color for player
  const getPositionColor = (position) => {
    const colors = {
      'QB': '#e53e3e', // Red
      'RB': '#38a169', // Green
      'WR': '#3182ce', // Blue
      'TE': '#805ad5', // Purple
      'K': '#d69e2e',  // Yellow
      'D': '#dd6b20',  // Orange
      'UNK': '#718096' // Gray
    };
    return colors[position] || colors['UNK'];
  };

  // Format player name as first initial + last name (Sleeper style)
  const formatPlayerName = (fullName) => {
    if (!fullName) return '';
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) return fullName;
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    return `${firstName.charAt(0)}. ${lastName}`;
  };

  // Get player for specific team and round
  const getPlayerForTeamAndRound = (teamId, round) => {
    const team = draftState.teams.find(t => t.id === teamId);
    if (!team) return null;
    
    return team.picks.find(pick => pick.draftRound === round);
  };

  // Check if this is the current pick
  const isCurrentPick = (teamId, round) => {
    const currentTeam = getCurrentTeam();
    const currentRound = getCurrentRound();
    return currentTeam?.id === teamId && currentRound === round;
  };

  // Calculate total rounds needed
  const totalRounds = draftState.totalRounds || Math.max(...draftState.teams.map(team => team.picks.length), 1);

  return (
    <div className="draft-board">
      <div className="draft-board-header">
        <div className="header-info">
          <h2>Draft Board</h2>
          <div className="league-info">
            <span className="league-name">{currentLeague}</span>
            {draftState.leagueName && (
              <span className="draft-name">• {draftState.leagueName}</span>
            )}
            {draftState.season && (
              <span className="season">• {draftState.season}</span>
            )}
            {draftState.dataSource && (
              <span className="data-source">• {draftState.dataSource === 'sleeper' ? 'Sleeper API' : 'Google Apps Script'}</span>
            )}
          </div>
        </div>
        {draftState.teams.length === 0 && (
          <button className="add-team-btn" onClick={handleAddTeam}>
            + Add Team
          </button>
        )}
      </div>
      


      {draftState.teams.length === 0 ? (
        <div className="no-teams">
          <p>
            {draftState.draftStatus === 'pre_draft' 
              ? 'No teams added yet. Click "Add Team" to get started.'
              : 'No teams found in draft data.'
            }
          </p>
        </div>
      ) : (
        <div className="draft-grid-container">
          <div className="draft-grid">
            {/* Header row with team names */}
            <div className="grid-header">
              <div className="round-label-header">Round</div>
              {draftState.teams.map((team, index) => (
                <div key={team.id} className="team-header">
                  <div className="team-name-header">{team.name}</div>
                </div>
              ))}
            </div>

            {/* Grid rows for each round */}
            {Array.from({ length: totalRounds }, (_, roundIndex) => {
              const round = roundIndex + 1;
              return (
                <div key={round} className="grid-row">
                  <div className="round-label">{round}</div>
                  {draftState.teams.map((team, teamIndex) => {
                    const player = getPlayerForTeamAndRound(team.id, round);
                    const isCurrent = isCurrentPick(team.id, round);
                    const isOnClock = getCurrentTeam()?.id === team.id;
                    
                    return (
                      <div 
                        key={`${team.id}-${round}`} 
                        className={`grid-cell ${isCurrent ? 'current-pick-cell' : ''} ${isOnClock ? 'on-clock-cell' : ''}`}
                      >
                        {player ? (
                          <div 
                            className="player-cell"
                            onClick={() => onPlayerClick && onPlayerClick(player)}
                            style={{ 
                              borderLeftColor: getPositionColor(player.position),
                              cursor: onPlayerClick ? 'pointer' : 'default'
                            }}
                          >
                            <div className="player-name" style={{ color: getPositionColor(player.position) }}>
                              {formatPlayerName(player.name)}
                            </div>
                          </div>
                        ) : isCurrent ? (
                          <div className="current-pick-placeholder">
                            <div className="pick-number">#{draftState.currentPick}</div>
                          </div>
                        ) : (
                          <div className="empty-cell">
                            <div className="pick-number">#{((round - 1) * draftState.teams.length) + teamIndex + 1}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftBoard; 