import React, { useState } from 'react';
import './PlayerList.css';

const PlayerList = ({ availablePlayers, onPlayerSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');

  // Sample player data - in a real app, this would come from an API
  const samplePlayers = [
    { id: 1, name: 'Christian McCaffrey', position: 'RB', team: 'SF', rank: 1, tier: 1 },
    { id: 2, name: 'Tyreek Hill', position: 'WR', team: 'MIA', rank: 2, tier: 1 },
    { id: 3, name: 'Austin Ekeler', position: 'RB', team: 'WAS', rank: 3, tier: 1 },
    { id: 4, name: 'Justin Jefferson', position: 'WR', team: 'MIN', rank: 4, tier: 1 },
    { id: 5, name: 'Bijan Robinson', position: 'RB', team: 'ATL', rank: 5, tier: 1 },
    { id: 6, name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', rank: 6, tier: 1 },
    { id: 7, name: 'Saquon Barkley', position: 'RB', team: 'PHI', rank: 7, tier: 2 },
    { id: 8, name: 'CeeDee Lamb', position: 'WR', team: 'DAL', rank: 8, tier: 2 },
    { id: 9, name: 'Josh Allen', position: 'QB', team: 'BUF', rank: 9, tier: 2 },
    { id: 10, name: 'Derrick Henry', position: 'RB', team: 'BAL', rank: 10, tier: 2 },
  ];

  const filteredPlayers = samplePlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  });

  const getTierColor = (tier) => {
    switch (tier) {
      case 1: return '#ff6b6b';
      case 2: return '#4ecdc4';
      case 3: return '#45b7d1';
      case 4: return '#96ceb4';
      default: return '#feca57';
    }
  };

  return (
    <div className="player-list">
      <div className="player-list-header">
        <h2>Available Players</h2>
        <div className="player-filters">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="position-filter"
          >
            <option value="ALL">All Positions</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
            <option value="K">K</option>
            <option value="DEF">DEF</option>
          </select>
        </div>
      </div>

      <div className="players-table">
        <div className="table-header">
          <div className="header-rank">Rank</div>
          <div className="header-name">Player</div>
          <div className="header-position">Pos</div>
          <div className="header-team">Team</div>
          <div className="header-tier">Tier</div>
          <div className="header-action">Action</div>
        </div>

        <div className="players-table-body">
          {filteredPlayers.map((player) => (
            <div key={player.id} className="player-row">
              <div className="player-rank">{player.rank}</div>
              <div className="player-name">{player.name}</div>
              <div className="player-position">{player.position}</div>
              <div className="player-team">{player.team}</div>
              <div 
                className="player-tier"
                style={{ backgroundColor: getTierColor(player.tier) }}
              >
                {player.tier}
              </div>
              <div className="player-action">
                <button 
                  className="draft-btn"
                  onClick={() => onPlayerSelect(player)}
                >
                  Draft
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 && (
        <div className="no-players">
          <p>No players found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PlayerList; 