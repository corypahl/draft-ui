// Draft Data Service - Handles both Sleeper API and Google Apps Script JSON formats

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyrc3faGJjl42kfneDjTv7KmAr8b9p2FAjgHXriwVC80tw1diwANlEyQVwISkPz5BAO_Q/exec';

export const DATA_SOURCES = {
  SLEEPER: 'sleeper',
  GOOGLE_APPS_SCRIPT: 'google_apps_script'
};

// Fetch draft data from Sleeper API
export const fetchSleeperDraftData = async (draftId) => {
  try {
    console.log('Fetching Sleeper draft data for ID:', draftId);
    
    // Fetch draft data
    const draftResponse = await fetch(`${SLEEPER_API_BASE}/draft/${draftId}`);
    if (!draftResponse.ok) {
      throw new Error(`Draft not found (${draftResponse.status}). Please check your draft ID.`);
    }
    const draftData = await draftResponse.json();

    // Fetch draft picks
    const picksResponse = await fetch(`${SLEEPER_API_BASE}/draft/${draftId}/picks`);
    if (!picksResponse.ok) {
      throw new Error(`Unable to fetch draft picks (${picksResponse.status}).`);
    }
    const picksData = await picksResponse.json();

    // Fetch league data to get team names
    let leagueData = null;
    if (draftData.league_id) {
      try {
        const leagueResponse = await fetch(`${SLEEPER_API_BASE}/league/${draftData.league_id}`);
        if (leagueResponse.ok) {
          leagueData = await leagueResponse.json();
        }
      } catch (error) {
        console.warn('Could not fetch league data for team names:', error);
      }
    }

    // Fetch rosters to get team names
    let rostersData = null;
    if (draftData.league_id) {
      try {
        const rostersResponse = await fetch(`${SLEEPER_API_BASE}/league/${draftData.league_id}/rosters`);
        if (rostersResponse.ok) {
          rostersData = await rostersResponse.json();
        }
      } catch (error) {
        console.warn('Could not fetch rosters data for team names:', error);
      }
    }

    return { draftData, picksData, leagueData, rostersData };
  } catch (error) {
    console.error('Error fetching Sleeper draft data:', error);
    throw error;
  }
};

// Fetch draft data from Google Apps Script
export const fetchGoogleAppsScriptDraftData = async () => {
  try {
    console.log('Fetching Google Apps Script draft data...');
    
    // Try multiple CORS proxies
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(GOOGLE_APPS_SCRIPT_URL)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_APPS_SCRIPT_URL)}`,
      `https://cors-anywhere.herokuapp.com/${GOOGLE_APPS_SCRIPT_URL}`
    ];
    
    let response;
    let lastError;
    
    for (const proxyUrl of proxies) {
      try {
        console.log('Trying proxy:', proxyUrl);
        response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          console.log('Success with proxy');
          break;
        }
      } catch (error) {
        console.log('Proxy failed:', error.message);
        lastError = error;
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error('All CORS proxies failed');
    }
    
    const data = await response.json();
    console.log('Raw Google Apps Script data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching Google Apps Script draft data:', error);
    throw error;
  }
};

// Process Sleeper draft data
export const processSleeperDraftData = (draftData, picksData, leagueData = null, rostersData = null) => {
  try {
    console.log('Processing Sleeper draft data');
    
    const numberOfTeams = draftData.settings?.teams || 10;
    const slotToRosterId = draftData.slot_to_roster_id || {};
    
    // Create a map of roster IDs to team names
    const rosterToTeamName = {};
    if (rostersData && Array.isArray(rostersData)) {
      rostersData.forEach(roster => {
        if (roster.owner_id && roster.roster_id) {
          rosterToTeamName[roster.roster_id] = roster.owner_id;
        }
      });
    }
    
    // Create a map of user IDs to display names
    const userIdToDisplayName = {};
    if (leagueData && leagueData.users && Array.isArray(leagueData.users)) {
      leagueData.users.forEach(user => {
        if (user.user_id && user.display_name) {
          userIdToDisplayName[user.user_id] = user.display_name;
        }
      });
    }
    
    // Create teams
    const teams = [];
    for (let i = 1; i <= numberOfTeams; i++) {
      const rosterId = slotToRosterId[i] || i;
      const ownerId = rosterToTeamName[rosterId];
      const teamName = ownerId && userIdToDisplayName[ownerId] 
        ? userIdToDisplayName[ownerId] 
        : `Team ${rosterId}`;
      
      teams.push({
        id: i,
        rosterId: rosterId,
        name: teamName,
        picks: [],
        draftPosition: i
      });
    }
    
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
        teamId: pick.draft_slot,
        draftRound: pick.round || 1,
        pickNumber: pick.pick_no
      };
    });

    // Add picks to teams
    draftedPlayers.forEach(player => {
      const team = teams.find(t => t.id === player.teamId);
      if (team) {
        team.picks.push(player);
      }
    });

    const totalPicks = numberOfTeams * (draftData.settings?.rounds || 15);
    const currentPick = Math.min(picksData.length + 1, totalPicks + 1);
    const isComplete = picksData.length >= totalPicks || draftData.status === 'complete';
    
    return {
      currentPick: currentPick,
      teams,
      draftedPlayers,
      availablePlayers: [],
      draftStatus: isComplete ? 'complete' : draftData.status || 'in_progress',
      totalRounds: draftData.settings?.rounds || 15,
      totalTeams: numberOfTeams,
      totalPicks: totalPicks,
      picksRemaining: Math.max(0, totalPicks - picksData.length),
      leagueName: draftData.metadata?.name || 'Sleeper League',
      draftType: draftData.type || 'snake',
      season: draftData.season || '2025',
      dataSource: DATA_SOURCES.SLEEPER
    };
  } catch (error) {
    console.error('Error processing Sleeper draft data:', error);
    throw new Error('Error processing Sleeper draft data: ' + error.message);
  }
};

