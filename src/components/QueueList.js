import formatDuration from '../helpers/FormatDuration';

const QueueList = ({ queue }) => (
  <ul>
    {queue.map((item) => (
      <li key={item.id} className="queue-item">
        <img
          src={item.album.images[1]?.url}
          alt={item.album.name}
          className="album-art-medium"
        />
        <div className="queue-item-details">
          <p><strong>Track:</strong> <a className="spotify-album-link" href={item.externalUrl} target="_blank" rel="noopener noreferrer">{item.name}</a></p>
          <p><strong>Artist:</strong> {item.artists.map((artist, index) => (
            <span key={artist.name}>
              <a className="spotify-album-link" href={artist.externalUrl} target="_blank" rel="noopener noreferrer">
                {artist.name}
              </a>
              {index < item.artists.length - 1 ? ', ' : ''}
            </span>
          ))}</p>
          <p><strong>Album:</strong> <a className="spotify-album-link" href={item.album.externalUrl} target="_blank" rel="noopener noreferrer">{item.album.name}</a></p>
          <p><strong>Duration:</strong> {formatDuration(item.durationMs)}</p>
        </div>
      </li>
    ))}
  </ul>
);

export default QueueList;