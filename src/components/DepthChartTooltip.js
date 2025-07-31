import React from 'react';
import './DepthChartTooltip.css';

const DepthChartTooltip = ({ depthChartData, isVisible, position }) => {
  if (!isVisible || !depthChartData) {
    return null;
  }

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  
  const getPositionPlayers = (position) => {
    return depthChartData.filter(player => player.position === position);
  };

  return (
    <div 
      className="depth-chart-tooltip"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div className="depth-chart-header">
        <h3>{depthChartData[0]?.team} Depth Chart</h3>
      </div>
      <div className="depth-chart-content">
        {positions.map(pos => {
          const players = getPositionPlayers(pos);
          if (players.length === 0) return null;
          
          return (
            <div key={pos} className="position-group">
              <div className="position-header">{pos}</div>
              <div className="position-players">
                {players.map((player, index) => (
                  <div key={index} className="depth-player">
                    <span className="depth-number">{index + 1}.</span>
                    <span className="player-name">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DepthChartTooltip; 