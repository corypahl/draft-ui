import React, { useState, useMemo, useEffect } from 'react';
import { fetchPlayerData, processPlayerData } from '../services/playerDataService';
import './Shortlist.css';

const Shortlist = ({ draftState, currentLeague }) => {
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

  // Filter out drafted players and sort by global rank
  const shortlistPlayers = useMemo(() => {
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
    
    // Sort by global rank
    return available.sort((a, b) => a.rank - b.rank);
  }, [draftState.draftedPlayers, allPlayers]);

  // Calculate position rank for a player
  const getPositionRank = (player, allPlayers) => {
    const samePositionPlayers = allPlayers.filter(p => p.position === player.position);
    const sortedByRank = samePositionPlayers.sort((a, b) => a.rank - b.rank);
    const positionRank = sortedByRank.findIndex(p => p.id === player.id) + 1;
    return positionRank;
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
      <div className="shortlist">
        <div className="shortlist-header">
          <h3>Shortlist</h3>
        </div>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shortlist">
        <div className="shortlist-header">
          <h3>Shortlist</h3>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="shortlist">
      <div className="shortlist-header">
        <h3>Shortlist</h3>
        <div className="shortlist-count">
          {shortlistPlayers.length} available
        </div>
      </div>

      <div className="shortlist-container">
        {shortlistPlayers.length === 0 ? (
          <div className="no-players">
            All players have been drafted!
          </div>
        ) : (
                     shortlistPlayers.map((player) => {
             const positionRank = getPositionRank(player, allPlayers);
             return (
               <div key={player.id} className="shortlist-item">
                                   <span 
                    className="player-info-compact"
                    style={{ color: getPositionColor(player.position) }}
                  >
                    #{player.rank} {player.name} ({player.position}{positionRank})
                  </span>
               </div>
             );
           })
        )}
      </div>
    </div>
  );
};

export default Shortlist; 