// Process Google Apps Script draft data (current simple format)
export const processGoogleAppsScriptDraftData = (data) => {
  try {
    console.log('Processing simple Google Apps Script draft data');
    console.log('Data keys:', Object.keys(data));
    
    const draftBoard = data['Draft Board'];
    console.log('Draft Board:', draftBoard);
    console.log('First round:', draftBoard[0]);
    
    if (!draftBoard || !Array.isArray(draftBoard)) {
      throw new Error('Invalid draft board data format - expected "Draft Board" array');
    }
    
    // Extract team names from the first round
    const firstRound = draftBoard[0];
    if (!firstRound || typeof firstRound !== 'object') {
      throw new Error('No draft rounds found or invalid round format');
    }
    
    const teamNames = Object.keys(firstRound);
    if (teamNames.length === 0) {
      throw new Error('No teams found in first round');
    }
    
    const numberOfTeams = teamNames.length;
    const totalRounds = draftBoard.length;
    
    // Found ${numberOfTeams} teams and ${totalRounds} rounds
    
    // Create teams
    const teams = teamNames.map((teamName, index) => ({
      id: index + 1,
      name: teamName,
      picks: [],
      draftPosition: index + 1
    }));
    
    // Process all picks
    const draftedPlayers = [];
    let pickNumber = 1;
    
         draftBoard.forEach((round, roundIndex) => {
       const roundNumber = roundIndex + 1;
       
       teamNames.forEach((teamName, teamIndex) => {
         const playerData = round[teamName];
         if (playerData) {
           const team = teams.find(t => t.name === teamName);
           if (team) {
             let playerName, playerPosition;
             
             // Handle both new format (object with player and position) and old format (string)
             if (typeof playerData === 'object' && playerData.player) {
               playerName = playerData.player;
               playerPosition = playerData.position || 'UNK';
             } else if (typeof playerData === 'string') {
               playerName = playerData;
               playerPosition = 'UNK'; // Fallback for string format
             } else {
               return; // Skip invalid data
             }
             
             if (playerName && playerName.trim() !== '') {
               const player = {
                 id: `pick-${pickNumber}`,
                 name: playerName,
                 position: playerPosition,
                 team: 'UNK',
                 rank: 999,
                 tier: 5,
                 teamId: team.id,
                 draftRound: roundNumber,
                 pickNumber: pickNumber
               };
               
               draftedPlayers.push(player);
               team.picks.push(player);
               pickNumber++;
             }
           }
         }
       });
     });
    
    // Processed ${draftedPlayers.length} drafted players
    
    const totalPicks = numberOfTeams * totalRounds;
    const currentPick = Math.min(draftedPlayers.length + 1, totalPicks + 1);
    const isComplete = draftedPlayers.length >= totalPicks;
    
    const result = {
      currentPick: currentPick,
      teams,
      draftedPlayers,
      availablePlayers: [],
      draftStatus: isComplete ? 'complete' : 'in_progress',
      totalRounds: totalRounds,
      totalTeams: numberOfTeams,
      totalPicks: totalPicks,
      picksRemaining: Math.max(0, totalPicks - draftedPlayers.length),
      leagueName: 'Google Apps Script League',
      draftType: 'snake',
      season: '2025',
      dataSource: DATA_SOURCES.GOOGLE_APPS_SCRIPT
    };
    
    // Final processed result ready
    return result;
  } catch (error) {
    console.error('Error processing Google Apps Script draft data:', error);
    throw new Error('Error processing Google Apps Script draft data: ' + error.message);
  }
};

