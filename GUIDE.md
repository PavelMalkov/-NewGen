# 🎥 Руководство по запуску платформы видеостриминга

## Содержание
1. [Быстрый старт с Docker](#быстрый-старт-с-docker)
2. [Ручная установка](#ручная-установка)
3. [Использование платформы](#использование-платформы)
4. [Загрузка видео](#загрузка-видео)
5. [Тестирование](#тестирование)
6. [Возможные проблемы](#возможные-проблемы)

---

## Быстрый старт с Docker

### Предварительные требования
- Docker
- Docker Compose

### Запуск

```bash
# Клонировать репозиторий (если еще не сделано)
git clone <repository-url>
cd video-streaming-platform

# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Посмотреть логи
docker-compose logs -f
```

После запуска:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432

---

## Ручная установка

### Предварительные требования
- Node.js 18+
- PostgreSQL 15+
- FFmpeg

### Шаг 1: Установка PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**MacOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Скачать с https://www.postgresql.org/download/windows/

### Шаг 2: Установка FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**MacOS:**
```bash
brew install ffmpeg
```

**Windows:**
Скачать с https://ffmpeg.org/download.html

### Шаг 3: Настройка проекта

```bash
# Использовать скрипт автоматической установки
chmod +x setup.sh
./setup.sh
```

Или вручную:

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js

# Frontend
cd ../frontend
npm install
cp .env.example .env
```

### Шаг 4: Запуск

Откройте два терминала:

**Терминал 1 (Backend):**
```bash
cd backend
npm run dev
```

**Терминал 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## Использование платформы

### Учетные записи для тестирования

После выполнения seed скрипта доступны следующие аккаунты:

**Администратор:**
- Email: `admin@example.com`
- Пароль: `admin123`

**Пользователь:**
- Email: `user@example.com`
- Пароль: `user123`

### Основные функции

#### Для обычных пользователей:

1. **Регистрация/Вход**
   - Перейдите на http://localhost:3000
   - Нажмите "Регистрация" или используйте тестовые учетные данные

2. **Просмотр видео**
   - Перейдите в раздел "Видео"
   - Используйте поиск и фильтры
   - Кликните на видео для просмотра

3. **Подписки**
   - Перейдите в раздел "Подписки"
   - Выберите подходящий тариф
   - Оформите подписку

4. **Профиль**
   - Просмотр истории
   - Управление покупками
   - Информация о подписке

#### Для администраторов:

1. **Загрузка видео**
   - Войдите как администратор
   - Используйте API endpoint для загрузки
   - Видео автоматически обрабатывается в HLS

2. **Управление трансляциями**
   - Создание live stream
   - Запуск/остановка трансляций

---

## Загрузка видео

### Через API (cURL)

```bash
# Получить токен (войти как admin)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.token')

# Загрузить видео
curl -X POST http://localhost:5000/api/videos \
  -H "Authorization: Bearer $TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "title=Тестовое видео" \
  -F "description=Описание видео" \
  -F "isPremium=false"
```

### Через Postman

1. POST http://localhost:5000/api/auth/login
   - Body: JSON с email и password
   - Сохраните полученный token

2. POST http://localhost:5000/api/videos
   - Headers: `Authorization: Bearer <token>`
   - Body: form-data
     - video: файл
     - thumbnail: файл (опционально)
     - title: текст
     - description: текст (опционально)
     - isPremium: boolean (опционально)

### Обработка видео

После загрузки видео автоматически обрабатывается FFmpeg:
- Создаются версии в разных разрешениях (360p, 480p, 720p, 1080p)
- Генерируются HLS сегменты
- Создается master playlist
- Статус меняется с PROCESSING на READY

Время обработки зависит от размера видео (примерно 1-5 минут для короткого видео).

---

## Тестирование

### 1. Проверка Backend API

```bash
# Проверка здоровья сервера
curl http://localhost:5000/

# Получение списка видео
curl http://localhost:5000/api/videos

# Получение подписок
curl http://localhost:5000/api/subscriptions
```

### 2. Проверка Frontend

Откройте http://localhost:3000 и проверьте:
- ✅ Загрузка главной страницы
- ✅ Вход в систему
- ✅ Просмотр каталога видео
- ✅ Работа поиска
- ✅ Просмотр видео (требуется загруженное видео)

### 3. Проверка базы данных

```bash
# Войти в PostgreSQL
psql -U postgres -d streaming_db

# Проверить таблицы
\dt

# Проверить пользователей
SELECT * FROM "User";

# Проверить видео
SELECT id, title, status FROM "Video";
```

---

## Возможные проблемы

### 1. Ошибка подключения к базе данных

**Проблема:** `Error: connect ECONNREFUSED`

**Решение:**
```bash
# Проверить, запущен ли PostgreSQL
sudo systemctl status postgresql

# Запустить PostgreSQL
sudo systemctl start postgresql

# Проверить настройки в backend/.env
DATABASE_URL="postgresql://postgres:password@localhost:5432/streaming_db"
```

### 2. Ошибка FFmpeg

**Проблема:** `Error: ffmpeg not found`

**Решение:**
```bash
# Проверить установку FFmpeg
ffmpeg -version

# Если не установлен, установить:
# Ubuntu/Debian
sudo apt install ffmpeg

# MacOS
brew install ffmpeg
```

### 3. Ошибка CORS

**Проблема:** CORS ошибки в браузере

**Решение:**
Убедитесь, что backend запущен и в `backend/src/server.js` включен CORS:
```javascript
app.use(cors());
```

### 4. Видео не воспроизводится

**Возможные причины:**

1. Видео еще обрабатывается
   - Проверьте статус видео в БД
   - Подождите окончания обработки

2. Неподдерживаемый формат браузера
   - Используйте современный браузер (Chrome, Firefox, Safari)
   - Проверьте консоль браузера на ошибки

3. Неправильные пути к файлам
   - Проверьте, что файлы существуют в `backend/uploads/`
   - Проверьте права доступа к файлам

### 5. Порты заняты

**Проблема:** `Error: Port 5000 already in use`

**Решение:**
```bash
# Найти процесс на порту
lsof -i :5000

# Убить процесс
kill -9 <PID>

# Или изменить порт в .env
PORT=5001
```

---

## Производительность и масштабирование

### Рекомендации для production:

1. **Используйте CDN** для раздачи видео
2. **Настройте Redis** для кэширования
3. **Используйте S3/MinIO** для хранения видео
4. **Настройте Nginx** как reverse proxy
5. **Включите gzip** компрессию
6. **Используйте PM2** для управления процессами Node.js
7. **Настройте мониторинг** (Prometheus + Grafana)

### Пример настройки Nginx:

```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /path/to/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Дополнительные ресурсы

- [API Документация](./API.md)
- [Prisma Документация](https://www.prisma.io/docs/)
- [React Документация](https://react.dev/)
- [FFmpeg Документация](https://ffmpeg.org/documentation.html)
- [HLS Спецификация](https://datatracker.ietf.org/doc/html/rfc8216)

---

## Поддержка

Если вы столкнулись с проблемой:

1. Проверьте логи:
   ```bash
   # Docker
   docker-compose logs backend
   docker-compose logs frontend
   
   # Локально
   # Смотрите вывод в терминале где запущен сервис
   ```

2. Проверьте issues в репозитории
3. Создайте новый issue с описанием проблемы

---

## Лицензия

MIT
