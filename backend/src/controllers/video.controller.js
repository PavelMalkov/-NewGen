const prisma = require('../utils/db');
const path = require('path');
const fs = require('fs');
const { processVideo } = require('../services/video.service');

const uploadVideo = async (req, res) => {
  try {
    const { title, description, categoryId, price, isPremium } = req.body;
    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoPath: videoFile.path,
        thumbnail: thumbnailFile?.path,
        categoryId: categoryId || null,
        price: price ? parseFloat(price) : null,
        isPremium: isPremium === 'true' || isPremium === true,
        status: 'PROCESSING'
      }
    });

    processVideo(video.id, videoFile.path);

    res.status(201).json({
      message: 'Video uploaded successfully and is being processed',
      video: {
        id: video.id,
        title: video.title,
        status: video.status
      }
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
};

const getVideos = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      categoryId, 
      search,
      isPremium,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      status: 'READY'
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true';
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: {
          category: true
        }
      }),
      prisma.video.count({ where })
    ]);

    res.json({
      videos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to get videos' });
  }
};

const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await prisma.video.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to get video' });
  }
};

const streamVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { quality = '720p' } = req.query;

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.status !== 'READY') {
      return res.status(400).json({ error: 'Video is still processing' });
    }

    if (video.hlsPath && fs.existsSync(video.hlsPath)) {
      const qualityPath = path.join(video.hlsPath, quality, 'index.m3u8');
      
      if (fs.existsSync(qualityPath)) {
        res.sendFile(path.resolve(qualityPath));
      } else {
        const masterPlaylist = path.join(video.hlsPath, 'master.m3u8');
        if (fs.existsSync(masterPlaylist)) {
          res.sendFile(path.resolve(masterPlaylist));
        } else {
          res.status(404).json({ error: 'Stream not found' });
        }
      }
    } else {
      res.sendFile(path.resolve(video.videoPath));
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({ error: 'Failed to stream video' });
  }
};

const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (fs.existsSync(video.videoPath)) {
      fs.unlinkSync(video.videoPath);
    }

    if (video.hlsPath && fs.existsSync(video.hlsPath)) {
      fs.rmSync(video.hlsPath, { recursive: true, force: true });
    }

    if (video.thumbnail && fs.existsSync(video.thumbnail)) {
      fs.unlinkSync(video.thumbnail);
    }

    await prisma.video.delete({
      where: { id }
    });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

const updateWatchProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    await prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId: id
        }
      },
      update: {
        progress: parseInt(progress)
      },
      create: {
        userId,
        videoId: id,
        progress: parseInt(progress)
      }
    });

    res.json({ message: 'Progress updated' });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoById,
  streamVideo,
  deleteVideo,
  updateWatchProgress
};
