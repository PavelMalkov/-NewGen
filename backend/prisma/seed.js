const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Test User',
      role: 'USER'
    }
  });

  console.log('✅ Users created:', { admin, user });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'movies' },
      update: {},
      create: { name: 'Фильмы', slug: 'movies' }
    }),
    prisma.category.upsert({
      where: { slug: 'series' },
      update: {},
      create: { name: 'Сериалы', slug: 'series' }
    }),
    prisma.category.upsert({
      where: { slug: 'documentaries' },
      update: {},
      create: { name: 'Документальные', slug: 'documentaries' }
    }),
    prisma.category.upsert({
      where: { slug: 'education' },
      update: {},
      create: { name: 'Образование', slug: 'education' }
    })
  ]);

  console.log('✅ Categories created');

  const subscriptions = await Promise.all([
    prisma.subscription.upsert({
      where: { name: 'Базовая' },
      update: {},
      create: {
        name: 'Базовая',
        description: 'Доступ к базовой библиотеке контента',
        price: 299,
        duration: 30,
        features: {
          'HD качество': true,
          'Один экран': true,
          'Реклама': false
        }
      }
    }),
    prisma.subscription.upsert({
      where: { name: 'Стандарт' },
      update: {},
      create: {
        name: 'Стандарт',
        description: 'Расширенный доступ к контенту',
        price: 499,
        duration: 30,
        features: {
          'Full HD качество': true,
          'Два экрана': true,
          'Без рекламы': true
        }
      }
    }),
    prisma.subscription.upsert({
      where: { name: 'Премиум' },
      update: {},
      create: {
        name: 'Премиум',
        description: 'Полный доступ ко всему контенту',
        price: 799,
        duration: 30,
        features: {
          '4K качество': true,
          'Четыре экрана': true,
          'Весь премиум контент': true,
          'Приоритетная поддержка': true
        }
      }
    })
  ]);

  console.log('✅ Subscriptions created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
