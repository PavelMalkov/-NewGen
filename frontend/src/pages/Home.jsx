import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoService, streamService } from '../services/api';
import VideoCard from '../components/VideoCard';

const Home = () => {
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [videosRes, streamsRes] = await Promise.all([
        videoService.getVideos({ limit: 12, sortBy: 'views', order: 'desc' }),
        streamService.getLiveStreams()
      ]);

      setFeaturedVideos(videosRes.data.videos);
      setLiveStreams(streamsRes.data.streams);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative h-[80vh] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1574267432644-f797f8ec2f32?w=1920)',
          }}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Безграничный стриминг
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Смотрите фильмы, сериалы и прямые трансляции в любое время
          </p>
          <Link
            to="/videos"
            className="inline-block bg-netflix-red text-white px-8 py-4 rounded text-lg font-semibold hover:bg-red-700 transition"
          >
            Начать просмотр
          </Link>
        </div>
      </section>

      {liveStreams.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-white mb-6">
            🔴 Прямые трансляции
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {liveStreams.map((stream) => (
              <Link
                key={stream.id}
                to={`/live/${stream.id}`}
                className="relative overflow-hidden rounded-lg group"
              >
                <img
                  src={stream.thumbnail || 'https://via.placeholder.com/400x225?text=Live+Stream'}
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                  LIVE
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white font-semibold">{stream.title}</h3>
                  <p className="text-gray-300 text-sm">{stream.viewerCount} зрителей</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">Популярные видео</h2>
          <Link to="/videos" className="text-netflix-red hover:underline">
            Смотреть все →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </section>

      <section className="bg-netflix-gray py-16 mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Почему выбирают нас?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📺</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Тысячи видео
              </h3>
              <p className="text-gray-400">
                Огромная библиотека фильмов, сериалов и эксклюзивного контента
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔴</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Прямые трансляции
              </h3>
              <p className="text-gray-400">
                Смотрите прямые эфиры и общайтесь с создателями контента
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Гибкие подписки
              </h3>
              <p className="text-gray-400">
                Выбирайте подходящий тариф или покупайте контент отдельно
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
