import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [subsRes, userSubRes] = await Promise.all([
        subscriptionService.getSubscriptions(),
        isAuthenticated ? subscriptionService.getUserSubscription() : Promise.resolve({ data: { subscription: null } })
      ]);

      setSubscriptions(subsRes.data.subscriptions);
      setUserSubscription(userSubRes.data.subscription);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (subscriptionId) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    try {
      await subscriptionService.purchaseSubscription(subscriptionId);
      alert('Подписка успешно оформлена!');
      loadData();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Ошибка при оформлении подписки');
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
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        Выберите подписку
      </h1>

      {userSubscription?.active && (
        <div className="bg-green-600 text-white p-4 rounded-lg mb-8 text-center">
          <p className="text-lg font-semibold">
            Активная подписка: {userSubscription.subscription.name}
          </p>
          <p className="text-sm">
            Действует до: {new Date(userSubscription.endDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="bg-netflix-gray rounded-lg p-6 hover:transform hover:scale-105 transition-transform"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              {subscription.name}
            </h3>
            
            <div className="text-4xl font-bold text-netflix-red mb-4">
              {subscription.price} ₽
              <span className="text-sm text-gray-400 ml-2">
                / {subscription.duration} дней
              </span>
            </div>

            {subscription.description && (
              <p className="text-gray-300 mb-6">{subscription.description}</p>
            )}

            {subscription.features && typeof subscription.features === 'object' && (
              <ul className="space-y-2 mb-6">
                {Object.entries(subscription.features).map(([key, value]) => (
                  <li key={key} className="text-gray-300 flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {String(value)}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => handlePurchase(subscription.id)}
              disabled={!isAuthenticated}
              className="w-full bg-netflix-red text-white py-3 rounded font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isAuthenticated
                ? 'Войдите для покупки'
                : userSubscription?.subscriptionId === subscription.id
                ? 'Текущая подписка'
                : 'Выбрать'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-netflix-gray rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Или покупайте контент отдельно
        </h2>
        <p className="text-gray-300 mb-6">
          Не хотите подписку? Покупайте отдельные видео или пакеты контента
        </p>
        <button
          onClick={() => window.location.href = '/videos'}
          className="bg-white text-black px-8 py-3 rounded font-semibold hover:bg-gray-200 transition"
        >
          Посмотреть видео
        </button>
      </div>
    </div>
  );
};

export default Subscriptions;
