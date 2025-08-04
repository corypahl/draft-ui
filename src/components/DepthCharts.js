import React, { useState, useEffect } from 'react';
import { fetchPlayerData, processPlayerData } from '../services/playerDataService';
import './DepthCharts.css';

const DepthCharts = ({ draftState, currentLeague }) => {
  const [depthChartData, setDepthChartData] = useState([]);
  const [playerRankings, setPlayerRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch depth chart data and player rankings when component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const rawData = await fetchPlayerData();
        const depthCharts = rawData['Depth Charts'] || [];
        const processedPlayers = processPlayerData(rawData, currentLeague);
        
        setDepthChartData(depthCharts);
        setPlayerRankings(processedPlayers);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentLeague]);

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

  const getPositionFromKey = (key) => {
    if (key.includes('QB')) return 'QB';
    if (key.includes('RB')) return 'RB';
    if (key.includes('WR')) return 'WR';
    if (key.includes('TE')) return 'TE';
    if (key.includes('K')) return 'K';
    if (key.includes('D')) return 'D';
    return 'UNK';
  };

  const getPlayerRank = (playerName, position) => {
    const player = playerRankings.find(p => 
      p.name === playerName && p.position === position
    );
    return player ? player.rank : '';
  };

  const isPlayerDrafted = (playerName) => {
    return draftState.draftedPlayers.some(player => 
      player.name === playerName || 
      (player.metadata?.first_name && player.metadata?.last_name && 
       `${player.metadata.first_name} ${player.metadata.last_name}` === playerName)
    );
  };

  const processTeamDepthChart = (team) => {
    const positions = {
      'QB': [],
      'WR': [],
      'TE': [],
      'RB': []
    };
    
    Object.keys(team).forEach(key => {
      if (key !== 'Team' && team[key]) {
        const position = getPositionFromKey(key);
        if (positions[position]) {
          positions[position].push({
            name: team[key],
            position: position,
            depth: key
          });
        }
      }
    });

    return {
      teamName: team.Team,
      positions: positions
    };
  };

  if (isLoading) {
    return (
      <div className="depth-charts">
        <div className="depth-charts-header">
          <h2>Depth Charts</h2>
        </div>
        <div className="loading-message">Loading depth chart data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="depth-charts">
        <div className="depth-charts-header">
          <h2>Depth Charts</h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="depth-charts">
      <div className="depth-charts-header">
        <h2>Depth Charts</h2>
        <div className="charts-count">
          {depthChartData.length} teams
        </div>
      </div>

      {depthChartData.length > 0 ? (
        <div className="depth-charts-table-container">
          <table className="depth-charts-table">
            <thead>
              <tr>
                <th className="team-header">Team</th>
                <th className="position-header">QB</th>
                <th className="position-header">WR</th>
                <th className="position-header">TE</th>
                <th className="position-header">RB</th>
              </tr>
            </thead>
            <tbody>
              {depthChartData.map((team, index) => {
                const processedTeam = processTeamDepthChart(team);
                
                return (
                  <tr key={index} className="team-row">
                    <td className="team-name-cell">
                      <span className="team-name">{processedTeam.teamName}</span>
                    </td>
                    <td className="position-cell">
                      {processedTeam.positions['QB'].map((player, playerIndex) => {
                        const isDrafted = isPlayerDrafted(player.name);
                        const playerRank = getPlayerRank(player.name, 'QB');
                        return (
                          <div 
                            key={playerIndex} 
                            className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                          >
                            <span 
                              className="player-name"
                              style={{ color: getPositionColor('QB') }}
                            >
                              {player.name}
                            </span>
                            <span 
                              className="position-rank"
                              style={{ color: getPositionColor('QB') }}
                            >
                              #{playerRank}
                            </span>
                          </div>
                        );
                      })}
                    </td>
                    <td className="position-cell">
                      {processedTeam.positions['WR'].map((player, playerIndex) => {
                        const isDrafted = isPlayerDrafted(player.name);
                        const playerRank = getPlayerRank(player.name, 'WR');
                        return (
                          <div 
                            key={playerIndex} 
                            className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                          >
                            <span 
                              className="player-name"
                              style={{ color: getPositionColor('WR') }}
                            >
                              {player.name}
                            </span>
                            <span 
                              className="position-rank"
                              style={{ color: getPositionColor('WR') }}
                            >
                              #{playerRank}
                            </span>
                          </div>
                        );
                      })}
                    </td>
                    <td className="position-cell">
                      {processedTeam.positions['TE'].map((player, playerIndex) => {
                        const isDrafted = isPlayerDrafted(player.name);
                        const playerRank = getPlayerRank(player.name, 'TE');
                        return (
                          <div 
                            key={playerIndex} 
                            className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                          >
                            <span 
                              className="player-name"
                              style={{ color: getPositionColor('TE') }}
                            >
                              {player.name}
                            </span>
                            <span 
                              className="position-rank"
                              style={{ color: getPositionColor('TE') }}
                            >
                              #{playerRank}
                            </span>
                          </div>
                        );
                      })}
                    </td>
                    <td className="position-cell">
                      {processedTeam.positions['RB'].map((player, playerIndex) => {
                        const isDrafted = isPlayerDrafted(player.name);
                        const playerRank = getPlayerRank(player.name, 'RB');
                        return (
                          <div 
                            key={playerIndex} 
                            className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                          >
                            <span 
                              className="player-name"
                              style={{ color: getPositionColor('RB') }}
                            >
                              {player.name}
                            </span>
                            <span 
                              className="position-rank"
                              style={{ color: getPositionColor('RB') }}
                            >
                              #{playerRank}
                            </span>
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          <p>No depth chart data available</p>
          <p className="subtitle">Depth charts will appear here when data is loaded</p>
        </div>
      )}
    </div>
  );
};

export default DepthCharts; 