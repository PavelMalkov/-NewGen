#!/bin/bash

echo "🚀 Production Deployment Script"
echo "================================"
echo ""

if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  Please run as root (sudo)"
  exit 1
fi

echo "📦 Installing system dependencies..."
apt update
apt install -y curl git postgresql postgresql-contrib nginx ffmpeg

echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo "📦 Installing PM2..."
npm install -g pm2

echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

echo "📦 Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "🔐 Configuring PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE streaming_db;"
sudo -u postgres psql -c "CREATE USER streaming_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE streaming_db TO streaming_user;"

echo "📁 Creating application directory..."
mkdir -p /var/www/streaming-platform
cd /var/www/streaming-platform

echo "📥 Cloning repository..."
read -p "Enter repository URL: " REPO_URL
git clone $REPO_URL .

echo "⚙️  Configuring backend..."
cd backend
cp .env.example .env

read -p "Enter JWT secret: " JWT_SECRET
read -p "Enter database password: " DB_PASSWORD

cat > .env << EOF
DATABASE_URL="postgresql://streaming_user:${DB_PASSWORD}@localhost:5432/streaming_db"
JWT_SECRET="${JWT_SECRET}"
PORT=5000
NODE_ENV=production
UPLOAD_PATH="/var/www/streaming-platform/backend/uploads"
MAX_FILE_SIZE=5368709120
EOF

echo "📦 Installing backend dependencies..."
npm install --production

echo "🗄️  Running database migrations..."
npx prisma migrate deploy
npx prisma generate

echo "🌱 Seeding database..."
node prisma/seed.js

echo "🚀 Starting backend with PM2..."
pm2 start src/server.js --name streaming-backend
pm2 save
pm2 startup

cd ../frontend

echo "⚙️  Configuring frontend..."
cp .env.example .env

cat > .env << EOF
VITE_API_URL=https://yourdomain.com/api
EOF

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️  Building frontend..."
npm run build

echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/streaming-platform << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 5G;

    location / {
        root /var/www/streaming-platform/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /uploads {
        alias /var/www/streaming-platform/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/streaming-platform /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo "🔒 Installing SSL with Let's Encrypt..."
apt install -y certbot python3-certbot-nginx

read -p "Do you want to configure SSL now? (y/n): " CONFIGURE_SSL

if [ "$CONFIGURE_SSL" = "y" ]; then
    read -p "Enter your domain: " DOMAIN
    certbot --nginx -d $DOMAIN -d www.$DOMAIN
fi

echo "🔄 Restarting Nginx..."
nginx -t && systemctl restart nginx

echo "🔥 Configuring firewall..."
ufw allow 'Nginx Full'
ufw allow OpenSSH
ufw --force enable

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update domain in /etc/nginx/sites-available/streaming-platform"
echo "2. Update VITE_API_URL in frontend/.env"
echo "3. Rebuild frontend: cd frontend && npm run build"
echo "4. Create admin user: cd backend && node scripts/create-admin.js"
echo ""
echo "🔍 Useful commands:"
echo "  pm2 status              - Check backend status"
echo "  pm2 logs streaming-backend - View backend logs"
echo "  pm2 restart streaming-backend - Restart backend"
echo "  nginx -t                - Test Nginx config"
echo "  systemctl status nginx  - Check Nginx status"
echo ""
echo "🌐 Your application should be available at http://yourdomain.com"
