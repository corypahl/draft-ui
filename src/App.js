import React, { useState, useEffect } from 'react';
import './App.css';
import LeagueSelector from './components/LeagueSelector';
import PlayerList from './components/PlayerList';
import DraftBoard from './components/DraftBoard';
import DepthCharts from './components/DepthCharts';
import PlayerCardContainer from './components/PlayerCardContainer';

import Shortlist from './components/Shortlist';
import TeamAnalysis from './components/TeamAnalysis';
import Recommendations from './components/Recommendations';
import { fetchPlayerData, processPlayerData } from './services/playerDataService';

function App() {
  const [currentLeague, setCurrentLeague] = useState('Jackson');
  const [draftState, setDraftState] = useState({
    currentPick: 1,
    teams: [],
    draftedPlayers: [],
    availablePlayers: [],
    draftStatus: 'pre_draft',
    totalRounds: 0,
    leagueName: ''
  });
  const [activeTab, setActiveTab] = useState('players'); // 'players', 'draft-board', 'recommendations'
  
  // Selected players for player cards (max 3)
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  
  // Global player data state for performance optimization
  const [playerData, setPlayerData] = useState({
    allPlayers: [],
    depthChartData: [],
    isLoading: false,
    error: ''
  });

  // Fetch player data once when league changes or on initial load
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!currentLeague) return;
      
      setPlayerData(prev => ({ ...prev, isLoading: true, error: '' }));
      
      try {
        const rawData = await fetchPlayerData();
        const processedPlayers = processPlayerData(rawData, currentLeague);
        const depthCharts = rawData['Depth Charts'] || [];
        
        setPlayerData({
          allPlayers: processedPlayers,
          depthChartData: depthCharts,
          isLoading: false,
          error: ''
        });
      } catch (err) {
        console.error('Error loading player data:', err);
        setPlayerData({
          allPlayers: [],
          depthChartData: [],
          isLoading: false,
          error: 'Failed to load player data. Please try again.'
        });
      }
    };

    loadPlayerData();
  }, [currentLeague]);

  const handleLeagueChange = (leagueId) => {
    console.log('Switching to league:', leagueId);
    setCurrentLeague(leagueId);
    // Reset draft state when switching leagues
    setDraftState({
      currentPick: 1,
      teams: [],
      draftedPlayers: [],
      availablePlayers: [],
      draftStatus: 'pre_draft',
      totalRounds: 0,
      leagueName: '',
      dataSource: '',
      season: ''
    });
  };

  const handleDraftDataUpdate = (newDraftData) => {
    setDraftState(newDraftData);
  };

  const handleAddPlayer = (player) => {
    // Check if player is already selected
    if (selectedPlayers.find(p => p.id === player.id)) {
      return;
    }
    
    // Check if we already have 4 players
    if (selectedPlayers.length >= 4) {
      return;
    }
    
    setSelectedPlayers(prev => [...prev, player]);
  };

  const handleRemovePlayer = (playerId) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'players':
        return (
          <PlayerList
            availablePlayers={draftState.availablePlayers}
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
            onPlayerClick={handleAddPlayer}
          />
        );
      case 'draft-board':
        return (
          <DraftBoard
            draftState={draftState}
            setDraftState={setDraftState}
            currentLeague={currentLeague}
            onPlayerClick={handleAddPlayer}
          />
        );

      case 'depth-charts':
        return (
          <DepthCharts
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
            onPlayerClick={handleAddPlayer}
          />
        );
      case 'recommendations':
        return (
          <Recommendations
            draftState={draftState}
            allPlayers={playerData.allPlayers}
            onPlayerClick={handleAddPlayer}
          />
        );
      default:
        return (
          <PlayerList
            availablePlayers={draftState.availablePlayers}
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
            onPlayerClick={handleAddPlayer}
          />
        );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏈 Fantasy Football Draft Assistant</h1>
        <p>Your ultimate tool for dominating your fantasy football draft</p>
      </header>

      <main className="App-main">
        <LeagueSelector
          onLeagueChange={handleLeagueChange}
          onDraftDataUpdate={handleDraftDataUpdate}
        />

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            📋 Players
          </button>
          <button 
            className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            🎯 Targets
          </button>
          <button 
            className={`tab-button ${activeTab === 'depth-charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('depth-charts')}
          >
            📊 Depth Charts
          </button>
          <button 
            className={`tab-button ${activeTab === 'draft-board' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft-board')}
          >
            🏆 Draft Board
          </button>
        </div>

        <PlayerCardContainer
          selectedPlayers={selectedPlayers}
          onRemovePlayer={handleRemovePlayer}
        />

        <div className="main-content">
          <div className="draft-container">
            {renderTabContent()}
          </div>
          <Shortlist
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
            onPlayerClick={handleAddPlayer}
          />
        </div>
      </main>
    </div>
  );
}

export default App; 