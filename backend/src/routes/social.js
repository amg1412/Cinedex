import express from 'express';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Follow user
router.post(
  '/:userId/follow',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.user.userId.toString()) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to following list
    currentUser.following.push(userId);
    await currentUser.save();

    // Add to followers list
    targetUser.followers.push(req.user.userId);
    await targetUser.save();

    res.json({
      message: 'User followed',
    });
  })
);

// Unfollow user
router.delete(
  '/:userId/follow',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.user.userId.toString()) {
      return res.status(400).json({ error: 'Cannot unfollow yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findById(req.user.userId);

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    await currentUser.save();

    // Remove from followers list
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.user.userId.toString()
    );
    await targetUser.save();

    res.json({
      message: 'User unfollowed',
    });
  })
);

// Get followers
router.get(
  '/:userId/followers',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      'followers',
      'username avatar bio'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      followers: user.followers,
      count: user.followers.length,
    });
  })
);

// Get following
router.get(
  '/:userId/following',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).populate(
      'following',
      'username avatar bio'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      following: user.following,
      count: user.following.length,
    });
  })
);

// Get activity feed (reviews from followed users)
router.get(
  '/feed/activity',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user.userId);
    const followingIds = [...currentUser.following, req.user.userId]; // Include own reviews

    const reviews = await Review.find({ userId: { $in: followingIds } })
      .populate('userId', 'username avatar')
      .populate('movieId', 'title posterPath')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      userId: { $in: followingIds },
    });

    res.json({
      reviews,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  })
);

export default router;
