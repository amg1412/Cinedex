# 🎬 Cinedex - Letterboxd Clone

A full-stack movie database application where users can browse movies, rate and review them, maintain watchlists, and connect with other movie enthusiasts.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **Firebase SDK** - Authentication

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database
- **Firebase Admin SDK** - Token verification
- **OMDB API** - Movie data (Region-independent, works in India!)

## ✨ Features

### MVP (Core)
- ✅ **Authentication** - Email/password signup and login with Google OAuth
- ✅ **Movie Browsing** - Trending, search, and detailed views
- ✅ **Ratings & Reviews** - 1-5 star ratings with text reviews
- ✅ **Watchlist** - Save movies to personal watchlist
- ✅ **User Profiles** - View user info, reviews, and watchlist
- ✅ **Search** - Full-text movie search with filtering

### Extended Features
- ✅ **Social** - Follow users and see their activity
- ✅ **Custom Lists** - Create and manage movie lists
- ✅ **Advanced Filters** - Genre, year, rating filters
- ✅ **Activity Feed** - See reviews from followed users

## 📁 Project Structure

```
cinedex/
├── frontend/                 # React app
│   ├── src/
│   │   ├── pages/           # Page components (Home, Search, etc)
│   │   ├── components/      # Reusable components (MovieCard, Navbar, etc)
│   │   ├── hooks/           # Custom hooks (useAuth, useAsync)
│   │   ├── utils/           # Utilities (firebase.js, api.js)
│   │   ├── layouts/         # Layout components
│   │   ├── App.jsx          # Main app with routing
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── backend/                  # Node.js + Express app
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Auth and error handling
│   │   ├── utils/           # Firebase admin, OMDB client
│   │   ├── config/          # Database connection
│   │   └── server.js        # Express server
│   └── package.json
│
├── shared/                   # Shared types/constants (optional)
└── .env.example files        # Environment templates
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- MongoDB Atlas account (free tier)
- Firebase project
- OMDB API key (works in India!)

### Quick Start (Development)

#### 1. Clone and Install Dependencies

```bash
cd /home/amg/projects/cinedex

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2. Setup Environment Variables

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinedex
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
OMDB_API_KEY=your-omdb-api-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local`:
```
VITE_REACT_APP_FIREBASE_API_KEY=your-api-key
VITE_REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_REACT_APP_FIREBASE_PROJECT_ID=your-project-id
VITE_REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_REACT_APP_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:5000/api
```

**✅ OMDB works in India and globally!** No region restrictions like some other movie APIs.

#### 3. Setup Accounts

**MongoDB Atlas**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string and add to `.env`

**Firebase**
1. Create project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Enable Google OAuth
4. Get credentials from Project Settings → Service Accounts

**OMDB**
1. Register at http://www.omdbapi.com/apikey.aspx
2. Get your free API key (1,000 requests/day)
3. Add to `.env` as `OMDB_API_KEY`

#### 4. Start Servers

```bash
# Terminal 1: Backend (from cinedex/backend)
npm run dev

# Terminal 2: Frontend (from cinedex/frontend)
npm run dev
```

Backend: http://localhost:5000  
Frontend: http://localhost:3000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/:userId` - Get user profile
- `PATCH /api/auth/:userId` - Update profile

### Movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/search?q=query` - Search movies
- `GET /api/movies/:movieId` - Get movie details
- `GET /api/movies/genre/:genreId` - Get movies by genre

### Reviews
- `POST /api/reviews/:movieId` - Create/update review
- `GET /api/reviews/movie/:movieId` - Get movie reviews
- `GET /api/reviews/user/:userId` - Get user reviews
- `POST /api/reviews/:reviewId/like` - Like review
- `DELETE /api/reviews/:reviewId` - Delete review

### Watchlist
- `POST /api/watchlist` - Add to watchlist
- `GET /api/watchlist` - Get watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist
- `GET /api/watchlist/check/:movieId` - Check if in watchlist

### Lists
- `POST /api/lists` - Create list
- `GET /api/lists/user/:userId` - Get user lists
- `GET /api/lists/:listId` - Get list details
- `POST /api/lists/:listId/movies` - Add movie to list
- `DELETE /api/lists/:listId/movies/:movieId` - Remove from list

### Social
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user
- `GET /api/users/:userId/followers` - Get followers
- `GET /api/users/:userId/following` - Get following
- `GET /api/users/feed/activity` - Get activity feed

## 📝 Environment Variables

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `OMDB_API_KEY` | OMDB API key | `abc123...` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `project-id` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `-----BEGIN PRIVATE KEY-----...` |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | `firebase-...@appspot.gserviceaccount.com` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_REACT_APP_FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `VITE_REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID | `project-id` |
| `VITE_REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage | `project.appspot.com` |
| `VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | `123456789` |
| `VITE_REACT_APP_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:...` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000/api` |

## 🔗 External APIs

### OMDB API
- Base URL: `http://www.omdbapi.com`
- Free tier: 1,000 requests/day
- Data: Movies, details, ratings, images
- **Region-independent** - Works in India and globally! 🌍
- Register: http://www.omdbapi.com/apikey.aspx

## 📦 Package Dependencies

### Frontend
- react, react-dom, react-router-dom
- firebase (auth SDK)
- axios  (HTTP client)
- tailwindcss (CSS framework)

### Backend
- express (web framework)
- mongoose (MongoDB ODM)
- firebase-admin (Firebase SDK)
- axios (HTTP client)
- cors (CORS middleware)
- helmet (security headers)
- morgan (request logging)

## 🚢 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Auto-deploy on push

### Backend → Railways/Render
1. Create account at https://railway.app or https://render.com
2. Connect GitHub repo
3. Set environment variables
4. Deploy

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 Additional Pages to Build

- [ ] Profile page with user stats
- [ ] Lists management page
- [ ] Advanced search with filters
- [ ] Social feed/following
- [ ] Settings/preferences page
- [ ] Notifications (optional)
- [ ] Admin dashboard (optional)

## 🐛 Troubleshooting

**MongoDB connection fails**
- Ensure IP is whitelisted in MongoDB Atlas
- Check connection string format
- Verify credentials in `.env`

**Firebase auth not working**
- Verify Firebase credentials in `.env`
- Check Firebase project has Email/Password enabled
- Ensure CORS settings allow localhost

**OMDB API errors**
- Verify API key is valid
- Check rate limits (1k/day free tier)
- Works in India and globally!
- Review OMDB documentation at http://www.omdbapi.com

## 📄 License

MIT License - feel free to use for personal/educational projects

## 🤝 Contributing

Pull requests welcome! Please follow the existing code style.

---

**Happy movie tracking!** 🍿🎬
