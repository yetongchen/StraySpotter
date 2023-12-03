import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import StrayMap from './components/StrayMap';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
      <nav>
        <ul>
          <li>
            <NavLink to="/">Map</NavLink>
          </li>
          <li>
            <NavLink to="/user-center">User Center</NavLink>
          </li>
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<StrayMap />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
