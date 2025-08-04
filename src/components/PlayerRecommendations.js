import React, { useMemo } from 'react';
import './PlayerRecommendations.css';

const PlayerRecommendations = ({ draftState, allPlayers, currentLeague }) => {
  const recommendations = useMemo(() => {
    if (!draftState.teams || draftState.teams.length === 0 || !allPlayers) {
      return { topPicks: [], needs: [], valuePicks: [] };
    }

    // Get current team (simplified - assumes team 1 is "my team")
    const myTeam = draftState.teams[0];
    if (!myTeam) return { topPicks: [], needs: [], valuePicks: [] };

    // Get my team's drafted players
    const myDraftedPlayers = draftState.draftedPlayers.filter(player => 
      player.teamId === myTeam.id
    );

    // Calculate position needs
    const positionCounts = {
      QB: 0, RB: 0, WR: 0, TE: 0, K: 0, D: 0
    };

    myDraftedPlayers.forEach(player => {
      const pos = player.position || player.metadata?.position;
      if (positionCounts.hasOwnProperty(pos)) {
        positionCounts[pos]++;
      }
    });

    // Determine position needs (typical fantasy roster: 1QB, 2RB, 2WR, 1TE, 1K, 1D)
    const positionNeeds = {
      QB: Math.max(0, 1 - positionCounts.QB),
      RB: Math.max(0, 2 - positionCounts.RB),
      WR: Math.max(0, 2 - positionCounts.WR),
      TE: Math.max(0, 1 - positionCounts.TE),
      K: Math.max(0, 1 - positionCounts.K),
      D: Math.max(0, 1 - positionCounts.D)
    };

    // Get available players (not drafted)
    const draftedPlayerNames = draftState.draftedPlayers.map(p => 
      p.metadata?.first_name && p.metadata?.last_name 
        ? `${p.metadata.first_name} ${p.metadata.last_name}`
        : p.name
    );

    const availablePlayers = allPlayers.filter(player => 
      !draftedPlayerNames.includes(player.name)
    );

    // Top picks by overall rank
    const topPicks = availablePlayers
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 5);

    // Position needs recommendations
    const needs = [];
    Object.entries(positionNeeds).forEach(([position, count]) => {
      if (count > 0) {
        const positionPlayers = availablePlayers
          .filter(p => p.position === position)
          .sort((a, b) => (a.rank || 999) - (b.rank || 999))
          .slice(0, 3);
        
        needs.push({
          position,
          count,
          players: positionPlayers
        });
      }
    });

    // Value picks (players ranked significantly higher than their ADP)
    const valuePicks = availablePlayers
      .filter(player => {
        const rank = player.rank || 999;
        const adp = player.adp || 999;
        return rank < adp - 20; // 20+ spots better than ADP
      })
      .sort((a, b) => {
        const aValue = (a.adp || 999) - (a.rank || 999);
        const bValue = (b.adp || 999) - (b.rank || 999);
        return bValue - aValue;
      })
      .slice(0, 5);

    return { topPicks, needs, valuePicks };
  }, [draftState, allPlayers]);

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

  if (!draftState.teams || draftState.teams.length === 0) {
    return (
      <div className="player-recommendations">
        <div className="recommendations-header">
          <h3>🎯 Smart Recommendations</h3>
          <p>Connect to a draft to see personalized recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="player-recommendations">
      <div className="recommendations-header">
        <h3>🎯 Smart Recommendations</h3>
        <div className="recommendations-subtitle">
          Based on your team needs and available players
        </div>
      </div>

      <div className="recommendations-grid">
        {/* Top Available Picks */}
        <div className="recommendation-section">
          <h4>🏆 Top Available</h4>
          <div className="player-list">
            {recommendations.topPicks.map((player, index) => (
              <div key={index} className="recommendation-player">
                <div className="player-rank">#{player.rank || 'N/A'}</div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className="player-details">
                    <span 
                      className="player-position"
                      style={{ color: getPositionColor(player.position) }}
                    >
                      {player.position}
                    </span>
                    <span className="player-team">{player.team}</span>
                  </div>
                </div>
                <div className="player-adp">ADP: {player.adp || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Position Needs */}
        <div className="recommendation-section">
          <h4>📋 Position Needs</h4>
          <div className="needs-list">
            {recommendations.needs.map((need, index) => (
              <div key={index} className="position-need">
                <div className="need-header">
                  <span 
                    className="need-position"
                    style={{ color: getPositionColor(need.position) }}
                  >
                    {need.position}
                  </span>
                  <span className="need-count">({need.count} needed)</span>
                </div>
                <div className="need-players">
                  {need.players.map((player, pIndex) => (
                    <div key={pIndex} className="need-player">
                      <span className="player-name">{player.name}</span>
                      <span className="player-rank">#{player.rank || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {recommendations.needs.length === 0 && (
              <div className="no-needs">
                <p>✅ All positions filled!</p>
              </div>
            )}
          </div>
        </div>

        {/* Value Picks */}
        <div className="recommendation-section">
          <h4>💎 Value Picks</h4>
          <div className="player-list">
            {recommendations.valuePicks.map((player, index) => (
              <div key={index} className="recommendation-player value-pick">
                <div className="player-rank">#{player.rank || 'N/A'}</div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className="player-details">
                    <span 
                      className="player-position"
                      style={{ color: getPositionColor(player.position) }}
                    >
                      {player.position}
                    </span>
                    <span className="player-team">{player.team}</span>
                  </div>
                </div>
                <div className="player-adp">
                  ADP: {player.adp || 'N/A'}
                  <span className="value-indicator">
                    +{((player.adp || 999) - (player.rank || 999))} spots
                  </span>
                </div>
              </div>
            ))}
            {recommendations.valuePicks.length === 0 && (
              <div className="no-value">
                <p>No significant value picks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRecommendations; 