import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import QueuePage from './pages/QueuePage';
import SearchPage from './pages/SearchPage';
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <ul className="nav-links">
            <li>
              <NavLink exact="true" to="/" className="nav-link">Queue</NavLink>
            </li>
            <li>
              <NavLink to="/search" className="nav-link">Search</NavLink>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
