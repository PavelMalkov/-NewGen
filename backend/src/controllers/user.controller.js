const prisma = require('../utils/db');

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        subscription: {
          include: {
            subscription: true
          }
        },
        watchHistory: {
          include: {
            video: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 10
        },
        purchases: {
          include: {
            video: true,
            package: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

const getWatchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [history, total] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          video: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.watchHistory.count({ where: { userId } })
    ]);

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get watch history error:', error);
    res.status(500).json({ error: 'Failed to get watch history' });
  }
};

const getPurchases = async (req, res) => {
  try {
    const userId = req.user.id;

    const purchases = await prisma.videoPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        video: true,
        package: {
          include: {
            videos: true
          }
        }
      }
    });

    res.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
};

module.exports = {
  getUserProfile,
  getWatchHistory,
  getPurchases
};
