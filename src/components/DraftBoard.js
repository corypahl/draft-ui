import React from 'react';
import './DraftBoard.css';

const DraftBoard = ({ draftState, setDraftState, currentLeague }) => {
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

  const getCurrentRound = () => {
    if (draftState.teams.length === 0) return 1;
    return Math.ceil(draftState.currentPick / draftState.teams.length);
  };

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
          </div>
        </div>
        {draftState.teams.length === 0 && (
          <button className="add-team-btn" onClick={handleAddTeam}>
            + Add Team
          </button>
        )}
      </div>
      
      <div className="current-pick">
        <h3>Current Pick: #{draftState.currentPick}</h3>
        <div className="pick-info">
          <span className="current-team">{getCurrentTeamName()}</span>
          {draftState.totalRounds > 0 && (
            <span className="round-info">
              Round {getCurrentRound()} of {draftState.totalRounds}
            </span>
          )}
        </div>
        {draftState.picksRemaining !== undefined && (
          <div className="picks-remaining">
            Picks Remaining: {draftState.picksRemaining}
          </div>
        )}
      </div>

      <div className="teams-list">
        <h3>Teams ({draftState.teams.length})</h3>
        {draftState.teams.length === 0 ? (
          <p className="no-teams">
            {draftState.draftStatus === 'pre_draft' 
              ? 'No teams added yet. Click "Add Team" to get started.'
              : 'No teams found in draft data.'
            }
          </p>
        ) : (
          draftState.teams.map((team, index) => (
            <div key={team.id} className="team-item">
              <div className="team-info">
                <span className="team-name">{team.name}</span>
                {team.draftPosition && (
                  <span className="draft-position">#{team.draftPosition}</span>
                )}
              </div>
              <div className="team-stats">
                <span className="team-picks">{team.picks.length} picks</span>
                {team.picks.length > 0 && (
                  <span className="last-pick">
                    Last: {team.picks[team.picks.length - 1]?.name}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DraftBoard; 