import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, onRemove }) => {
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

  const getTierColor = (tier) => {
    if (!tier || tier === 0) return '#4a5568'; // Dark grey for no tier
    if (tier <= 2) return '#3182ce'; // Blue for tiers 1-2
    if (tier <= 4) return '#38a169'; // Green for tiers 3-4
    if (tier <= 6) return '#d69e2e'; // Yellow for tiers 5-6
    if (tier <= 8) return '#dd6b20'; // Orange for tiers 7-8
    if (tier <= 10) return '#e53e3e'; // Red for tiers 9-10
    return '#4a5568'; // Dark grey for tiers 11+
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') return value.toString();
    return value;
  };

  const renderStatRow = (label, value, color = null, className = '') => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className={`stat-row ${className}`}>
        <span className="stat-label">{label}:</span>
        <span className="stat-value" style={color ? { color } : {}}>
          {formatValue(value)}
        </span>
      </div>
    );
  };

  return (
    <div className="player-card">
      <div className="player-card-header">
        <div className="player-main-info">
          <div className="player-name">{player.name}</div>
          <div className="player-position" style={{ backgroundColor: getPositionColor(player.position) }}>
            {player.position}
          </div>
        </div>
        <button className="remove-player-btn" onClick={() => onRemove(player.id)}>
          ×
        </button>
      </div>
      
      <div className="player-stats">
        {/* Info Section */}
        <div className="stats-section">
          <div className="section-title">Info</div>
          {renderStatRow('Team', player.team)}
          {renderStatRow('Bye', player.bye)}
        </div>

        {/* Outlook Section */}
        <div className="stats-section">
          <div className="section-title">Outlook</div>
          {renderStatRow('Tier', player.tier, getTierColor(player.tier))}
          {renderStatRow('Overall Rank', player.rank, getTierColor(player.tier))}
          {renderStatRow('Position Rank', player.positionalRank)}
          {renderStatRow('Proj Points', player.projectedPoints)}
          {renderStatRow('ADP', player.adp)}
          {renderStatRow('Upside', player.upside)}
          {renderStatRow('Risk', player.risk)}
        </div>

        {/* History Section */}
        <div className="stats-section">
          <div className="section-title">History</div>
          {renderStatRow('Prev Rank', player.Prev_Rank || player['Prev_Rank'])}
          {renderStatRow('Prev Points', player.Prev_Pts || player['Prev_Pts'])}
          {renderStatRow('Boom', player.boom)}
          {renderStatRow('Bust', player.bust)}
        </div>

        {/* Injury Status Section */}
        {player.injury && (
          <div className="stats-section injury-section">
            <div className="section-title">Injury Status</div>
            {renderStatRow('Injury', player.injury, '#e53e3e')}
            {renderStatRow('Status', player.injuryStatus)}
          </div>
        )}

        {/* Rookie Info - Show if applicable */}
        {player.isRookie && (
          <div className="stats-section">
            <div className="section-title">Rookie Info</div>
            {renderStatRow('College', player.college)}
            {renderStatRow('Draft Round', player.draftRound)}
            {renderStatRow('Draft Pick', player.draftPick)}
          </div>
        )}
      </div>
    </div>
  );
  };
  
  export default PlayerCard; 