import mongoose from 'mongoose';

const curatedListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    movies: [
      {
        movieId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Movie',
          required: true,
        },
        position: Number, // Order in the list
      },
    ],
    category: {
      type: String,
      enum: ['trending', 'top-rated', 'new-releases', 'genre-specific', 'themed', 'staff-picks'],
      required: true,
    },
    icon: {
      type: String,
      default: '🎬',
    },
    coverImage: {
      type: String,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('CuratedList', curatedListSchema);