// Enhanced Google Apps Script format processor (for future use)
export const processEnhancedGoogleAppsScriptDraftData = (data) => {
  try {
    console.log('Processing enhanced Google Apps Script draft data');
    console.log('Data keys:', Object.keys(data));
    
    const draftBoard = data['Draft Board'];
    const teams = data['teams'] || [];
    const settings = data['settings'] || {};
    
    console.log('Draft Board:', draftBoard);
    console.log('First round sample:', draftBoard[0]);
    console.log('Teams:', teams);
    console.log('Settings:', settings);
    
    if (!draftBoard || !Array.isArray(draftBoard)) {
      throw new Error('Invalid draft board data format');
    }
    
    // Create teams if not provided
    const processedTeams = teams.length > 0 ? teams.map((team, index) => ({
      id: index + 1,
      name: team.name,
      picks: [],
      draftPosition: team.draftPosition || index + 1
    })) : [];
    
    // Process picks
    const draftedPlayers = [];
    let pickNumber = 1;
    
    // Check if this is the enhanced format (with picks array) or simple format (with team names as keys)
    const firstRound = draftBoard[0];
    const hasPicksArray = firstRound && firstRound.picks && Array.isArray(firstRound.picks);
    
    if (!hasPicksArray) {
      // This is the simple format, not enhanced format
      throw new Error('Not enhanced format - using simple format processor');
    }
    
         draftBoard.forEach((round, roundIndex) => {
       const roundNumber = roundIndex + 1;
       
       // Handle both enhanced format (with picks array) and simple format (with team names as keys)
       if (round.picks && Array.isArray(round.picks)) {
         // Enhanced format
         round.picks.forEach((pick, pickIndex) => {
           const team = processedTeams.find(t => t.name === pick.team);
           if (team) {
             const player = {
               id: `pick-${pickNumber}`,
               name: pick.player,
               position: pick.position || 'UNK',
               team: pick.team || 'UNK',
               rank: pick.rank || 999,
               tier: pick.tier || 5,
               teamId: team.id,
               draftRound: roundNumber,
               pickNumber: pickNumber
             };
             
             draftedPlayers.push(player);
             team.picks.push(player);
             pickNumber++;
           }
         });
       } else {
         // Simple format with team names as keys
         Object.keys(round).forEach(teamName => {
           const playerData = round[teamName];
           const team = processedTeams.find(t => t.name === teamName);
           if (team && playerData) {
             let playerName, playerPosition;
             
             // Handle both new format (object with player and position) and old format (string)
             if (typeof playerData === 'object' && playerData.player) {
               playerName = playerData.player;
               playerPosition = playerData.position || 'UNK';
             } else if (typeof playerData === 'string') {
               playerName = playerData;
               playerPosition = 'UNK'; // Fallback for string format
             } else {
               return; // Skip invalid data
             }
             
             if (playerName && playerName.trim() !== '') {
               const player = {
                 id: `pick-${pickNumber}`,
                 name: playerName,
                 position: playerPosition,
                 team: 'UNK',
                 rank: 999,
                 tier: 5,
                 teamId: team.id,
                 draftRound: roundNumber,
                 pickNumber: pickNumber
               };
               
               draftedPlayers.push(player);
               team.picks.push(player);
               pickNumber++;
             }
           }
         });
       }
     });
    
    const totalRounds = settings.totalRounds || draftBoard.length;
    const numberOfTeams = processedTeams.length;
    const totalPicks = numberOfTeams * totalRounds;
    const currentPick = Math.min(draftedPlayers.length + 1, totalPicks + 1);
    const isComplete = draftedPlayers.length >= totalPicks;
    
    return {
      currentPick: currentPick,
      teams: processedTeams,
      draftedPlayers,
      availablePlayers: [],
      draftStatus: isComplete ? 'complete' : 'in_progress',
      totalRounds: totalRounds,
      totalTeams: numberOfTeams,
      totalPicks: totalPicks,
      picksRemaining: Math.max(0, totalPicks - draftedPlayers.length),
      leagueName: settings.leagueName || 'Google Apps Script League',
      draftType: settings.draftType || 'snake',
      season: settings.season || '2025',
      dataSource: DATA_SOURCES.GOOGLE_APPS_SCRIPT
    };
  } catch (error) {
    console.error('Error processing enhanced Google Apps Script draft data:', error);
    throw new Error('Error processing enhanced Google Apps Script draft data: ' + error.message);
  }
};

// Main function to fetch and process draft data based on source
export const fetchAndProcessDraftData = async (dataSource, draftId = null) => {
  try {
    let processedData;
    
    switch (dataSource) {
      case DATA_SOURCES.SLEEPER:
        if (!draftId) {
          throw new Error('Draft ID is required for Sleeper API');
        }
        const sleeperData = await fetchSleeperDraftData(draftId);
        processedData = processSleeperDraftData(
          sleeperData.draftData, 
          sleeperData.picksData, 
          sleeperData.leagueData, 
          sleeperData.rostersData
        );
        break;
        
      case DATA_SOURCES.GOOGLE_APPS_SCRIPT:
        const googleData = await fetchGoogleAppsScriptDraftData();
        // Try enhanced format first, fall back to simple format
        try {
          processedData = processEnhancedGoogleAppsScriptDraftData(googleData);
        } catch (error) {
          console.log('Enhanced format failed, trying simple format:', error.message);
          processedData = processGoogleAppsScriptDraftData(googleData);
        }
        break;
        
      default:
        throw new Error(`Unknown data source: ${dataSource}`);
    }
    
    return processedData;
  } catch (error) {
    console.error('Error in fetchAndProcessDraftData:', error);
    throw error;
  }
}; 