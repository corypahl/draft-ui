import React, { useState, useEffect } from 'react';
import './App.css';
import LeagueSelector from './components/LeagueSelector';
import PlayerList from './components/PlayerList';
import DraftBoard from './components/DraftBoard';
import DepthCharts from './components/DepthCharts';
import DraftInfo from './components/DraftInfo';
import MyTeam from './components/MyTeam';
import Shortlist from './components/Shortlist';
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
  const [activeTab, setActiveTab] = useState('draft-info'); // 'draft-info', 'draft-board', 'players', 'my-team'
  
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
    setCurrentLeague(leagueId);
    // Reset draft state when switching leagues
    setDraftState({
      currentPick: 1,
      teams: [],
      draftedPlayers: [],
      availablePlayers: [],
      draftStatus: 'pre_draft',
      totalRounds: 0,
      leagueName: ''
    });
  };

  const handleDraftDataUpdate = (newDraftData) => {
    setDraftState(newDraftData);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'draft-info':
        return (
          <DraftInfo
            draftState={draftState}
            currentLeague={currentLeague}
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
      case 'players':
        return (
          <PlayerList
            availablePlayers={draftState.availablePlayers}
            draftState={draftState}
            currentLeague={currentLeague}
            playerData={playerData}
          />
        );
      case 'my-team':
        return (
          <MyTeam
            draftState={draftState}
            currentLeague={currentLeague}
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
      default:
        return (
          <DraftInfo
            draftState={draftState}
            currentLeague={currentLeague}
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
            className={`tab-button ${activeTab === 'draft-info' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft-info')}
          >
            ℹ️ Draft Info
          </button>
          <button 
            className={`tab-button ${activeTab === 'draft-board' ? 'active' : ''}`}
            onClick={() => setActiveTab('draft-board')}
          >
            🏆 Draft Board
          </button>
          <button 
            className={`tab-button ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            📋 Players
          </button>
          <button 
            className={`tab-button ${activeTab === 'my-team' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-team')}
          >
            👤 My Team
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