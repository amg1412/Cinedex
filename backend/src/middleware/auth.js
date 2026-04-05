import { verifyFirebaseToken } from '../utils/firebase.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await verifyFirebaseToken(token);
    const firebaseUid = decodedToken.uid;

    // Check if user exists in DB, if not create them
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await User.create({
        firebaseUid,
        email: decodedToken.email,
        username: decodedToken.email.split('@')[0],
      });
    }

    req.user = {
      firebaseUid,
      userId: user._id,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (token) {
      const decodedToken = await verifyFirebaseToken(token);
      const firebaseUid = decodedToken.uid;

      const user = await User.findOne({ firebaseUid });

      if (user) {
        req.user = {
          firebaseUid,
          userId: user._id,
          email: decodedToken.email,
        };
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};
