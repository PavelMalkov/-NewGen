# 🎬 Video Streaming Platform

Платформа видеостриминга с функциями, аналогичными Netflix и Кинопоиск.

## Функционал

### ✨ Основные возможности
- 📹 **VOD (Video on Demand)** - просмотр загруженных видео
- 🔴 **Live Streaming** - прямые трансляции
- 💳 **Монетизация** - покупка подписок и групп видео
- 🎨 **Современный UI** - интерфейс в стиле Netflix
- 👤 **Управление пользователями** - регистрация, авторизация, профили
- 🔐 **Безопасность** - JWT токены, защищенные API

### 🎥 Видео технологии
- **HLS Streaming** - адаптивный битрейт для качественного просмотра
- **Множественные разрешения** - 360p, 480p, 720p, 1080p
- **Прогрессивная загрузка** - начало просмотра без полной загрузки
- **WebRTC** - технология для прямых трансляций

## Технологический стек

### Backend
- **Node.js** + Express.js
- **PostgreSQL** - основная база данных
- **Prisma** - ORM
- **JWT** - авторизация
- **FFmpeg** - обработка видео
- **Stripe** - платежи

### Frontend
- **React 18** + Vite
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **Video.js / HLS.js** - видеоплеер
- **TailwindCSS** - стилизация

### Инфраструктура
- **Docker** - контейнеризация
- **Nginx** - прокси и раздача статики
- **AWS S3 / MinIO** - хранилище видео (опционально)

## Структура проекта

```
video-streaming-platform/
├── backend/                 # Backend сервер
│   ├── src/
│   │   ├── controllers/    # Контроллеры API
│   │   ├── models/         # Модели данных
│   │   ├── routes/         # Маршруты API
│   │   ├── middleware/     # Middleware (auth, upload и т.д.)
│   │   ├── services/       # Бизнес-логика
│   │   └── utils/          # Утилиты
│   ├── prisma/             # Схемы БД
│   ├── uploads/            # Загруженные видео
│   └── package.json
├── frontend/               # Frontend приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── services/      # API сервисы
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Утилиты
│   └── package.json
├── docker-compose.yml      # Docker конфигурация
└── README.md
```

## Быстрый старт

### Установка зависимостей

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Настройка окружения

Создайте `.env` файлы:

**backend/.env:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/streaming_db"
JWT_SECRET="your-secret-key-here"
STRIPE_SECRET_KEY="your-stripe-key"
PORT=5000
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

### Запуск с Docker

```bash
docker-compose up -d
```

### Запуск вручную

```bash
# Запуск PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=streaming_db postgres:15

# Backend
cd backend
npm run dev

# Frontend (в другом терминале)
cd frontend
npm run dev
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `GET /api/auth/me` - текущий пользователь

### Видео
- `GET /api/videos` - список видео
- `GET /api/videos/:id` - детали видео
- `POST /api/videos` - загрузка видео (admin)
- `GET /api/videos/:id/stream` - стриминг видео

### Подписки
- `GET /api/subscriptions` - доступные подписки
- `POST /api/subscriptions/purchase` - покупка подписки
- `GET /api/users/subscription` - текущая подписка

### Прямые трансляции
- `GET /api/streams/live` - активные трансляции
- `POST /api/streams/start` - начать трансляцию (admin)
- `POST /api/streams/stop` - остановить трансляцию

## Дальнейшее развитие

- [ ] Рекомендательная система на основе ML
- [ ] Субтитры и множественные аудиодорожки
- [ ] Социальные функции (комментарии, рейтинги)
- [ ] Мобильные приложения (React Native)
- [ ] CDN интеграция для масштабирования
- [ ] Аналитика просмотров

## Лицензия

MIT
