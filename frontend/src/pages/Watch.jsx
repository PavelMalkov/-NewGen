import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoService } from '../services/api';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../contexts/AuthContext';

const Watch = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState([]);

  useEffect(() => {
    loadVideo();
    loadRelatedVideos();
  }, [id]);

  const loadVideo = async () => {
    try {
      const response = await videoService.getVideoById(id);
      setVideo(response.data.video);
    } catch (error) {
      console.error('Failed to load video:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedVideos = async () => {
    try {
      const response = await videoService.getVideos({ limit: 4 });
      setRelatedVideos(response.data.videos.filter(v => v.id !== id));
    } catch (error) {
      console.error('Failed to load related videos:', error);
    }
  };

  const handleTimeUpdate = async (time) => {
    if (isAuthenticated && video) {
      try {
        await videoService.updateProgress(video.id, time);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Видео не найдено</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <VideoPlayer videoId={video.id} onTimeUpdate={handleTimeUpdate} />
        </div>

        <div className="bg-netflix-gray rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">{video.title}</h1>
          
          <div className="flex items-center gap-6 mb-4">
            <span className="text-gray-300">
              {video.views?.toLocaleString()} просмотров
            </span>
            {video.category && (
              <span className="bg-gray-700 text-white px-3 py-1 rounded">
                {video.category.name}
              </span>
            )}
            {video.isPremium && (
              <span className="bg-yellow-500 text-black px-3 py-1 rounded font-bold">
                PREMIUM
              </span>
            )}
          </div>

          {video.description && (
            <div className="text-gray-300 mb-4">
              <p>{video.description}</p>
            </div>
          )}

          {video.price && (
            <div className="flex items-center gap-4">
              <span className="text-2xl text-green-400 font-bold">
                {video.price} ₽
              </span>
              {isAuthenticated && (
                <button className="bg-netflix-red text-white px-6 py-2 rounded hover:bg-red-700 transition">
                  Купить видео
                </button>
              )}
            </div>
          )}
        </div>

        {relatedVideos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Похожие видео
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedVideos.map((relatedVideo) => (
                <Link
                  key={relatedVideo.id}
                  to={`/watch/${relatedVideo.id}`}
                  className="group"
                >
                  <img
                    src={
                      relatedVideo.thumbnail
                        ? `http://localhost:5000${relatedVideo.thumbnail}`
                        : 'https://via.placeholder.com/400x225'
                    }
                    alt={relatedVideo.title}
                    className="w-full h-32 object-cover rounded"
                  />
                  <h3 className="text-white mt-2 group-hover:text-netflix-red transition">
                    {relatedVideo.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;
