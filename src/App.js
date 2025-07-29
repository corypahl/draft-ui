import React, { useState } from 'react';
import './App.css';
import DraftBoard from './components/DraftBoard';
import PlayerList from './components/PlayerList';
import TeamRoster from './components/TeamRoster';

function App() {
  const [draftState, setDraftState] = useState({
    currentPick: 1,
    teams: [],
    draftedPlayers: [],
    availablePlayers: []
  });

  const [selectedTeam, setSelectedTeam] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏈 Fantasy Football Draft Assistant</h1>
        <p>Your ultimate tool for dominating your fantasy football draft</p>
      </header>
      
      <main className="App-main">
        <div className="draft-container">
          <div className="draft-left-panel">
            <DraftBoard 
              draftState={draftState}
              setDraftState={setDraftState}
              selectedTeam={selectedTeam}
              setSelectedTeam={setSelectedTeam}
            />
          </div>
          
          <div className="draft-center-panel">
            <PlayerList 
              availablePlayers={draftState.availablePlayers}
              onPlayerSelect={(player) => {
                // Handle player selection logic
                console.log('Player selected:', player);
              }}
            />
          </div>
          
          <div className="draft-right-panel">
            <TeamRoster 
              selectedTeam={selectedTeam}
              draftedPlayers={draftState.draftedPlayers.filter(p => p.teamId === selectedTeam?.id)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 