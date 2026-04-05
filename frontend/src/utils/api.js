import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('firebaseToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const movieAPI = {
  getTrending: (page = 1) => apiClient.get('/movies/trending', { params: { page } }),
  search: (query, page = 1, filters = {}) =>
    apiClient.get('/movies/search', {
      params: { q: query, page, ...filters },
    }),
  getDetails: (movieId) => apiClient.get(`/movies/${movieId}`),
  getByGenre: (genreId, page = 1) =>
    apiClient.get(`/movies/genre/${genreId}`, { params: { page } }),
  getGenres: () => apiClient.get('/movies/genres/all'),
  getSimilar: (movieId) => apiClient.get(`/movies/${movieId}/similar`),
  getRecommendations: (movieId) => apiClient.get(`/movies/${movieId}/recommendations`),
  getCast: (movieId) => apiClient.get(`/movies/${movieId}/cast`),
};

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  getProfile: (userId) => apiClient.get(`/auth/${userId}`),
  updateProfile: (userId, data) => apiClient.patch(`/auth/${userId}`, data),
};

export const reviewAPI = {
  create: (movieId, data) => apiClient.post(`/reviews/${movieId}`, data),
  getForMovie: (movieId, page = 1, limit = 10) =>
    apiClient.get(`/reviews/movie/${movieId}`, { params: { page, limit } }),
  getUserReviews: (userId, page = 1, limit = 10) =>
    apiClient.get(`/reviews/user/${userId}`, { params: { page, limit } }),
  like: (reviewId) => apiClient.post(`/reviews/${reviewId}/like`),
  delete: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
};

export const watchlistAPI = {
  add: (movieId) => apiClient.post('/watchlist', { movieId }),
  get: (page = 1, limit = 10) => apiClient.get('/watchlist', { params: { page, limit } }),
  remove: (movieId) => apiClient.delete(`/watchlist/${movieId}`),
  check: (movieId) => apiClient.get(`/watchlist/check/${movieId}`),
};

export const listAPI = {
  create: (data) => apiClient.post('/lists', data),
  getUserLists: (userId, page = 1, limit = 10) =>
    apiClient.get(`/lists/user/${userId}`, { params: { page, limit } }),
  getDetail: (listId) => apiClient.get(`/lists/${listId}`),
  addMovie: (listId, movieId) => apiClient.post(`/lists/${listId}/movies`, { movieId }),
  removeMovie: (listId, movieId) =>
    apiClient.delete(`/lists/${listId}/movies/${movieId}`),
  delete: (listId) => apiClient.delete(`/lists/${listId}`),
  like: (listId) => apiClient.post(`/lists/${listId}/like`),
};

export const socialAPI = {
  follow: (userId) => apiClient.post(`/users/${userId}/follow`),
  unfollow: (userId) => apiClient.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => apiClient.get(`/users/${userId}/followers`),
  getFollowing: (userId) => apiClient.get(`/users/${userId}/following`),
  getActivityFeed: (page = 1, limit = 10) =>
    apiClient.get('/users/feed/activity', { params: { page, limit } }),
};

export const curatedListAPI = {
  getAll: (page = 1, limit = 20) => apiClient.get('/curated-lists', { params: { page, limit } }),
  getByCategory: (category, page = 1, limit = 20) =>
    apiClient.get(`/curated-lists/category/${category}`, { params: { page, limit } }),
  getDetail: (listId) => apiClient.get(`/curated-lists/${listId}`),
  create: (data) => apiClient.post('/curated-lists', data),
  addMovie: (listId, movieId) =>
    apiClient.post(`/curated-lists/${listId}/movies`, { movieId }),
  removeMovie: (listId, movieId) =>
    apiClient.delete(`/curated-lists/${listId}/movies/${movieId}`),
};

export default apiClient;
