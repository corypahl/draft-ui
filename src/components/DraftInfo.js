import React from 'react';
import './DraftInfo.css';

const DraftInfo = ({ draftState, currentLeague }) => {

  const getDraftProgress = () => {
    if (!draftState.totalPicks) return 0;
    const drafted = draftState.draftedPlayers.length;
    return Math.round((drafted / draftState.totalPicks) * 100);
  };

  const getAveragePicksPerTeam = () => {
    if (!draftState.teams.length) return 0;
    const totalPicks = draftState.draftedPlayers.length;
    return Math.round(totalPicks / draftState.teams.length);
  };

  const getMostDraftedPosition = () => {
    if (!draftState.draftedPlayers.length) return 'None';
    
    const positionCounts = {};
    draftState.draftedPlayers.forEach(player => {
      const pos = player.position || 'UNK';
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });
    
    return Object.entries(positionCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  };

  return (
    <div className="draft-info">
      <div className="draft-info-header">
        <h2>Draft Information</h2>
        <div className="draft-status">
          <span className={`status-badge ${draftState.draftStatus}`}>
            {draftState.draftStatus === 'complete' ? 'Complete' : 
             draftState.draftStatus === 'in_progress' ? 'In Progress' : 
             draftState.draftStatus === 'pre_draft' ? 'Pre-Draft' : 'Unknown'}
          </span>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>League Details</h3>
          <div className="info-item">
            <span className="label">League:</span>
            <span className="value">{currentLeague}</span>
          </div>
          {draftState.leagueName && (
            <div className="info-item">
              <span className="label">Draft Name:</span>
              <span className="value">{draftState.leagueName}</span>
            </div>
          )}
          {draftState.season && (
            <div className="info-item">
              <span className="label">Season:</span>
              <span className="value">{draftState.season}</span>
            </div>
          )}
          {draftState.dataSource && (
            <div className="info-item">
              <span className="label">Data Source:</span>
              <span className="value data-source">
                {draftState.dataSource === 'sleeper' ? 'Sleeper API' : 'Google Apps Script'}
              </span>
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>Draft Settings</h3>
          <div className="info-item">
            <span className="label">Teams:</span>
            <span className="value">{draftState.totalTeams || draftState.teams.length}</span>
          </div>
          <div className="info-item">
            <span className="label">Rounds:</span>
            <span className="value">{draftState.totalRounds}</span>
          </div>
          <div className="info-item">
            <span className="label">Total Picks:</span>
            <span className="value">{draftState.totalPicks}</span>
          </div>
          <div className="info-item">
            <span className="label">Draft Type:</span>
            <span className="value">{draftState.draftType || 'Snake'}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Current Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${getDraftProgress()}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {draftState.draftedPlayers.length} of {draftState.totalPicks} picks completed ({getDraftProgress()}%)
          </div>
          <div className="info-item">
            <span className="label">Current Pick:</span>
            <span className="value">{draftState.currentPick}</span>
          </div>
          <div className="info-item">
            <span className="label">Picks Remaining:</span>
            <span className="value">{draftState.picksRemaining}</span>
          </div>
        </div>

        <div className="info-card">
          <h3>Draft Statistics</h3>
          <div className="info-item">
            <span className="label">Avg Picks/Team:</span>
            <span className="value">{getAveragePicksPerTeam()}</span>
          </div>
          <div className="info-item">
            <span className="label">Most Drafted Position:</span>
            <span className="value">{getMostDraftedPosition()}</span>
          </div>
          <div className="info-item">
            <span className="label">Teams with Picks:</span>
            <span className="value">
              {draftState.teams.filter(team => team.picks.length > 0).length}
            </span>
          </div>
        </div>

        <div className="info-card">
          <h3>Team Identification</h3>
          {draftState.userTeam ? (
            <div className="info-item">
              <span className="label">Your Team:</span>
              <span className="value user-team">{draftState.userTeam.name}</span>
            </div>
          ) : (
            <div className="info-item">
              <span className="label">Your Team:</span>
              <span className="value not-found">Not Found</span>
            </div>
          )}
          <div className="info-item">
            <span className="label">Looking for:</span>
            <span className="value">
              {draftState.dataSource === 'sleeper' ? 'CoryPahl' : 'Cory'}
            </span>
          </div>
          {!draftState.userTeam && draftState.dataSource === 'google_apps_script' && (
            <div className="mock-draft-note">
              <p>💡 For mock drafts, make sure your team name in the Google Apps Script includes "Cory"</p>
            </div>
          )}
        </div>
      </div>

      {draftState.teams.length > 0 && (
        <div className="teams-summary">
          <h3>Team Summary</h3>
          <div className="teams-grid">
            {draftState.teams.map(team => (
              <div key={team.id} className="team-summary-card">
                <div className="team-header">
                  <span className="team-name">{team.name}</span>
                  <span className="pick-count">{team.picks.length} picks</span>
                </div>
                {team.picks.length > 0 && (
                  <div className="team-picks">
                    <div className="last-pick">
                      Last: {team.picks[team.picks.length - 1].name}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
};

export default DraftInfo; 