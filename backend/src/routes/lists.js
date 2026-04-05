import express from 'express';
import List from '../models/List.js';
import Movie from '../models/Movie.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Create list
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { title, description, isPublic } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title required' });
    }

    const list = await List.create({
      userId: req.user.userId,
      title,
      description: description || '',
      isPublic: isPublic || false,
    });

    res.status(201).json({
      message: 'List created',
      list,
    });
  })
);

// Get all lists for a user
router.get(
  '/user/:userId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    let query = { userId };
    // If viewing someone else's lists, only show public ones
    if (!req.user || req.user.userId.toString() !== userId) {
      query.isPublic = true;
    }

    const lists = await List.find(query)
      .populate('userId', 'username avatar')
      .populate('movies')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await List.countDocuments(query);

    res.json({
      lists,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  })
);

// Get single list
router.get(
  '/:listId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { listId } = req.params;

    const list = await List.findById(listId)
      .populate('userId', 'username avatar')
      .populate('movies')
      .populate('likes', 'username avatar');

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check privacy
    if (!list.isPublic && (!req.user || list.userId._id.toString() !== req.user.userId.toString())) {
      return res.status(403).json({ error: 'List is private' });
    }

    res.json(list);
  })
);

// Add movie to list
router.post(
  '/:listId/movies',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { listId } = req.params;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID required' });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    if (list.movies.includes(movieId)) {
      return res.status(400).json({ error: 'Movie already in list' });
    }

    list.movies.push(movieId);
    await list.save();
    await list.populate('movies');

    res.json({
      message: 'Movie added to list',
      list,
    });
  })
);

// Remove movie from list
router.delete(
  '/:listId/movies/:movieId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { listId, movieId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    list.movies = list.movies.filter((id) => id.toString() !== movieId);
    await list.save();

    res.json({
      message: 'Movie removed from list',
      list,
    });
  })
);

// Delete list
router.delete(
  '/:listId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { listId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    if (list.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await List.deleteOne({ _id: listId });

    res.json({ message: 'List deleted' });
  })
);

// Like/unlike list
router.post(
  '/:listId/like',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { listId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const hasLiked = list.likes.includes(req.user.userId);

    if (hasLiked) {
      list.likes = list.likes.filter((id) => id.toString() !== req.user.userId.toString());
    } else {
      list.likes.push(req.user.userId);
    }

    await list.save();

    res.json({
      message: hasLiked ? 'Like removed' : 'Like added',
      list,
    });
  })
);

export default router;
