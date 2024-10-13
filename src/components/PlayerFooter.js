import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faBackward, faForward, faShuffle, faRepeat, faVolumeHigh, faVolumeXmark, faVolumeDown } from '@fortawesome/free-solid-svg-icons';
import formatDuration from '../helpers/FormatDuration';
import '../styles/PlayerFooter.css'
import { Slider } from '@mui/material';
import { alpha } from '@mui/material/styles';

const PlayerFooter = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [duration, setDuration] = useState(0);

  const fetchState = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player`);
      if (!response.ok) {
        throw new Error('Failed to get state');
      }
      const data = await response.json();
      setIsPlaying(data.isPlaying);
      setVolume(data.device.volumePercent);
      setIsShuffled(data.shuffleState);
      setIsRepeated(data.repeatState !== 'off');
      setProgress(data.progressMs);
      setCurrentlyPlaying(data.item);
      setDuration(data.item?.durationMs || 0);

    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const formatPlayback = (progress) => {
    const progressMs = Math.round((progress / 100) * duration);
    return formatDuration(progressMs);
  };

  const onVolumeChange = async (_, volume) => {
    try {
      const body = JSON.stringify({
        volume
      });
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/volume`, {
        method: 'POST', body, headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to change volume');
      }
      setVolume(volume);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onProgressChange = async (_, progress) => {
    const progressMs = Math.round((progress / 100) * duration);
    try {
      const body = JSON.stringify({
        progressMs
      });
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/seek`, {
        method: 'POST', body, headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to seek');
      }
      setProgress(progressMs);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onPlayPause = async () => {
    try {
      const body = JSON.stringify({});
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/${isPlaying ? 'pause' : 'play'}`, {
        method: 'POST', body, headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to pause/play');
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onShuffle = async () => {
    try {
      const body = JSON.stringify({
        state: !isShuffled
      });
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/shuffle`, {
        method: 'POST', body, headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to (un)shuffle');
      }
      setIsShuffled(!isShuffled);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onRepeat = async () => {
    try {
      const body = JSON.stringify({
        state: isRepeated ? 'off' : 'context'
      });
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/repeat`, {
        method: 'POST', body, headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to (un)repeat');
      }
      setIsRepeated(!isRepeated);
    } catch (err) {
      console.error(err.message);
    }
  };

  const onPrevious = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/previous`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to go to previous song');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const onNext = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SPOTIFY_QUEUE_API_BASE_URL}/player/next`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to go to next song');
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      await fetchState()
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="player-footer">
      {currentlyPlaying ? (
        <div style={{ width: '100%' }}>
          <div className="player-content">
            <div className="track-info">
              <img
                src={currentlyPlaying.album.images[2]?.url}
                alt={currentlyPlaying.album.name}
                className="album-art-small"
              />
              <div className="track-details">
                <p><strong>{currentlyPlaying.name}</strong></p>
                <p>{currentlyPlaying.artists.map(artist => artist.name).join(', ')}</p>
              </div>
            </div>
            <p className="track-progress">{formatDuration(progress)}</p>
            <Slider
              aria-label="Playback"
              valueLabelDisplay="auto"
              value={(progress / duration) * 100}
              valueLabelFormat={formatPlayback}
              onChange={(_, progress) => setProgress(Math.round((progress / 100) * duration))}
              onChangeCommitted={onProgressChange} sx={{
                width: '50%',
                color: '#00B8A3',
                '& .MuiSlider-thumb': {
                  color: 'white',
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${alpha('#00B8A3', 0.16)}`,
                  },
                  '&.Mui-active': {
                    boxShadow: `0px 0px 0px 14px ${alpha('#00B8A3', 0.16)}`,
                  },
                },
                marginLeft: 'auto'
              }}
            />
            <p className="track-duration">{formatDuration(duration)}</p>
            <div className="volume-controls">
              <FontAwesomeIcon icon={volume === 0 ? faVolumeXmark : volume < 50 ? faVolumeDown : faVolumeHigh} style={{
                width: '50%',
                color: '#00B8A3',
                float: 'right',
                marginRight: '50px'
              }} />
              <Slider
                aria-label="Volume"
                valueLabelDisplay="auto"
                value={volume}
                onChange={(_, volume) => setVolume(volume)}
                onChangeCommitted={onVolumeChange}
                sx={{
                  width: '50%',
                  color: '#00B8A3',
                  '& .MuiSlider-thumb': {
                    color: 'white',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: `0px 0px 0px 8px ${alpha('#00B8A3', 0.16)}`,
                    },
                    '&.Mui-active': {
                      boxShadow: `0px 0px 0px 14px ${alpha('#00B8A3', 0.16)}`,
                    },
                  },
                  float: 'right',
                  marginRight: '50px'
                }}
              />
            </div>
          </div>
          <div className="player-content">
            <div className="volume-controls"></div>
            <div className="player-controls">
              <button onClick={onShuffle} className={isShuffled ? 'toggled' : 'not-toggled'}><FontAwesomeIcon icon={faShuffle} /></button>
              <button onClick={onPrevious}><FontAwesomeIcon icon={faBackward} /></button>
              <button onClick={onPlayPause}><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></button>
              <button onClick={onNext}><FontAwesomeIcon icon={faForward} /></button>
              <button onClick={onRepeat} className={isRepeated ? 'toggled' : 'not-toggled'}><FontAwesomeIcon icon={faRepeat} /></button>
            </div>
            <div className="volume-controls"></div>
          </div>
        </div>
      ) : (
        <p>No item currently playing</p>
      )}
    </div>
  );
}

export default PlayerFooter;
