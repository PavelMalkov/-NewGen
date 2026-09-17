const prisma = require('../utils/db');
const crypto = require('crypto');

const getLiveStreams = async (req, res) => {
  try {
    const { status = 'LIVE' } = req.query;

    const streams = await prisma.liveStream.findMany({
      where: status ? { status } : {},
      orderBy: { startedAt: 'desc' }
    });

    res.json({ streams });
  } catch (error) {
    console.error('Get live streams error:', error);
    res.status(500).json({ error: 'Failed to get live streams' });
  }
};

const createStream = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const streamKey = crypto.randomBytes(16).toString('hex');

    const stream = await prisma.liveStream.create({
      data: {
        title,
        description,
        streamKey,
        status: 'OFFLINE'
      }
    });

    res.status(201).json({
      message: 'Stream created successfully',
      stream: {
        id: stream.id,
        title: stream.title,
        streamKey: stream.streamKey,
        status: stream.status
      }
    });
  } catch (error) {
    console.error('Create stream error:', error);
    res.status(500).json({ error: 'Failed to create stream' });
  }
};

const startStream = async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await prisma.liveStream.update({
      where: { id },
      data: {
        status: 'LIVE',
        startedAt: new Date()
      }
    });

    res.json({
      message: 'Stream started',
      stream
    });
  } catch (error) {
    console.error('Start stream error:', error);
    res.status(500).json({ error: 'Failed to start stream' });
  }
};

const stopStream = async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await prisma.liveStream.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });

    res.json({
      message: 'Stream stopped',
      stream
    });
  } catch (error) {
    console.error('Stop stream error:', error);
    res.status(500).json({ error: 'Failed to stop stream' });
  }
};

const deleteStream = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.liveStream.delete({
      where: { id }
    });

    res.json({ message: 'Stream deleted successfully' });
  } catch (error) {
    console.error('Delete stream error:', error);
    res.status(500).json({ error: 'Failed to delete stream' });
  }
};

module.exports = {
  getLiveStreams,
  createStream,
  startStream,
  stopStream,
  deleteStream
};
