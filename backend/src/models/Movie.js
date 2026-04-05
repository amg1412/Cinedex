import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tmdbMovieId: {
      // Numeric TMDB ID for enrichment queries
      type: Number,
      sparse: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      default: '',
    },
    releaseDate: {
      type: Date,
    },
    posterPath: {
      type: String,
      default: '',
    },
    backdropPath: {
      type: String,
      default: '',
    },
    genres: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
    runtime: {
      // Movie duration in minutes
      type: Number,
      default: 0,
    },
    cast: [
      {
        id: String,
        name: String,
        character: String,
      },
    ],
    enrichedCast: [
      {
        id: Number,
        name: String,
        character: String,
        profilePath: String,
        profileUrl: String,
      },
    ],
    similarMovies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    recommendations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
    ],
    lastEnrichedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Movie', movieSchema);
