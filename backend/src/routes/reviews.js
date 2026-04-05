import express from 'express';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import { authMiddleware, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Create or update review
router.post(
  '/:movieId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    const { rating, reviewText } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    let review = await Review.findOne({
      userId: req.user.userId,
      movieId,
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.reviewText = reviewText || '';
      await review.save();
      res.json({ message: 'Review updated', review });
    } else {
      // Create new review
      review = await Review.create({
        userId: req.user.userId,
        movieId,
        rating,
        reviewText: reviewText || '',
      });
      await review.populate('userId', 'username avatar');
      res.status(201).json({ message: 'Review created', review });
    }
  })
);

// Get reviews for a movie
router.get(
  '/movie/:movieId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ movieId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments({ movieId });

    res.json({
      reviews,
      total: totalCount,
      page: parseInt(page),
      pages: Math.ceil(totalCount / limit),
    });
  })
);

// Get user's reviews
router.get(
  '/user/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .populate('movieId', 'title posterPath')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Review.countDocuments({ userId });

    res.json({
      reviews,
      total: totalCount,
      page: parseInt(page),
      pages: Math.ceil(totalCount / limit),
    });
  })
);

// Like/unlike a review
router.post(
  '/:reviewId/like',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const hasLiked = review.likes.includes(req.user.userId);

    if (hasLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== req.user.userId.toString());
      review.likeCount -= 1;
    } else {
      review.likes.push(req.user.userId);
      review.likeCount += 1;
    }

    await review.save();

    res.json({
      message: hasLiked ? 'Like removed' : 'Like added',
      review,
    });
  })
);

// Delete a review
router.delete(
  '/:reviewId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Review.deleteOne({ _id: reviewId });

    res.json({ message: 'Review deleted' });
  })
);

export default router;
