const express = require('express');
const router = express.Router();
const {
  getLiveStreams,
  createStream,
  startStream,
  stopStream,
  deleteStream
} = require('../controllers/stream.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.get('/live', getLiveStreams);
router.post('/', authMiddleware, adminMiddleware, createStream);
router.post('/:id/start', authMiddleware, adminMiddleware, startStream);
router.post('/:id/stop', authMiddleware, adminMiddleware, stopStream);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStream);

module.exports = router;
