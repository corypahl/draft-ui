import React, { useState } from 'react';
import './App.css';
import LeagueSelector from './components/LeagueSelector';
import PlayerList from './components/PlayerList';
import DraftBoard from './components/DraftBoard';
import DepthCharts from './components/DepthCharts';
import DraftInfo from './components/DraftInfo';
import Shortlist from './components/Shortlist';

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
          />
        );
      case 'my-team':
        return (
          <DepthCharts
            draftState={draftState}
            currentLeague={currentLeague}
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
          />
        </div>
      </main>
    </div>
  );
}

export default App; 