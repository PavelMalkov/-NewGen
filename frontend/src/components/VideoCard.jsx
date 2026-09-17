import { Link } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const thumbnailUrl = video.thumbnail
    ? `http://localhost:5000${video.thumbnail}`
    : 'https://via.placeholder.com/400x225?text=No+Thumbnail';

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  return (
    <Link to={`/watch/${video.id}`} className="video-card group">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        
        {video.isPremium && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
            PREMIUM
          </div>
        )}

        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {formatDuration(video.duration)}
          </div>
        )}

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-white font-semibold text-sm line-clamp-2">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-gray-400 text-xs">
            {video.views?.toLocaleString()} просмотров
          </span>
          
          {video.price && (
            <span className="text-green-400 text-xs font-bold">
              {video.price} ₽
            </span>
          )}
        </div>

        {video.category && (
          <span className="text-gray-500 text-xs mt-1 inline-block">
            {video.category.name}
          </span>
        )}
      </div>
    </Link>
  );
};

export default VideoCard;
