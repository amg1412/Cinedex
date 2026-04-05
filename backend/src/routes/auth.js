import express from 'express';
import User from '../models/User.js';
import List from '../models/List.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Register - Create user after Firebase signup
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { firebaseUid, email, username } = req.body;

    if (!firebaseUid || !email || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({
      $or: [{ firebaseUid }, { email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      firebaseUid,
      email,
      username,
    });

    // Create 3 default lists for the new user
    const defaultLists = ['Watchlist', 'Watched', 'Favorites'];
    for (const listName of defaultLists) {
      await List.create({
        userId: user._id,
        name: listName,
        description: `${listName} - Auto-created default list`,
        isPublic: listName === 'Watched', // Make "Watched" public by default
        movies: [],
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  })
);

// Get current user
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    res.json(user);
  })
);

// Get user profile by ID
router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  })
);

// Update user profile
router.patch(
  '/:userId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (req.user.userId.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { username, bio, avatar } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (bio) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.params.userId, updateData, {
      new: true,
    });

    res.json(user);
  })
);

export default router;
