#!/bin/bash
set -e

echo "🚀 WhoIsDésir® Media — Local Setup"
echo "=================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop first."
  exit 1
fi

# Start PostgreSQL container
echo ""
echo "📦 Starting PostgreSQL..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if PostgreSQL is accepting connections
for i in {1..10}; do
  if docker exec whodesir-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  if [ $i -eq 10 ]; then
    echo "❌ PostgreSQL failed to start. Check Docker logs."
    exit 1
  fi
  sleep 1
done

# Create database if it doesn't exist
echo ""
echo "🗄️  Creating database..."
docker exec whodesir-postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'whodesir_media'" | grep -q 1 || \
  docker exec whodesir-postgres psql -U postgres -c "CREATE DATABASE whodesir_media"
echo "✅ Database 'whodesir_media' ready"

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo ""
echo "📤 Pushing schema to database..."
npx prisma db push

# Seed database
echo ""
echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "=================================="
echo "✅ Setup complete!"
echo ""
echo "Start the dev server:"
echo "  npm run dev"
echo ""
echo "Open in browser:"
echo "  http://localhost:3000/login"
echo ""
echo "Admin login: admin@whodesir.com / password"
echo "=================================="
