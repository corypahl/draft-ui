import React, { useState } from 'react';
import './App.css';
import LeagueSelector from './components/LeagueSelector';
import DraftBoard from './components/DraftBoard';
import PlayerList from './components/PlayerList';

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

        <div className="draft-container">
          <div className="draft-left-panel">
            <DraftBoard
              draftState={draftState}
              setDraftState={setDraftState}
              currentLeague={currentLeague}
            />
          </div>

          <div className="draft-center-panel">
            <PlayerList
              draftState={draftState}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 