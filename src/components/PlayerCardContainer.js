import React from 'react';
import PlayerCard from './PlayerCard';
import './PlayerCardContainer.css';

const PlayerCardContainer = ({ selectedPlayers, onRemovePlayer }) => {
  if (!selectedPlayers || selectedPlayers.length === 0) {
    return null;
  }

  return (
    <div className="player-card-container">
      <div className="player-cards-wrapper">
        {selectedPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            selectedPlayers={selectedPlayers}
            onRemove={onRemovePlayer}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerCardContainer;
