import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to load profile:', error);
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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-netflix-gray rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Мой профиль</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 mb-2">Имя</p>
            <p className="text-white text-xl">{profile?.name}</p>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">Email</p>
            <p className="text-white text-xl">{profile?.email}</p>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">Роль</p>
            <p className="text-white text-xl">
              {profile?.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
          
          <div>
            <p className="text-gray-400 mb-2">Дата регистрации</p>
            <p className="text-white text-xl">
              {new Date(profile?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {profile?.subscription?.active && (
          <div className="mt-6 p-4 bg-green-600 rounded-lg">
            <p className="text-white font-semibold">
              Активная подписка: {profile.subscription.subscription.name}
            </p>
            <p className="text-white text-sm">
              Действует до: {new Date(profile.subscription.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      <div className="bg-netflix-gray rounded-lg p-8">
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'history'
                ? 'text-white border-b-2 border-netflix-red'
                : 'text-gray-400'
            }`}
          >
            История просмотров
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-3 font-semibold ${
              activeTab === 'purchases'
                ? 'text-white border-b-2 border-netflix-red'
                : 'text-gray-400'
            }`}
          >
            Покупки
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="space-y-4">
            {profile?.watchHistory?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                История просмотров пуста
              </p>
            ) : (
              profile?.watchHistory?.map((item) => (
                <Link
                  key={item.id}
                  to={`/watch/${item.video.id}`}
                  className="flex items-center gap-4 p-4 bg-gray-800 rounded hover:bg-gray-700 transition"
                >
                  <img
                    src={
                      item.video.thumbnail
                        ? `http://localhost:5000${item.video.thumbnail}`
                        : 'https://via.placeholder.com/160x90'
                    }
                    alt={item.video.title}
                    className="w-40 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      {item.video.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Просмотрено: {Math.floor((item.progress / item.video.duration) * 100)}%
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="space-y-4">
            {profile?.purchases?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Покупки отсутствуют
              </p>
            ) : (
              profile?.purchases?.map((purchase) => (
                <div
                  key={purchase.id}
                  className="p-4 bg-gray-800 rounded"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">
                      {purchase.video?.title || purchase.package?.name}
                    </h3>
                    <span className="text-green-400 font-bold">
                      {purchase.price} ₽
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {new Date(purchase.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
