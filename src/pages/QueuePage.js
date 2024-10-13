import React, { useEffect, useState } from 'react';
import { OrbitProgress } from 'react-loading-indicators';
import PlayerFooter from '../components/PlayerFooter';
import QueueList from '../components/QueueList';
import '../styles/QueuePage.css';

const QueuePage = () => {
  const [queueData, setQueueData] = useState({ currentlyPlaying: null, queue: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueueData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/queue`);
      if (!response.ok) {
        throw new Error('Failed to fetch queue data');
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

  return (
    <div className="QueuePage">
      <div className="queue-list">
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
