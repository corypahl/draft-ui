import React, { useState, useMemo, useEffect, useRef } from 'react';
import { fetchPlayerData, processPlayerData } from '../services/playerDataService';
import DepthChartTooltip from './DepthChartTooltip';
import './PlayerList.css';

const PlayerList = ({ availablePlayers, draftState, currentLeague }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [allPlayers, setAllPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [depthChartData, setDepthChartData] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const depthChartCache = useRef(new Map());



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
        
        // Extract unique teams from players
        const uniqueTeams = [...new Set(processedPlayers.map(p => p.team).filter(team => team && team !== 'FA'))];
        setTeams(uniqueTeams.sort());
        
        // Lazy load depth chart data after players are rendered
        setTimeout(() => {
          loadDepthChartData(rawData);
        }, 1000);
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

  // Load depth chart data
  const loadDepthChartData = async (rawData) => {
    if (!rawData || !rawData['Depth Charts']) return;
    
    const depthCharts = rawData['Depth Charts'];
    const processedDepthCharts = {};
    
    depthCharts.forEach(team => {
      const teamName = team.Team;
      const teamPlayers = [];
      
      Object.keys(team).forEach(key => {
        if (key !== 'Team' && team[key]) {
          const position = getPositionFromKey(key);
          teamPlayers.push({
            name: team[key],
            position: position,
            team: teamName
          });
        }
      });
      
      if (teamPlayers.length > 0) {
        processedDepthCharts[teamName] = teamPlayers;
        depthChartCache.current.set(teamName, teamPlayers);
      }
    });
    
    console.log('Depth chart data loaded for teams:', Object.keys(processedDepthCharts));
  };

  const getPositionFromKey = (key) => {
    if (key.includes('QB')) return 'QB';
    if (key.includes('RB')) return 'RB';
    if (key.includes('WR')) return 'WR';
    if (key.includes('TE')) return 'TE';
    if (key.includes('K')) return 'K';
    if (key.includes('DEF')) return 'DEF';
    return 'UNK';
  };

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

  // Handle team button click
  const handleTeamClick = (teamName, event) => {
    const cachedData = depthChartCache.current.get(teamName);
    if (cachedData) {
      setDepthChartData(cachedData);
      setSelectedTeam(teamName);
      setTooltipVisible(true);
      
      // Position tooltip near the button
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left,
        y: rect.bottom + 10
      });
    }
  };

  // Handle tooltip close
  const handleTooltipClose = () => {
    setTooltipVisible(false);
    setSelectedTeam(null);
    setDepthChartData(null);
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

        <div className="team-buttons">
          {teams.map(team => (
            <button
              key={team}
              className={`team-button ${selectedTeam === team ? 'active' : ''}`}
              onClick={(e) => handleTeamClick(team, e)}
            >
              {team}
            </button>
          ))}
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
                      <div className="player-rank" style={{ color: getPositionColor(player.position) }}>
                        #{player.rank} ({player.position}{positionRank})
                      </div>
                      <div className="player-info">
                        <div 
                          className="player-name"
                          style={{ color: getPositionColor(player.position) }}
                        >
                          {player.name}
                          <span className="player-team-inline">
                            <span className="team-name-text">
                              {player.team}{player.bye > 0 && ` (${player.bye})`}
                            </span>
                          </span>
                          {player.isRookie && <span className="rookie-badge">R{player.draftRound}</span>}
                          {player.injury && <span className="injury-badge">🩼</span>}
                          {player.injury && <span className="injury-status-inline">{player.injuryStatus}</span>}
                        </div>
                        <div className="player-details">
                          <div className="player-details-row">
                            {player.adp && (
                              <span className="player-adp">ADP: {player.adp}</span>
                            )}
                            {player.projectedPoints > 0 && (
                              <span className="player-projection">Proj: {player.projectedPoints.toFixed(1)}</span>
                            )}
                            {player.upside && (
                              <span className="player-upside">Upside: {player.upside}</span>
                            )}
                            {player.risk && (
                              <span className="player-risk">Risk: {player.risk}</span>
                            )}
                          </div>
                          <div className="player-details-row">
                            {player['Prev Rank'] && (
                              <span className="player-prev-rank">Prev Rank: {player['Prev Rank']}</span>
                            )}
                            {player['Prev Pts'] && (
                              <span className="player-prev-pts">Prev Pts: {player['Prev Pts']}</span>
                            )}
                            {player.boom && (
                              <span className="player-boom">Boom: {player.boom}</span>
                            )}
                            {player.bust && (
                              <span className="player-bust">Bust: {player.bust}</span>
                            )}
                          </div>
                        </div>
                        {player.isRookie && (
                          <div className="player-notes">
                            <span className="rookie-note">{player.college}</span>
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
      
      {/* Depth Chart Tooltip */}
      <DepthChartTooltip
        depthChartData={depthChartData}
        isVisible={tooltipVisible}
        position={tooltipPosition}
      />
      
      {/* Click outside to close tooltip */}
      {tooltipVisible && (
        <div 
          className="tooltip-overlay"
          onClick={handleTooltipClose}
        />
      )}
    </>
  );
};

export default PlayerList; 