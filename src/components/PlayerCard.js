import React from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, selectedPlayers, onRemove }) => {
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

  // Helper function to get relative ranking color
  const getRelativeColor = (value, field, isLowerBetter = true) => {
    if (!value || selectedPlayers.length <= 1) return '#4a5568';
    
    const values = selectedPlayers
      .map(p => {
        let val = p[field];
        if (field === 'P_Rank' || field === 'P_Pts') {
          val = p[field] || p[`${field}`];
        }
        return val;
      })
      .filter(v => v !== null && v !== undefined && v !== '');
    
    if (values.length <= 1) return '#4a5568';
    
    // Check if all values are equal
    const uniqueValues = [...new Set(values.map(v => parseFloat(v) || 0))];
    if (uniqueValues.length === 1) return '#4a5568'; // Default color if all equal
    
    const sortedValues = [...values].sort((a, b) => {
      const aNum = parseFloat(a) || 0;
      const bNum = parseFloat(b) || 0;
      return isLowerBetter ? aNum - bNum : bNum - aNum;
    });
    
    const playerValue = parseFloat(value) || 0;
    const rank = sortedValues.indexOf(playerValue) + 1;
    const total = sortedValues.length;
    
    if (rank === 1) return '#38a169'; // Green for best
    if (rank === total) return '#e53e3e'; // Red for worst
    if (rank <= Math.ceil(total / 2)) return '#d69e2e'; // Yellow for above average
    return '#dd6b20'; // Orange for below average
  };

  // Conditional formatting functions using relative comparison
  const getRankColor = (rank) => {
    return getRelativeColor(rank, 'rank', true); // Lower rank is better
  };

  const getPointsColor = (points) => {
    return getRelativeColor(points, 'projectedPoints', false); // Higher points is better
  };

  const getADPColor = (adp, playerRank) => {
    if (!adp || !playerRank) return '#4a5568';
    const adpNum = parseFloat(adp);
    if (isNaN(adpNum)) return '#4a5568';
    
    // Calculate ADP vs Rank difference for this player
    const difference = adpNum - playerRank;
    
    // Get all ADP vs Rank differences for comparison
    const differences = selectedPlayers
      .map(p => {
        const pAdp = parseFloat(p.adp);
        const pRank = p.rank;
        if (isNaN(pAdp) || !pRank) return null;
        return pAdp - pRank;
      })
      .filter(d => d !== null);
    
    if (differences.length <= 1) return '#4a5568';
    
    const sortedDiffs = [...differences].sort((a, b) => a - b);
    const rank = sortedDiffs.indexOf(difference) + 1;
    const total = sortedDiffs.length;
    
    if (rank === 1) return '#38a169'; // Green for best value
    if (rank === total) return '#e53e3e'; // Red for worst value
    if (rank <= Math.ceil(total / 2)) return '#d69e2e'; // Yellow for above average
    return '#dd6b20'; // Orange for below average
  };

  const getRiskColor = (risk) => {
    return getRelativeColor(risk, 'risk', true); // Lower risk is better
  };

  const getUpsideColor = (upside) => {
    return getRelativeColor(upside, 'upside', false); // Higher upside is better
  };

  const getBoomBustColor = (value) => {
    return getRelativeColor(value, 'boom', false); // Higher boom is better
  };

  const getBustColor = (value) => {
    return getRelativeColor(value, 'bust', true); // Lower bust is better
  };

  const getByeWeekColor = (bye) => {
    return '#4a5568'; // Always default color
  };

  const getPrevRankColor = (prevRank) => {
    return getRelativeColor(prevRank, 'P_Rank', true); // Lower rank is better
  };

  const getPrevPointsColor = (prevPoints) => {
    return getRelativeColor(prevPoints, 'P_Pts', false); // Higher points is better
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
          {renderStatRow('Bye', player.bye, getByeWeekColor(player.bye))}
        </div>

        {/* Outlook Section */}
        <div className="stats-section">
          <div className="section-title">Outlook</div>
          {renderStatRow('Tier', player.tier, getRelativeColor(player.tier, 'tier', true))}
          {renderStatRow('Global Rank', player.rank, getRankColor(player.rank))}
          {renderStatRow('Position Rank', player.positionalRank, getRelativeColor(player.positionalRank, 'positionalRank', true))}
          {renderStatRow('Proj Points', player.projectedPoints, getPointsColor(player.projectedPoints))}
          {renderStatRow('ADP', player.adp, getADPColor(player.adp, player.rank))}
          {renderStatRow('Upside', player.upside, getUpsideColor(player.upside))}
          {renderStatRow('Risk', player.risk, getRiskColor(player.risk))}
        </div>

        {/* History Section */}
        <div className="stats-section">
          <div className="section-title">History</div>
          {renderStatRow('Prev Rank', player.P_Rank || player['P_Rank'], getPrevRankColor(player.P_Rank || player['P_Rank']))}
          {renderStatRow('Prev Points', player.P_Pts || player['P_Pts'], getPrevPointsColor(player.P_Pts || player['P_Pts']))}
          {renderStatRow('Boom', player.boom, getBoomBustColor(player.boom))}
          {renderStatRow('Bust', player.bust, getBustColor(player.bust))}
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