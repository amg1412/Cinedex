import express from 'express';
import Watchlist from '../models/Watchlist.js';
import Movie from '../models/Movie.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Add movie to watchlist
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ error: 'Movie ID required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const exists = await Watchlist.findOne({
      userId: req.user.userId,
      movieId,
    });

    if (exists) {
      return res.status(400).json({ error: 'Movie already in watchlist' });
    }

    const entry = await Watchlist.create({
      userId: req.user.userId,
      movieId,
    });

    await entry.populate('movieId');

    res.status(201).json({
      message: 'Movie added to watchlist',
      entry,
    });
  })
);

// Get user's watchlist
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const watchlist = await Watchlist.find({ userId: req.user.userId })
      .populate('movieId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Watchlist.countDocuments({ userId: req.user.userId });

    res.json({
      movies: watchlist.map((w) => w.movieId),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  })
);

// Remove movie from watchlist
router.delete(
  '/:movieId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { movieId } = req.params;

    const result = await Watchlist.deleteOne({
      userId: req.user.userId,
      movieId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Movie not in watchlist' });
    }

    res.json({ message: 'Movie removed from watchlist' });
  })
);

// Check if movie is in watchlist
router.get(
  '/check/:movieId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { movieId } = req.params;

    const inWatchlist = await Watchlist.findOne({
      userId: req.user.userId,
      movieId,
    });

    res.json({ inWatchlist: !!inWatchlist });
  })
);

export default router;
