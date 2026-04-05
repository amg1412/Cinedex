import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { authAPI } from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseToken', token);

          // Fetch user profile from backend
          try {
            const response = await authAPI.getMe();
            setUser(response.data);
          } catch (err) {
            // User not yet created in DB, they'll be created on first interaction
            setUser(firebaseUser);
          }
        } else {
          localStorage.removeItem('firebaseToken');
          setUser(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, username) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);

      // Register in backend
      const response = await authAPI.register({
        firebaseUid: userCredential.user.uid,
        email,
        username,
      });

      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);

      // Fetch user profile from backend
      const response = await authAPI.getMe();
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);

      // Try to fetch user profile, if not exists, backend will create on first interaction
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (err) {
        setUser(userCredential.user);
      }

      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      localStorage.removeItem('firebaseToken');
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  };
};
