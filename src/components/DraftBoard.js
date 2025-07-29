import React from 'react';
import './DraftBoard.css';

const DraftBoard = ({ draftState, setDraftState, selectedTeam, setSelectedTeam }) => {
  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

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

  return (
    <div className="draft-board">
      <div className="draft-board-header">
        <h2>Draft Board</h2>
        <button className="add-team-btn" onClick={handleAddTeam}>
          + Add Team
        </button>
      </div>
      
      <div className="current-pick">
        <h3>Current Pick: #{draftState.currentPick}</h3>
        <div className="pick-info">
          {draftState.teams.length > 0 ? (
            <span>
              {draftState.teams[(draftState.currentPick - 1) % draftState.teams.length]?.name || 'No teams'}
            </span>
          ) : (
            <span>Add teams to start drafting</span>
          )}
        </div>
      </div>

      <div className="teams-list">
        <h3>Teams</h3>
        {draftState.teams.length === 0 ? (
          <p className="no-teams">No teams added yet. Click "Add Team" to get started.</p>
        ) : (
          draftState.teams.map((team, index) => (
            <div 
              key={team.id}
              className={`team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
              onClick={() => handleTeamClick(team)}
            >
              <span className="team-name">{team.name}</span>
              <span className="team-picks">{team.picks.length} picks</span>
            </div>
          ))
        )}
      </div>

      <div className="draft-controls">
        <button 
          className="control-btn"
          onClick={() => setDraftState(prev => ({ ...prev, currentPick: Math.max(1, prev.currentPick - 1) }))}
        >
          Previous Pick
        </button>
        <button 
          className="control-btn primary"
          onClick={() => setDraftState(prev => ({ ...prev, currentPick: prev.currentPick + 1 }))}
        >
          Next Pick
        </button>
      </div>
    </div>
  );
};

export default DraftBoard; 