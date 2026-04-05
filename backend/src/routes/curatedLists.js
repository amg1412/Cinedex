import express from 'express';
import CuratedList from '../models/CuratedList.js';
import Movie from '../models/Movie.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all curated lists (public)
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const lists = await CuratedList.find({ isPublic: true })
      .populate('movies.movieId')
      .sort({ createdAt: -1 });

    res.json({
      lists,
      count: lists.length,
    });
  })
);

// Get a specific curated list
router.get(
  '/:listId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const list = await CuratedList.findById(req.params.listId)
      .populate('movies.movieId')
      .exec();

    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Increment view count
    list.viewCount += 1;
    await list.save();

    res.json(list);
  })
);

// Get lists by category
router.get(
  '/category/:category',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const lists = await CuratedList.find({
      isPublic: true,
      category: req.params.category,
    })
      .populate('movies.movieId')
      .sort({ viewCount: -1 });

    res.json({
      lists,
      category: req.params.category,
      count: lists.length,
    });
  })
);

// Create new curated list (admin only - for now anyone can create)
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { title, description, category, icon, movieIds } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    const movies = movieIds
      ? movieIds.map((movieId, index) => ({
          movieId,
          position: index,
        }))
      : [];

    const list = await CuratedList.create({
      title,
      description,
      category,
      icon,
      movies,
    });

    await list.populate('movies.movieId');

    res.status(201).json(list);
  })
);

// Add movie to list
router.post(
  '/:listId/movies',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { movieId } = req.body;

    const list = await CuratedList.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Check if movie already in list
    if (list.movies.some((m) => m.movieId.toString() === movieId)) {
      return res.status(400).json({ error: 'Movie already in list' });
    }

    list.movies.push({
      movieId,
      position: list.movies.length,
    });

    await list.save();
    await list.populate('movies.movieId');

    res.json(list);
  })
);

// Remove movie from list
router.delete(
  '/:listId/movies/:movieId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const list = await CuratedList.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    list.movies = list.movies.filter((m) => m.movieId.toString() !== req.params.movieId);
    await list.save();
    await list.populate('movies.movieId');

    res.json(list);
  })
);

export default router;
