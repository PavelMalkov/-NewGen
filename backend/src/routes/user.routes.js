const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getWatchHistory,
  getPurchases
} = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.get('/profile', authMiddleware, getUserProfile);
router.get('/history', authMiddleware, getWatchHistory);
router.get('/purchases', authMiddleware, getPurchases);

module.exports = router;
