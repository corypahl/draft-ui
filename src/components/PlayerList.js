import React, { useState, useMemo } from 'react';
import './PlayerList.css';

const PlayerList = ({ availablePlayers, draftState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');

  // Sample player data - in a real app, this would come from an API
  const allPlayers = [
    { id: 1, name: 'Christian McCaffrey', position: 'RB', team: 'SF', rank: 1, tier: 1 },
    { id: 2, name: 'Tyreek Hill', position: 'WR', team: 'MIA', rank: 2, tier: 1 },
    { id: 3, name: 'Breece Hall', position: 'RB', team: 'NYJ', rank: 3, tier: 1 },
    { id: 4, name: 'CeeDee Lamb', position: 'WR', team: 'DAL', rank: 4, tier: 1 },
    { id: 5, name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', rank: 5, tier: 1 },
    { id: 6, name: 'Saquon Barkley', position: 'RB', team: 'PHI', rank: 6, tier: 2 },
    { id: 7, name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', rank: 7, tier: 2 },
    { id: 8, name: 'Bijan Robinson', position: 'RB', team: 'ATL', rank: 8, tier: 2 },
    { id: 9, name: 'Garrett Wilson', position: 'WR', team: 'NYJ', rank: 9, tier: 2 },
    { id: 10, name: 'Travis Kelce', position: 'TE', team: 'KC', rank: 10, tier: 2 },
    { id: 11, name: 'Josh Allen', position: 'QB', team: 'BUF', rank: 11, tier: 2 },
    { id: 12, name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', rank: 12, tier: 2 },
    { id: 13, name: 'Puka Nacua', position: 'WR', team: 'LAR', rank: 13, tier: 3 },
    { id: 14, name: 'Jonathan Taylor', position: 'RB', team: 'IND', rank: 14, tier: 3 },
    { id: 15, name: 'AJ Brown', position: 'WR', team: 'PHI', rank: 15, tier: 3 },
    { id: 16, name: 'Kyren Williams', position: 'RB', team: 'LAR', rank: 16, tier: 3 },
    { id: 17, name: 'Stefon Diggs', position: 'WR', team: 'HOU', rank: 17, tier: 3 },
    { id: 18, name: 'Rachaad White', position: 'RB', team: 'TB', rank: 18, tier: 3 },
    { id: 19, name: 'Chris Olave', position: 'WR', team: 'NO', rank: 19, tier: 3 },
    { id: 20, name: 'Jalen Hurts', position: 'QB', team: 'PHI', rank: 20, tier: 3 },
    { id: 21, name: 'Patrick Mahomes', position: 'QB', team: 'KC', rank: 21, tier: 3 },
    { id: 22, name: 'Lamar Jackson', position: 'QB', team: 'BAL', rank: 22, tier: 3 },
    { id: 23, name: 'Sam LaPorta', position: 'TE', team: 'DET', rank: 23, tier: 3 },
    { id: 24, name: 'Mark Andrews', position: 'TE', team: 'BAL', rank: 24, tier: 3 },
    { id: 25, name: 'T.J. Hockenson', position: 'TE', team: 'MIN', rank: 25, tier: 3 },
    { id: 26, name: 'Justin Tucker', position: 'K', team: 'BAL', rank: 26, tier: 4 },
    { id: 27, name: 'San Francisco 49ers', position: 'DEF', team: 'SF', rank: 27, tier: 4 },
    { id: 28, name: 'Dallas Cowboys', position: 'DEF', team: 'DAL', rank: 28, tier: 4 },
    { id: 29, name: 'Baltimore Ravens', position: 'DEF', team: 'BAL', rank: 29, tier: 4 },
    { id: 30, name: 'New York Jets', position: 'DEF', team: 'NYJ', rank: 30, tier: 4 }
  ];

  // Filter out drafted players and apply search/filter
  const filteredPlayers = useMemo(() => {
    const draftedPlayerIds = draftState.draftedPlayers.map(p => p.id);
    const available = allPlayers.filter(player => !draftedPlayerIds.includes(player.id));
    
    return available.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    }).sort((a, b) => a.rank - b.rank);
  }, [searchTerm, positionFilter, draftState.draftedPlayers]);

  const getPositionColor = (position) => {
    const colors = {
      'QB': '#e53e3e',
      'RB': '#38a169',
      'WR': '#3182ce',
      'TE': '#805ad5',
      'K': '#d69e2e',
      'DEF': '#dd6b20'
    };
    return colors[position] || '#718096';
  };

  const getPositionClass = (position) => {
    return `position-${position.toLowerCase()}`;
  };

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  return (
    <div className="player-list">
      <div className="player-list-header">
        <h2>Available Players</h2>
        <div className="player-count">
          {filteredPlayers.length} players available
        </div>
      </div>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search players or teams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="position-filter"
        >
          {positions.map(pos => (
            <option key={pos} value={pos}>
              {pos === 'ALL' ? 'All Positions' : pos}
            </option>
          ))}
        </select>
      </div>

      <div className="draft-summary">
        <div className="summary-item">
          <span className="summary-label">Players Drafted:</span>
          <span className="summary-value">{draftState.draftedPlayers.length}</span>
        </div>
        {draftState.picksRemaining !== undefined && (
          <div className="summary-item">
            <span className="summary-label">Picks Remaining:</span>
            <span className="summary-value">{draftState.picksRemaining}</span>
          </div>
        )}
      </div>

      <div className="players-container">
        {filteredPlayers.length === 0 ? (
          <div className="no-players">
            {searchTerm || positionFilter !== 'ALL' 
              ? 'No players match your search criteria.'
              : 'All players have been drafted!'
            }
          </div>
        ) : (
          filteredPlayers.map((player, index) => (
            <div key={player.id} className="player-item">
              <div className="player-rank">#{player.rank}</div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-details">
                  <span 
                    className={`player-position ${getPositionClass(player.position)}`}
                  >
                    {player.position}
                  </span>
                  <span className="player-team">{player.team}</span>
                  <span className="player-tier">Tier {player.tier}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerList; 