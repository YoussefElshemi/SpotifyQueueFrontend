import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import QueuePage from './pages/QueuePage';
import SearchPage from './pages/SearchPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import './styles/App.css';

const App = () => {
  const [lightMode, setLightMode] = useState(false);

  const toggleLightMode = () => {
    setLightMode(!lightMode);
  };

  return (
    <Router>
      <div className={`App ${lightMode ? 'light-mode' : 'dark-mode'}`}>
        <nav className="navbar">
          <ul className="nav-links">
            <li>
              <NavLink exact="true" to="/" className="nav-link">Queue</NavLink>
            </li>
            <li>
              <NavLink to="/search" className="nav-link">Search</NavLink>
            </li>
          </ul>
          <button onClick={toggleLightMode} className="light-mode-toggle">
            {<FontAwesomeIcon icon={lightMode ? faMoon : faSun}/>}
          </button>
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
