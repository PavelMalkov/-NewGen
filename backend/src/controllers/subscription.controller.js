const prisma = require('../utils/db');

const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { price: 'asc' }
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get subscriptions' });
  }
};

const createSubscription = async (req, res) => {
  try {
    const { name, description, price, duration, features } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ error: 'Name, price, and duration are required' });
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        features: features || {}
      }
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
};

const purchaseSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const existingSubscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + subscription.duration);

    if (existingSubscription) {
      await prisma.userSubscription.update({
        where: { userId },
        data: {
          subscriptionId,
          startDate,
          endDate,
          active: true
        }
      });
    } else {
      await prisma.userSubscription.create({
        data: {
          userId,
          subscriptionId,
          startDate,
          endDate,
          active: true
        }
      });
    }

    res.json({
      message: 'Subscription purchased successfully',
      subscription: {
        name: subscription.name,
        endDate
      }
    });
  } catch (error) {
    console.error('Purchase subscription error:', error);
    res.status(500).json({ error: 'Failed to purchase subscription' });
  }
};

const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId },
      include: {
        subscription: true
      }
    });

    if (!userSubscription) {
      return res.json({ subscription: null });
    }

    const isActive = new Date() < new Date(userSubscription.endDate);

    if (!isActive && userSubscription.active) {
      await prisma.userSubscription.update({
        where: { userId },
        data: { active: false }
      });
    }

    res.json({
      subscription: {
        ...userSubscription,
        active: isActive
      }
    });
  } catch (error) {
    console.error('Get user subscription error:', error);
    res.status(500).json({ error: 'Failed to get user subscription' });
  }
};

const createVideoPackage = async (req, res) => {
  try {
    const { name, description, price, videoIds } = req.body;

    if (!name || !price || !videoIds || !Array.isArray(videoIds)) {
      return res.status(400).json({ error: 'Name, price, and videoIds are required' });
    }

    const videoPackage = await prisma.videoPackage.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        videoIds,
        videos: {
          connect: videoIds.map(id => ({ id }))
        }
      },
      include: {
        videos: true
      }
    });

    res.status(201).json({
      message: 'Video package created successfully',
      package: videoPackage
    });
  } catch (error) {
    console.error('Create video package error:', error);
    res.status(500).json({ error: 'Failed to create video package' });
  }
};

const purchaseVideo = async (req, res) => {
  try {
    const { videoId, packageId } = req.body;
    const userId = req.user.id;

    if (!videoId && !packageId) {
      return res.status(400).json({ error: 'Either videoId or packageId is required' });
    }

    let price = 0;

    if (videoId) {
      const video = await prisma.video.findUnique({
        where: { id: videoId }
      });

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      price = video.price || 0;
    } else if (packageId) {
      const videoPackage = await prisma.videoPackage.findUnique({
        where: { id: packageId }
      });

      if (!videoPackage) {
        return res.status(404).json({ error: 'Package not found' });
      }

      price = videoPackage.price;
    }

    const purchase = await prisma.videoPurchase.create({
      data: {
        userId,
        videoId: videoId || null,
        packageId: packageId || null,
        price
      }
    });

    res.status(201).json({
      message: 'Purchase successful',
      purchase
    });
  } catch (error) {
    console.error('Purchase video error:', error);
    res.status(500).json({ error: 'Failed to purchase video' });
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  purchaseSubscription,
  getUserSubscription,
  createVideoPackage,
  purchaseVideo
};
