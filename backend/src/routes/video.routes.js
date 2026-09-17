const express = require('express');
const router = express.Router();
const {
  uploadVideo,
  getVideos,
  getVideoById,
  streamVideo,
  deleteVideo,
  updateWatchProgress
} = require('../controllers/video.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.get('/:id/stream', streamVideo);
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  uploadVideo
);
router.delete('/:id', authMiddleware, adminMiddleware, deleteVideo);
router.post('/:id/progress', authMiddleware, updateWatchProgress);

module.exports = router;
