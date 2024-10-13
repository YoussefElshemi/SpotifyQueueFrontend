import React, { useEffect, useState } from 'react';
import { OrbitProgress } from 'react-loading-indicators';
import PlayerFooter from '../components/PlayerFooter';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({ limit: 10, offset: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchSearchResults = async (searchQuery, limit, offset) => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        "searchQuery": searchQuery,
        "offset": offset,
        "limit": limit
      });
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      const data = await response.json();
      setSearchResults(data.items);
      setPagination({ limit: data.limit, offset: data.offset, total: data.total });
    } catch (err) {
      setError('Failed to search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSearchResults(query, pagination.limit, 0);
  };

  const handleAddToQueue = async (item) => {
    try {
      const body = JSON.stringify({
        trackUri: item.uri
      });
      await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/queue`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body
      });
      setMessage(`${item.name} added to queue!`);
    } catch (err) {
      setError('Failed to add to queue');
    }
  };

  const handlePlayTrack = async (item) => {
    try {
      const body = JSON.stringify({
        trackUri: item.uri
      });
      await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body
      });

      const queueRecommendedBody = JSON.stringify({
        trackId: item.id,
        limit: 10
      });
      await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/queue/recommended`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: queueRecommendedBody
      });
      setMessage(`${item.name} played!`);
    } catch (err) {
      setError('Failed to play');
    }
  };

  const handleNextPage = () => {
    fetchSearchResults(query, pagination.limit, pagination.offset + pagination.limit);
  };

  const handlePreviousPage = () => {
    if (pagination.offset > 0) {
      fetchSearchResults(query, pagination.limit, pagination.offset - pagination.limit);
    }
  };

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="SearchPage">
      {isLoading && (
        <div className="loading-container">
          <OrbitProgress variant="track-disc" speedPlus="0" easing="linear" />
        </div>
      )}
      {message && (
        <Collapse in={message}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setMessage(null);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mt: 2 }}
            severity="success"
          >
            {message}
          </Alert>
        </Collapse>
      )}
      {error && (
        <Collapse in={error}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setError(null);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mt: 2 }}
            severity="error"
          >
            {error}
          </Alert>
        </Collapse>
      )}
      <h2>Search for Songs</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a song..."
        />
        <button type="submit">Search</button>
      </form>

      <ul className="search-results">
        {searchResults.map((item) => (
          <li key={item.id}>
            <div className="search-item">
              <img src={item.album.images[1]?.url} alt={item.album.name} className="album-art-medium" />
              <div className="search-item-details">
                <p>
                  <strong>
                    <a className="spotify-album-link" href={item.externalUrl} target="_blank" rel="noopener noreferrer">{item.name}</a>
                  </strong>
                </p>
                <p>{item.artists.map((artist, index) => (
                  <span key={artist.name}>
                    <a className="spotify-album-link" href={artist.externalUrl} target="_blank" rel="noopener noreferrer">
                      {artist.name}
                    </a>
                    {index < item.artists.length - 1 ? ', ' : ''}
                  </span>
                ))}</p>
                <button onClick={() => handlePlayTrack(item)}>Play</button>
                <button onClick={() => handleAddToQueue(item)}>Add to Queue</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button disabled={pagination.offset === 0} onClick={handlePreviousPage}>Previous</button>
        <button
          disabled={pagination.offset + pagination.limit >= pagination.total}
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
      <PlayerFooter />
    </div>
  );
};

export default SearchPage;
