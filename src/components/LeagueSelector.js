import React, { useState, useEffect } from 'react';
import './LeagueSelector.css';

const LeagueSelector = ({ onLeagueChange, onDraftDataUpdate }) => {
  const [selectedLeague, setSelectedLeague] = useState('FanDuel');
  const [draftId, setDraftId] = useState('1256013847173550080'); // Default to example draft ID
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const leagues = [
    { id: 'FanDuel', name: 'FanDuel' },
    { id: 'Jackson', name: 'Jackson' },
    { id: 'GVSU', name: 'GVSU' }
  ];

  const handleLeagueChange = (leagueId) => {
    setSelectedLeague(leagueId);
    setError('');
    onLeagueChange(leagueId);
  };

  const handleDraftIdChange = (e) => {
    setDraftId(e.target.value);
    setError('');
  };

  const fetchDraftData = async () => {
    if (!draftId.trim()) {
      setError('Please enter a draft ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Fetching draft data for ID:', draftId);
      
      // Fetch draft data from Sleeper API
      const draftResponse = await fetch(`https://api.sleeper.app/v1/draft/${draftId}`);
      console.log('Draft response status:', draftResponse.status);
      
      if (!draftResponse.ok) {
        const errorText = await draftResponse.text();
        console.error('Draft API error:', errorText);
        throw new Error(`Draft not found (${draftResponse.status}). Please check your draft ID.`);
      }
      
      const draftData = await draftResponse.json();
      console.log('Draft data:', draftData);

      // Fetch draft picks
      const picksResponse = await fetch(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
      console.log('Picks response status:', picksResponse.status);
      
      if (!picksResponse.ok) {
        const errorText = await picksResponse.text();
        console.error('Picks API error:', errorText);
        throw new Error(`Unable to fetch draft picks (${picksResponse.status}).`);
      }
      
      const picksData = await picksResponse.json();
      console.log('Picks data:', picksData);

      // Process the data without league info
      const processedData = processDraftData(draftData, picksData);
      console.log('Processed data:', processedData);
      
      onDraftDataUpdate(processedData);
      setError('');
    } catch (err) {
      console.error('Error in fetchDraftData:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processDraftData = (draftData, picksData) => {
    try {
      console.log('Processing draft data with settings:', draftData.settings);
      
      // Get number of teams from draft settings
      const numberOfTeams = draftData.settings?.teams || 10;
      console.log('Number of teams:', numberOfTeams);
      
      // Use slot_to_roster_id mapping if available, otherwise create generic teams
      const slotToRosterId = draftData.slot_to_roster_id || {};
      console.log('Slot to roster mapping:', slotToRosterId);
      
      // Create teams based on the actual draft structure
      const teams = [];
      for (let i = 1; i <= numberOfTeams; i++) {
        const rosterId = slotToRosterId[i] || i;
        teams.push({
          id: i, // Use slot number as team ID
          rosterId: rosterId,
          name: `Team ${rosterId}`,
          picks: [],
          draftPosition: i
        });
      }
      
      console.log('Teams created:', teams);

      // Process picks
      const draftedPlayers = picksData.map(pick => {
        const playerName = pick.metadata?.first_name && pick.metadata?.last_name 
          ? `${pick.metadata.first_name} ${pick.metadata.last_name}`
          : 'Unknown Player';
          
        return {
          id: pick.player_id,
          name: playerName,
          position: pick.metadata?.position || 'UNK',
          team: pick.metadata?.team || 'UNK',
          rank: pick.metadata?.rank || 999,
          tier: pick.metadata?.tier || 5,
          teamId: pick.draft_slot, // Use draft_slot as team ID
          draftRound: pick.round || 1,
          pickNumber: pick.pick_no
        };
      });

      console.log('Drafted players:', draftedPlayers);

      // Add picks to teams
      draftedPlayers.forEach(player => {
        const team = teams.find(t => t.id === player.teamId);
        if (team) {
          team.picks.push(player);
        }
      });

      // Calculate current pick correctly
      const totalPicks = numberOfTeams * (draftData.settings?.rounds || 15);
      const currentPick = Math.min(picksData.length + 1, totalPicks + 1);
      
      // Determine if draft is complete
      const isComplete = picksData.length >= totalPicks || draftData.status === 'complete';
      
      const result = {
        currentPick: currentPick,
        teams,
        draftedPlayers,
        availablePlayers: [], // Will be populated with remaining players
        draftStatus: isComplete ? 'complete' : draftData.status || 'in_progress',
        totalRounds: draftData.settings?.rounds || 15,
        totalTeams: numberOfTeams,
        totalPicks: totalPicks,
        picksRemaining: Math.max(0, totalPicks - picksData.length),
        leagueName: draftData.metadata?.name || 'Sleeper League',
        draftType: draftData.type || 'snake',
        season: draftData.season || '2025'
      };

      console.log('Final processed data:', result);
      return result;
    } catch (err) {
      console.error('Error in processDraftData:', err);
      throw new Error('Error processing draft data: ' + err.message);
    }
  };

  return (
    <div className="league-selector">
      <div className="selector-container">
        <div className="league-dropdown">
          <label htmlFor="league-select">League:</label>
          <select
            id="league-select"
            value={selectedLeague}
            onChange={(e) => handleLeagueChange(e.target.value)}
          >
            {leagues.map(league => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        <div className="draft-id-input">
          <label htmlFor="draft-id">Draft ID:</label>
          <input
            id="draft-id"
            type="text"
            placeholder="Enter Sleeper draft ID..."
            value={draftId}
            onChange={handleDraftIdChange}
            onKeyPress={(e) => e.key === 'Enter' && fetchDraftData()}
          />
        </div>

        <button 
          className="fetch-btn"
          onClick={fetchDraftData}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch Draft'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="loading-message">
          Fetching draft data from Sleeper...
        </div>
      )}
    </div>
  );
};

export default LeagueSelector; 