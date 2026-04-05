# 🎬 CineHive - Letterboxd Clone

A full-stack social movie database where users can browse, rate, review, and discover movies with friends.

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Firebase Auth
- **Backend:** Node.js, Express, MongoDB, Firebase Admin SDK
- **APIs:** OMDB (movies), TMDB (enrichment), Firebase (auth)
- **Database:** MongoDB Atlas

## ✨ Features

- 🔐 Firebase authentication (email/password + Google OAuth)
- 🎥 Browse trending movies & search
- ⭐ Rate and review movies (1-5 stars)
- 📋 Add movies to watchlist
- 👥 User profiles & follow system
- 🎭 Create custom movie lists
- 🎨 Dark theme UI (CineDark aesthetic)
- 📊 IMDb ratings & runtime display
- 🔄 Movies/TV Shows toggle



## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free)
- Firebase project
- OMDB API key (free at omdbapi.com)
- TMDB API key (free at themoviedb.org)

### Setup

1. **Clone & Install**
```bash
cd backend && npm install && cd ../frontend && npm install
```

2. **Configure Environment**

Backend `.env`:
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL=...
OMDB_API_KEY=your-key
TMDB_API_KEY=your-key
```

Frontend `.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_TMDB_API_KEY=...
```

3. **Run Development Servers**

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

4. **Open Browser**
```
http://localhost:3000
```





## 📝 License

MIT



## 📄 License

MIT License - feel free to use for personal/educational projects

## 🤝 Contributing

Pull requests welcome! Please follow the existing code style.

---

**Happy movie tracking!** 🍿🎬
