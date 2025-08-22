import React from 'react';
import './DepthCharts.css';

const DepthCharts = ({ draftState, currentLeague, playerData, onPlayerClick }) => {
  const getTierColor = (tier) => {
    if (!tier || tier === 0) return '#4a5568'; // Dark grey for no tier
    if (tier <= 2) return '#3182ce'; // Blue for tiers 1-2
    if (tier <= 4) return '#38a169'; // Green for tiers 3-4
    if (tier <= 6) return '#d69e2e'; // Yellow for tiers 5-6
    if (tier <= 8) return '#dd6b20'; // Orange for tiers 7-8
    if (tier <= 10) return '#e53e3e'; // Red for tiers 9-10
    return '#4a5568'; // Dark grey for tiers 11+
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
    if (!playerData.allPlayers || playerData.allPlayers.length === 0) {
      return { rank: '', tier: 0 };
    }
    
    const player = playerData.allPlayers.find(p => 
      p.name === playerName && p.position === position
    );
    return player ? { rank: player.rank, tier: player.tier } : { rank: '', tier: 0 };
  };

  const getFullPlayerData = (playerName, position) => {
    if (!playerData.allPlayers || playerData.allPlayers.length === 0) {
      return null;
    }
    
    return playerData.allPlayers.find(p => 
      p.name === playerName && p.position === position
    );
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

  if (playerData.isLoading) {
    return (
      <div className="depth-charts">
        <div className="depth-charts-header">
          <h2>Depth Charts</h2>
        </div>
        <div className="loading-message">Loading depth chart data...</div>
      </div>
    );
  }

  if (playerData.error) {
    return (
      <div className="depth-charts">
        <div className="depth-charts-header">
          <h2>Depth Charts</h2>
        </div>
        <div className="error-message">{playerData.error}</div>
      </div>
    );
  }

  return (
    <div className="depth-charts">
      <div className="depth-charts-header">
        <h2>Depth Charts - {currentLeague}</h2>
      </div>

      <div className="depth-charts-container">
        {playerData.depthChartData.length === 0 ? (
          <div className="no-data">No depth chart data available</div>
        ) : (
                     <table className="depth-charts-table">
                                         <thead>
                <tr>
                  <th className="team-header">Team</th>
                  <th>QB</th>
                  <th>RB</th>
                  <th>WR</th>
                  <th>TE</th>
                </tr>
              </thead>
              <tbody>
                {playerData.depthChartData.map((team, index) => {
                  const processedTeam = processTeamDepthChart(team);
                  return (
                    <tr key={index}>
                      <td className="team-name-cell">
                        {processedTeam.teamName}
                      </td>
                      <td>
                        {processedTeam.positions.QB[0] && (() => {
                          const player = processedTeam.positions.QB[0];
                          const playerInfo = getPlayerRank(player.name, player.position);
                          const isDrafted = isPlayerDrafted(player.name);
                          const fullPlayerData = getFullPlayerData(player.name, player.position);
                          return (
                            <div 
                              className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                              onClick={() => onPlayerClick && fullPlayerData && onPlayerClick(fullPlayerData)}
                              style={{ 
                                color: isDrafted ? '#718096' : getTierColor(playerInfo.tier),
                                textDecoration: isDrafted ? 'line-through' : 'none',
                                cursor: onPlayerClick && fullPlayerData ? 'pointer' : 'default'
                              }}
                            >
                              #{playerInfo.rank} {player.name}
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        {processedTeam.positions.RB.map((player, playerIndex) => {
                          if (playerIndex >= 2) return null; // Only show first 2 RBs
                          const playerInfo = getPlayerRank(player.name, player.position);
                          const isDrafted = isPlayerDrafted(player.name);
                          const fullPlayerData = getFullPlayerData(player.name, player.position);
                          return (
                            <div 
                              key={playerIndex}
                              className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                              onClick={() => onPlayerClick && fullPlayerData && onPlayerClick(fullPlayerData)}
                              style={{ 
                                color: isDrafted ? '#718096' : getTierColor(playerInfo.tier),
                                textDecoration: isDrafted ? 'line-through' : 'none',
                                cursor: onPlayerClick && fullPlayerData ? 'pointer' : 'default'
                              }}
                            >
                              #{playerInfo.rank} {player.name}
                            </div>
                          );
                        })}
                      </td>
                      <td>
                        {processedTeam.positions.WR.map((player, playerIndex) => {
                          if (playerIndex >= 3) return null; // Only show first 3 WRs
                          const playerInfo = getPlayerRank(player.name, player.position);
                          const isDrafted = isPlayerDrafted(player.name);
                          const fullPlayerData = getFullPlayerData(player.name, player.position);
                          return (
                            <div 
                              key={playerIndex}
                              className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                              onClick={() => onPlayerClick && fullPlayerData && onPlayerClick(fullPlayerData)}
                              style={{ 
                                color: isDrafted ? '#718096' : getTierColor(playerInfo.tier),
                                textDecoration: isDrafted ? 'line-through' : 'none',
                                cursor: onPlayerClick && fullPlayerData ? 'pointer' : 'default'
                              }}
                            >
                              #{playerInfo.rank} {player.name}
                            </div>
                          );
                        })}
                      </td>
                      <td>
                        {processedTeam.positions.TE[0] && (() => {
                          const player = processedTeam.positions.TE[0];
                          const playerInfo = getPlayerRank(player.name, player.position);
                          const isDrafted = isPlayerDrafted(player.name);
                          const fullPlayerData = getFullPlayerData(player.name, player.position);
                          return (
                            <div 
                              className={`depth-player ${isDrafted ? 'drafted' : ''}`}
                              onClick={() => onPlayerClick && fullPlayerData && onPlayerClick(fullPlayerData)}
                              style={{ 
                                color: isDrafted ? '#718096' : getTierColor(playerInfo.tier),
                                textDecoration: isDrafted ? 'line-through' : 'none',
                                cursor: onPlayerClick && fullPlayerData ? 'pointer' : 'default'
                              }}
                            >
                              #{playerInfo.rank} {player.name}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
           </table>
        )}
      </div>
    </div>
  );
};

export default DepthCharts; 