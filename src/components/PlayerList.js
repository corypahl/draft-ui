import React, { useState, useMemo, useEffect } from 'react';
import { fetchPlayerData, processPlayerData } from '../services/playerDataService';
import './PlayerList.css';

const PlayerList = ({ availablePlayers, draftState, currentLeague }) => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [visiblePositions, setVisiblePositions] = useState({
    'QB': true,
    'RB': true,
    'WR': true,
    'TE': true,
    'K': false,
    'D': false
  });



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



  // Filter out drafted players
  const filteredPlayers = useMemo(() => {
    // Get drafted player names from both Sleeper and Google Apps Script data
    const draftedPlayerNames = draftState.draftedPlayers.map(p => {
      // Handle Sleeper format (metadata.first_name + metadata.last_name)
      if (p.metadata?.first_name && p.metadata?.last_name) {
        return `${p.metadata.first_name} ${p.metadata.last_name}`;
      }
      // Handle Google Apps Script format (direct name field)
      return p.name || '';
    }).filter(name => name); // Remove empty names
    
    // Filter out players who have been drafted
    const available = allPlayers.filter(player => 
      !draftedPlayerNames.some(draftedName => 
        player.name.toLowerCase() === draftedName.toLowerCase()
      )
    );
    
    return available.sort((a, b) => a.rank - b.rank);
  }, [draftState.draftedPlayers, allPlayers]);

  // Group players by position
  const playersByPosition = useMemo(() => {
    const grouped = {
      'QB': [],
      'RB': [],
      'WR': [],
      'TE': [],
      'K': [],
      'D': []
    };
    
    filteredPlayers.forEach(player => {
      if (grouped[player.position]) {
        grouped[player.position].push(player);
      }
    });
    
    // Sort players within each position by rank
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => a.rank - b.rank);
    });
    
    return grouped;
  }, [filteredPlayers]);

  // Handle position toggle
  const togglePosition = (position) => {
    setVisiblePositions(prev => ({
      ...prev,
      [position]: !prev[position]
    }));
  };

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
    <>
      <div className="player-list">
                 <div className="player-list-header">
           <h2>Available Players - {currentLeague}</h2>
           <div className="player-count">
             {filteredPlayers.length} players available
           </div>
         </div>

         <div className="position-filters">
           {Object.entries(visiblePositions).map(([position, isVisible]) => (
             <button
               key={position}
               className={`position-filter-btn ${isVisible ? 'active' : ''}`}
               onClick={() => togglePosition(position)}
               style={{ 
                 backgroundColor: isVisible ? getPositionColor(position) : 'var(--bg-tertiary)',
                 color: isVisible ? 'white' : 'var(--text-primary)'
               }}
             >
               {position}
             </button>
           ))}
         </div>



        <div className="players-container">
                     {filteredPlayers.length === 0 ? (
             <div className="no-players">
               All players have been drafted!
             </div>
          ) : (
                         <div className="position-columns">
               {Object.entries(playersByPosition)
                 .filter(([position]) => visiblePositions[position])
                 .map(([position, players]) => (
                   <div key={position} className="position-column">
                     <div className="position-header">
                       <span className="position-label">{position}</span>
                       <span className="position-count">({players.length})</span>
                     </div>
                     <div className="position-players">
                                               {players.map((player, index) => {
                          const nextPlayer = players[index + 1];
                          const isTierBreak = nextPlayer && player.tier !== nextPlayer.tier;
                          
                          return (
                            <div 
                              key={player.id} 
                              className={`player-item ${isTierBreak ? 'tier-end' : ''}`}
                            >
                              <div className="player-rank" style={{ color: getPositionColor(player.position) }}>
                                #{player.rank}
                              </div>
                              <div className="player-name" style={{ color: getPositionColor(player.position) }}>
                                {player.name}
                              </div>
                            </div>
                          );
                        })}
                     </div>
                   </div>
                 ))}
             </div>
          )}
        </div>
      </div>
      
      
    </>
  );
};

export default PlayerList; 