import React, { useEffect, useState } from 'react';
import { OrbitProgress } from 'react-loading-indicators';
import PlayerFooter from '../components/PlayerFooter';
import QueueList from '../components/QueueList';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import '../styles/QueuePage.css';

const QueuePage = () => {
  const [queueData, setQueueData] = useState({ currentlyPlaying: null, queue: [] });
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchQueueData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/queue`);
      if (!response.ok) {
        throw new Error('Failed to update queue');
      }
      const data = await response.json();
      setQueueData(data.queue);
    } catch (err) {
      setQueueData([]);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      await fetchQueueData();
      setIsLoading(false);
    }

    fetchData();

    const interval = setInterval(async () => {
      await fetchQueueData();
    }, 1000)

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="QueuePage">
      <div className="queue-list">
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
        <h2>Queue</h2>
        {isLoading && (
          <div className="loading-container">
            <OrbitProgress variant="track-disc" speedPlus="0" easing="linear" />
          </div>
        )}

        {!isLoading && (
          <QueueList queue={queueData} />
        )}
        <PlayerFooter />
      </div>
    </div>
  );
};

export default QueuePage;
