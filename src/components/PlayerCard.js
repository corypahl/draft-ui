import React, { useState } from 'react';
import './PlayerCard.css';

const PlayerCard = ({ player, isDrafted = false, draftRound = null, pickNumber = null, onAddToShortlist, onRemoveFromShortlist, inShortlist = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const getTierColor = (tier) => {
    if (tier <= 3) return '#38a169';
    if (tier <= 6) return '#d69e2e';
    return '#e53e3e';
  };

  const getValueColor = (rank, adp) => {
    if (!rank || !adp) return '#718096';
    const diff = adp - rank;
    if (diff >= 20) return '#38a169';
    if (diff >= 10) return '#d69e2e';
    if (diff <= -10) return '#e53e3e';
    return '#718096';
  };

  const getRiskColor = (risk) => {
    if (!risk) return '#718096';
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('high') || riskLower.includes('red')) return '#e53e3e';
    if (riskLower.includes('medium') || riskLower.includes('yellow')) return '#d69e2e';
    return '#38a169';
  };

  const formatValue = (rank, adp) => {
    if (!rank || !adp) return 'N/A';
    const diff = adp - rank;
    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`;
    return '0';
  };

  const handleShortlistToggle = (e) => {
    e.stopPropagation();
    if (inShortlist) {
      onRemoveFromShortlist(player);
    } else {
      onAddToShortlist(player);
    }
  };

  return (
    <div className={`player-card ${isDrafted ? 'drafted' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* Main Card Content */}
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="player-main-info">
          <div className="rank-section">
            <div className="rank-number">#{player.rank || 'N/A'}</div>
            <div className="tier-badge" style={{ backgroundColor: getTierColor(player.tier) }}>
              T{player.tier || '?'}
            </div>
          </div>
          
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
              {player.bye && <span className="bye-week">Bye: {player.bye}</span>}
            </div>
          </div>

          <div className="card-actions">
            <button 
              className={`shortlist-btn ${inShortlist ? 'in-shortlist' : ''}`}
              onClick={handleShortlistToggle}
              title={inShortlist ? 'Remove from shortlist' : 'Add to shortlist'}
            >
              {inShortlist ? '★' : '☆'}
            </button>
            <div className="expand-icon">{isExpanded ? '−' : '+'}</div>
          </div>
        </div>

        {/* Draft Info */}
        {isDrafted && (
          <div className="draft-info">
            <span className="draft-round">R{draftRound}</span>
            <span className="pick-number">#{pickNumber}</span>
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats">
        <div className="stat-item">
          <span className="stat-label">ADP</span>
          <span className="stat-value">{player.adp || 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Proj</span>
          <span className="stat-value">{player.projectedPoints ? Math.round(player.projectedPoints) : 'N/A'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Value</span>
          <span 
            className="stat-value value-indicator"
            style={{ color: getValueColor(player.rank, player.adp) }}
          >
            {formatValue(player.rank, player.adp)}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="expanded-content">
          <div className="detailed-stats">
            <div className="stat-row">
              <span className="stat-label">Risk Level:</span>
              <span 
                className="stat-value risk-indicator"
                style={{ color: getRiskColor(player.risk) }}
              >
                {player.risk || 'Unknown'}
              </span>
            </div>
            
            {player.upside && (
              <div className="stat-row">
                <span className="stat-label">Upside:</span>
                <span className="stat-value">{player.upside}</span>
              </div>
            )}
            
            {player.boom && (
              <div className="stat-row">
                <span className="stat-label">Boom:</span>
                <span className="stat-value">{player.boom}</span>
              </div>
            )}
            
            {player.bust && (
              <div className="stat-row">
                <span className="stat-label">Bust:</span>
                <span className="stat-value">{player.bust}</span>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="additional-info">
            {player.isRookie && (
              <div className="rookie-badge">
                🏈 Rookie - {player.college} (R{player.draftRound || '?'})
              </div>
            )}
            
            {player.injury && (
              <div className="injury-badge">
                ⚠️ {player.injury} - {player.injuryStatus}
              </div>
            )}
          </div>

          {/* Value Analysis */}
          <div className="value-analysis">
            <h5>Value Analysis</h5>
            <div className="value-breakdown">
              <div className="value-item">
                <span>Rank vs ADP:</span>
                <span className={player.rank < (player.adp || 999) ? 'positive' : 'negative'}>
                  {player.rank < (player.adp || 999) ? 'Value Pick' : 'Reach'}
                </span>
              </div>
              <div className="value-item">
                <span>Position Rank:</span>
                <span>{player.position} #{player.rank || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerCard; 