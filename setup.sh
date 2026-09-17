#!/bin/bash

echo "🚀 Starting Video Streaming Platform setup..."

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🗄️ Setting up database..."
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js

cd ..

echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cp .env.example .env

cd ..

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker: docker-compose up -d"
echo ""
echo "Test credentials:"
echo "Admin: admin@example.com / admin123"
echo "User: user@example.com / user123"
