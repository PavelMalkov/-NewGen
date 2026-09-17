const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  createSubscription,
  purchaseSubscription,
  getUserSubscription,
  createVideoPackage,
  purchaseVideo
} = require('../controllers/subscription.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.get('/', getSubscriptions);
router.post('/', authMiddleware, adminMiddleware, createSubscription);
router.post('/purchase', authMiddleware, purchaseSubscription);
router.get('/user', authMiddleware, getUserSubscription);
router.post('/packages', authMiddleware, adminMiddleware, createVideoPackage);
router.post('/purchase-video', authMiddleware, purchaseVideo);

module.exports = router;
