// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './components/homepage.js';
import RacePage from './components/racepage.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/race-page" element={<RacePage />} />
      </Routes>
    </Router>
  );
}

export default App;
