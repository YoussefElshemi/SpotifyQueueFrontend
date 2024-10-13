import React, { useEffect, useState } from 'react';
import { OrbitProgress } from 'react-loading-indicators';
import PlayerFooter from '../components/PlayerFooter';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { useSearchParams } from 'react-router-dom';
import '../styles/SearchPage.css';

const PAGE_LIMIT = 10;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState({
    limit: PAGE_LIMIT,
    page: Number(searchParams.get('page')) || 1,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = {
      query,
      page: '1',
    };
    setSearchParams(newParams);
  };

  const handleAddToQueue = async (item) => {
    try {
      const body = JSON.stringify({
        trackUri: item.uri,
      });
      await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/queue`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      setMessage(`${item.name} added to queue!`);
    } catch (err) {
      setError('Failed to add to queue');
    }
  };

  const handlePlayTrack = async (item) => {
    try {
      const body = JSON.stringify({
        trackUri: item.uri,
      });
      await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });
      const queueRecommendedBody = JSON.stringify({
        trackId: item.id,
        limit: PAGE_LIMIT,
      });
      await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/queue/recommended`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: queueRecommendedBody,
      });
      setMessage(`${item.name} played!`);
    } catch (err) {
      setError('Failed to play');
    }
  };

  const handleNextPage = () => {
    const newPage = pagination.page + 1;
    const newParams = {
      query,
      page: newPage,
    };
    setSearchParams(newParams);
  };

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      const newPage = pagination.page - 1;
      const newParams = {
        query,
        page: newPage,
      };
      setSearchParams(newParams);
    }
  };

  useEffect(() => {
    const searchQuery = searchParams.get('query') || '';
    const page = Number(searchParams.get('page')) || 1;
    
    const fetchSearchResults = async (searchQuery, page) => {
      if (!searchQuery.length) return;
      try {
        setIsLoading(true);
        const offset = (page - 1) * PAGE_LIMIT;
        const queryParams = new URLSearchParams({
          searchQuery,
          offset: offset,
          limit: PAGE_LIMIT,
        });
        const response = await fetch(
          `${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/search?${queryParams}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        const data = await response.json();
        setSearchResults(data.items);
        setPagination({ page, total: data.total });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults(searchQuery, page);
  }, [searchParams]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
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
        <button disabled={pagination.page === 1} onClick={handlePreviousPage}>Previous</button>
        <button
          disabled={pagination.page * PAGE_LIMIT >= pagination.total}
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
