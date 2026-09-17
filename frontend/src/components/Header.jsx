import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-netflix-red text-3xl font-bold">STREAMIFY</div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-white hover:text-gray-300 transition">
            Главная
          </Link>
          <Link to="/videos" className="text-white hover:text-gray-300 transition">
            Видео
          </Link>
          <Link to="/live" className="text-white hover:text-gray-300 transition">
            Прямые трансляции
          </Link>
          <Link to="/subscriptions" className="text-white hover:text-gray-300 transition">
            Подписки
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-white hover:text-gray-300 transition"
              >
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-netflix-red text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-gray-300 transition"
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="bg-netflix-red text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
