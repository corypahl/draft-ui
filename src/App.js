import React, { useState, useEffect } from 'react';
import './App.css';
import LeagueSelector from './components/LeagueSelector';
import PlayerList from './components/PlayerList';
import DraftBoard from './components/DraftBoard';
import DepthCharts from './components/DepthCharts';

import MyTeam from './components/MyTeam';
import Shortlist from './components/Shortlist';
import TeamAnalysis from './components/TeamAnalysis';
import AdvancedRecommendations from './components/AdvancedRecommendations';
import { fetchPlayerData, processPlayerData } from './services/playerDataService';

function App() {
  const [currentLeague, setCurrentLeague] = useState('FanDuel');
  const [draftState, setDraftState] = useState({
    currentPick: 1,
    teams: [],
    draftedPlayers: [],
    availablePlayers: [],
    draftStatus: 'pre_draft',
    totalRounds: 0,
    leagueName: ''
  });
  const [activeTab, setActiveTab] = useState('players'); // 'players', 'draft-board', 'my-team', 'advanced-recommendations'
  
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'players':
        return (
          <PlayerList
            availablePlayers={draftState.availablePlayers}
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
          />
        );
      case 'draft-board':
        return (
          <DraftBoard
            draftState={draftState}
            setDraftState={setDraftState}
            currentLeague={currentLeague}
          />
        );
      case 'my-team':
        return (
          <MyTeam
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
          />
        );
      case 'depth-charts':
        return (
          <DepthCharts
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
          />
        );
      case 'advanced-recommendations':
        return (
          <AdvancedRecommendations
            draftState={draftState}
            allPlayers={playerData.allPlayers}
          />
        );
      default:
        return (
          <PlayerList
            availablePlayers={draftState.availablePlayers}
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
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
            className={`tab-button ${activeTab === 'draft-board' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft-board')}
          >
            🏆 Draft Board
          </button>
          <button 
            className={`tab-button ${activeTab === 'my-team' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-team')}
          >
            👤 My Team
          </button>
          <button 
            className={`tab-button ${activeTab === 'advanced-recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced-recommendations')}
          >
            🎯 Advanced Recs
          </button>
          <button 
            className={`tab-button ${activeTab === 'depth-charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('depth-charts')}
          >
            📊 Depth Charts
          </button>
        </div>

        <div className="main-content">
          <div className="draft-container">
            {renderTabContent()}
          </div>
          <Shortlist
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
          />
        </div>
      </main>
    </div>
  );
}

export default App; 