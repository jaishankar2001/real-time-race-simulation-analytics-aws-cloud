import React, { useState } from 'react';
import './App.css';
import { RaceTrack } from './components/racetrack';
import Leaderboard from './components/leaderboard';
import TelemetryChart from './components/telemetry';

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showTelemetry, setShowTelemetry] = useState(false);

  const handlePlayerSelect = (name) => {
    setSelectedPlayer(name);
    setShowTelemetry(true);
  };

  const handleCloseTelemetry = () => {
    setShowTelemetry(false);
  };

  return (
    <div className="app-container">
      <h1>RaceTrack Visualization</h1>
      <div className="racetrack-leaderboard-container">
        <div className="racetrack-container">
          <RaceTrack />
        </div>
        <div className="leaderboard-container">
          <Leaderboard onItemClick={handlePlayerSelect} />
        </div>
      </div>
      {showTelemetry && (
        <div className="telemetry-container-wrapper">
          <div className="telemetry-container">
            <button className="close-button" onClick={handleCloseTelemetry}>
              &times;
            </button>
            {selectedPlayer && <TelemetryChart playerName={selectedPlayer} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
