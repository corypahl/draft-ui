const API_URL = 'https://script.google.com/macros/s/AKfycbw46dGDE9LUoUh-ahhLgXHGACbe-ECQXhj-HHaJA_qozEU1YQd9yD-Q_TVQluVobijogw/exec';

// League to ranking table mapping
const LEAGUE_RANKINGS_MAP = {
  'FanDuel': 'FanDuel Rankings',
  'Jackson': 'Jackson Rankings', 
  'GVSU': 'Team Pahl Rankings'
};

export const fetchPlayerData = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched data structure:', Object.keys(data));
    console.log('Sample data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching player data:', error);
    throw error;
  }
};

export const processPlayerData = (rawData, selectedLeague) => {
  if (!rawData || !selectedLeague) {
    return [];
  }

  const rankingTable = LEAGUE_RANKINGS_MAP[selectedLeague];
  if (!rankingTable || !rawData[rankingTable]) {
    console.warn(`No ranking data found for league: ${selectedLeague}`);
    return [];
  }

  const rankings = rawData[rankingTable];
  const depthCharts = rawData['Depth Charts'] || [];
  const injuries = rawData['Injuries'] || [];
  const rookies = rawData['Rookies'] || [];

  console.log('Processing data for league:', selectedLeague);
  console.log('Ranking table:', rankingTable);
  console.log('Raw rankings data:', rankings);

  if (!Array.isArray(rankings)) {
    console.error('Rankings data is not an array:', rankings);
    return [];
  }

  // Create a map of depth chart data for quick lookup
  const depthChartMap = {};
  depthCharts.forEach(team => {
    Object.keys(team).forEach(key => {
      if (key !== 'Team' && team[key]) {
        depthChartMap[team[key]] = {
          team: team.Team,
          position: getPositionFromKey(key)
        };
      }
    });
  });

  console.log('Depth chart map sample:', Object.keys(depthChartMap).slice(0, 5));

  // Create a map of injury data
  const injuryMap = {};
  injuries.forEach(injury => {
    injuryMap[injury.Player] = {
      injury: injury.Injury,
      status: injury.Status,
      updated: injury.Updated
    };
  });

  // Create a map of rookie data
  const rookieMap = {};
  rookies.forEach(rookie => {
    rookieMap[rookie.Name] = {
      isRookie: true,
      college: rookie.College,
      round: rookie.Round,
      pick: rookie.Pick
    };
  });

  // Process rankings into player objects
  const players = rankings.map((player, index) => {
    const depthInfo = depthChartMap[player.Name];
    const injuryInfo = injuryMap[player.Name];
    const rookieInfo = rookieMap[player.Name];

    // Handle different possible field names and parse values
    const rank = parseInt(player.P_Rank || player.Rank || player['P_Rank']) || index + 1;
    const projectedPoints = parseFloat(player.P_Pts || player.Proj || player['P_Pts']) || 0;
    const team = depthInfo?.team || player.Team || 'FA';
    const position = player.Pos || player.Position || 'UNK';
    const bye = parseInt(player.Bye) || 0;
    const adp = player.ADP || '';
    const risk = player.Risk || '';
    const upside = player.Upside || '';
    const boom = player.Boom || '';
    const bust = player.Bust || '';

    // Create the base player object with all original data
    const playerObject = {
      // Core fields for display
      id: index + 1,
      name: player.Name,
      position: position,
      team: team,
      rank: rank,
      tier: getTierFromRank(rank),
      projectedPoints: projectedPoints,
      
      // Enhanced data from other tables
      isRookie: rookieInfo?.isRookie || false,
      college: rookieInfo?.college,
      draftRound: rookieInfo?.round,
      draftPick: rookieInfo?.pick,
      injury: injuryInfo?.injury,
      injuryStatus: injuryInfo?.status,
      injuryUpdated: injuryInfo?.updated,
      
      // Include ALL original fields from the ranking data
      ...player,
      
      // Additional computed fields (these will override any duplicates from spread)
      adp: adp,
      risk: risk,
      upside: upside,
      boom: boom,
      bust: bust,
      bye: bye,
    };

    return playerObject;
  });

  const sortedPlayers = players.sort((a, b) => a.rank - b.rank);
  console.log('Processed players:', sortedPlayers.slice(0, 5)); // Log first 5 players
  
  // Log all available fields from the first player for debugging
  if (sortedPlayers.length > 0) {
    console.log('Available fields in player data:', Object.keys(sortedPlayers[0]));
    console.log('Sample player with all data:', sortedPlayers[0]);
  }
  
  return sortedPlayers;
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

const getTierFromRank = (rank) => {
  if (rank <= 12) return 1;
  if (rank <= 24) return 2;
  if (rank <= 36) return 3;
  if (rank <= 48) return 4;
  if (rank <= 60) return 5;
  if (rank <= 72) return 6;
  if (rank <= 84) return 7;
  if (rank <= 96) return 8;
  if (rank <= 108) return 9;
  if (rank <= 120) return 10;
  return 11;
}; 