import { useState, useEffect } from 'react';
import { videoService } from '../services/api';
import VideoCard from '../components/VideoCard';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadVideos();
  }, [page, filter]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 16,
        sortBy: filter === 'popular' ? 'views' : 'createdAt',
        order: 'desc'
      };

      if (filter === 'premium') {
        params.isPremium = 'true';
      }

      const response = await videoService.getVideos(params);
      setVideos(response.data.videos);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await videoService.getVideos({ search, limit: 16 });
      setVideos(response.data.videos);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Все видео</h1>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск видео..."
            className="w-full px-4 py-3 rounded bg-netflix-gray text-white border border-gray-600 focus:border-netflix-red focus:outline-none"
          />
        </form>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-netflix-red text-white'
                : 'bg-netflix-gray text-gray-300'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-4 py-2 rounded ${
              filter === 'popular'
                ? 'bg-netflix-red text-white'
                : 'bg-netflix-gray text-gray-300'
            }`}
          >
            Популярные
          </button>
          <button
            onClick={() => setFilter('premium')}
            className={`px-4 py-2 rounded ${
              filter === 'premium'
                ? 'bg-netflix-red text-white'
                : 'bg-netflix-gray text-gray-300'
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-center py-12">Загрузка...</div>
      ) : videos.length === 0 ? (
        <div className="text-white text-center py-12">Видео не найдены</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-netflix-gray text-white rounded disabled:opacity-50"
              >
                Назад
              </button>
              <span className="px-4 py-2 text-white">
                Страница {page} из {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-netflix-gray text-white rounded disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Videos;
