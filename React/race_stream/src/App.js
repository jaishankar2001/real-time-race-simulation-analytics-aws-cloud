import React from 'react';
import './App.css';
import { RaceTrack } from './components/racetrack';
import Leaderboard from './components/leaderboard'; // Import the Leaderboard component

function App() {
  return (
    <div className="app-container">
      <div className="leaderboard-container">
        <Leaderboard />
      </div>
      <div className="racetrack-container">
        <RaceTrack />
      </div>
    </div>
  );
}

export default App;
