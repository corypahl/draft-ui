import React, { useState, useMemo, useEffect } from 'react';
import { fetchPlayerData, processPlayerData } from '../services/playerDataService';
import './PlayerList.css';

const PlayerList = ({ availablePlayers, draftState, currentLeague }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [allPlayers, setAllPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch player data when league changes
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!currentLeague) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const rawData = await fetchPlayerData();
        const processedPlayers = processPlayerData(rawData, currentLeague);
        setAllPlayers(processedPlayers);
      } catch (err) {
        console.error('Error loading player data:', err);
        setError('Failed to load player data. Please try again.');
        setAllPlayers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayerData();
  }, [currentLeague]);

  // Filter out drafted players and apply search/filter
  const filteredPlayers = useMemo(() => {
    // Get drafted player names from Sleeper data
    const draftedPlayerNames = draftState.draftedPlayers.map(p => 
      p.metadata?.first_name && p.metadata?.last_name 
        ? `${p.metadata.first_name} ${p.metadata.last_name}`
        : p.metadata?.name || p.name || ''
    ).filter(name => name); // Remove empty names
    
    console.log('Drafted players from Sleeper:', draftedPlayerNames);
    console.log('Total players loaded:', allPlayers.length);
    
    // Log sample player data to see all available fields
    if (allPlayers.length > 0) {
      console.log('Sample player with all data fields:', allPlayers[0]);
      console.log('Available fields:', Object.keys(allPlayers[0]));
    }
    
    // Filter out players who have been drafted in Sleeper
    const available = allPlayers.filter(player => 
      !draftedPlayerNames.some(draftedName => 
        player.name.toLowerCase() === draftedName.toLowerCase()
      )
    );
    
    console.log('Available players after filtering:', available.length);
    
    return available.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    }).sort((a, b) => a.rank - b.rank);
  }, [searchTerm, positionFilter, draftState.draftedPlayers, allPlayers]);

  // Group players by tier
  const playersByTier = useMemo(() => {
    const grouped = {};
    filteredPlayers.forEach(player => {
      const tier = player.tier;
      if (!grouped[tier]) {
        grouped[tier] = [];
      }
      grouped[tier].push(player);
    });
    
    // Sort tiers and players within each tier
    return Object.keys(grouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .reduce((acc, tier) => {
        acc[tier] = grouped[tier].sort((a, b) => a.rank - b.rank);
        return acc;
      }, {});
  }, [filteredPlayers]);

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

  // Calculate position rank for a player
  const getPositionRank = (player, allPlayers) => {
    const samePositionPlayers = allPlayers.filter(p => p.position === player.position);
    const sortedByRank = samePositionPlayers.sort((a, b) => a.rank - b.rank);
    const positionRank = sortedByRank.findIndex(p => p.id === player.id) + 1;
    return positionRank;
  };

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  if (isLoading) {
    return (
      <div className="player-list">
        <div className="loading-message">
          Loading player data for {currentLeague} league...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-list">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="player-list">
      <div className="player-list-header">
        <h2>Available Players - {currentLeague}</h2>
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
          <span className="summary-label">Players Drafted (Sleeper):</span>
          <span className="summary-value">{draftState.draftedPlayers.length}</span>
        </div>
        {draftState.picksRemaining !== undefined && (
          <div className="summary-item">
            <span className="summary-label">Picks Remaining:</span>
            <span className="summary-value">{draftState.picksRemaining}</span>
          </div>
        )}
        <div className="summary-item">
          <span className="summary-label">Available Players:</span>
          <span className="summary-value">{filteredPlayers.length}</span>
        </div>
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
           Object.entries(playersByTier).map(([tier, players]) => (
             <div key={tier} className="tier-section">
               <div className="tier-header">
                 <span className="tier-label">Tier {tier}</span>
                 <span className="tier-count">({players.length} players)</span>
               </div>
               {players.map((player) => {
                 const positionRank = getPositionRank(player, allPlayers);
                 return (
                   <div key={player.id} className="player-item">
                     <div className="player-rank">
                       #{player.rank} ({player.position}{positionRank})
                     </div>
                     <div className="player-info">
                       <div 
                         className="player-name"
                         style={{ color: getPositionColor(player.position) }}
                       >
                         {player.name}
                         <span className="player-team-inline">
                           {player.team}{player.bye > 0 && ` (${player.bye})`}
                         </span>
                         {player.isRookie && <span className="rookie-badge">R</span>}
                         {player.injury && <span className="injury-badge">⚠</span>}
                       </div>
                                               <div className="player-details">
                          {player.adp && (
                            <span className="player-adp">ADP: {player.adp}</span>
                          )}
                          {player.risk && (
                            <span className="player-risk">Risk: {player.risk}</span>
                          )}
                          {player.upside && (
                            <span className="player-upside">Upside: {player.upside}</span>
                          )}
                          {player.boom && (
                            <span className="player-boom">Boom: {player.boom}</span>
                          )}
                          {player.bust && (
                            <span className="player-bust">Bust: {player.bust}</span>
                          )}
                        </div>
                                                 <div className="player-stats">
                           {player.projectedPoints > 0 && (
                             <span className="player-projection">Proj: {player.projectedPoints.toFixed(1)}</span>
                           )}
                           {player['Prev Rank'] && (
                             <span className="player-prev-rank">Prev Rank: {player['Prev Rank']}</span>
                           )}
                           {player['Prev Pts'] && (
                             <span className="player-prev-pts">Prev Pts: {player['Prev Pts']}</span>
                           )}
                         </div>
                       {(player.injury || player.isRookie) && (
                         <div className="player-notes">
                           {player.injury && (
                             <span className="injury-note">{player.injuryStatus}</span>
                           )}
                           {player.isRookie && (
                             <span className="rookie-note">{player.college} - Round {player.draftRound}</span>
                           )}
                         </div>
                       )}
                     </div>
                   </div>
                 );
               })}
             </div>
           ))
         )}
       </div>
    </div>
  );
};

export default PlayerList; 