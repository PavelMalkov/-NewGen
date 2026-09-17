# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register
**POST** `/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "jwt_token"
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "jwt_token"
}
```

### Get Current User
**GET** `/auth/me`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "subscription": { ... }
  }
}
```

---

## Video Endpoints

### Get All Videos
**GET** `/videos`

Query parameters:
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `categoryId` (string)
- `search` (string)
- `isPremium` (boolean)
- `sortBy` (string: createdAt, views)
- `order` (string: asc, desc)

Response:
```json
{
  "videos": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get Video by ID
**GET** `/videos/:id`

Response:
```json
{
  "video": {
    "id": "uuid",
    "title": "Video Title",
    "description": "Description",
    "duration": 3600,
    "thumbnail": "/uploads/thumbnails/...",
    "views": 1000,
    "category": { ... }
  }
}
```

### Upload Video (Admin only)
**POST** `/videos`

Headers: `Authorization: Bearer <token>`

Content-Type: `multipart/form-data`

Form data:
- `video` (file, required)
- `thumbnail` (file, optional)
- `title` (string, required)
- `description` (string, optional)
- `categoryId` (string, optional)
- `price` (number, optional)
- `isPremium` (boolean, optional)

Response:
```json
{
  "message": "Video uploaded successfully and is being processed",
  "video": {
    "id": "uuid",
    "title": "Video Title",
    "status": "PROCESSING"
  }
}
```

### Stream Video
**GET** `/videos/:id/stream`

Query parameters:
- `quality` (string: 360p, 480p, 720p, 1080p)

Returns: HLS manifest file or video file

### Update Watch Progress
**POST** `/videos/:id/progress`

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "progress": 120
}
```

### Delete Video (Admin only)
**DELETE** `/videos/:id`

Headers: `Authorization: Bearer <token>`

---

## Subscription Endpoints

### Get All Subscriptions
**GET** `/subscriptions`

Response:
```json
{
  "subscriptions": [
    {
      "id": "uuid",
      "name": "Basic",
      "description": "...",
      "price": 299,
      "duration": 30,
      "features": { ... }
    }
  ]
}
```

### Create Subscription (Admin only)
**POST** `/subscriptions`

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "name": "Premium",
  "description": "Full access",
  "price": 799,
  "duration": 30,
  "features": {
    "4K": true,
    "screens": 4
  }
}
```

### Purchase Subscription
**POST** `/subscriptions/purchase`

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "subscriptionId": "uuid"
}
```

### Get User Subscription
**GET** `/subscriptions/user`

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "subscription": {
    "id": "uuid",
    "startDate": "2024-01-01",
    "endDate": "2024-02-01",
    "active": true,
    "subscription": { ... }
  }
}
```

### Purchase Video
**POST** `/subscriptions/purchase-video`

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "videoId": "uuid"
}
```
or
```json
{
  "packageId": "uuid"
}
```

---

## Live Stream Endpoints

### Get Live Streams
**GET** `/streams/live`

Query parameters:
- `status` (string: LIVE, OFFLINE, ENDED)

Response:
```json
{
  "streams": [
    {
      "id": "uuid",
      "title": "Live Stream",
      "status": "LIVE",
      "viewerCount": 100
    }
  ]
}
```

### Create Stream (Admin only)
**POST** `/streams`

Headers: `Authorization: Bearer <token>`

Request body:
```json
{
  "title": "New Stream",
  "description": "..."
}
```

### Start Stream (Admin only)
**POST** `/streams/:id/start`

Headers: `Authorization: Bearer <token>`

### Stop Stream (Admin only)
**POST** `/streams/:id/stop`

Headers: `Authorization: Bearer <token>`

### Delete Stream (Admin only)
**DELETE** `/streams/:id`

Headers: `Authorization: Bearer <token>`

---

## User Endpoints

### Get User Profile
**GET** `/users/profile`

Headers: `Authorization: Bearer <token>`

### Get Watch History
**GET** `/users/history`

Headers: `Authorization: Bearer <token>`

Query parameters:
- `page` (number)
- `limit` (number)

### Get Purchases
**GET** `/users/purchases`

Headers: `Authorization: Bearer <token>`

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
