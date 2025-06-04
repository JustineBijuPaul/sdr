import express from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
// Replace bcrypt with crypto for a pure JavaScript solution
import * as crypto from 'crypto';
import { storage } from './storage';

// Define a simple user interface for authentication
interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

const router = express.Router();

// JavaScript implementation of password hashing using crypto
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    
    // Use PBKDF2 for hashing (more widely available than bcrypt)
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      // Format: iterations:salt:hash
      resolve(`10000:${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      // Extract parts from stored hash
      const [iterations, salt, storedHash] = hashedPassword.split(':');
      const iterCount = parseInt(iterations);
      
      // Hash the input password with the same salt and iterations
      crypto.pbkdf2(plainPassword, salt, iterCount, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        // Compare the computed hash with the stored hash
        resolve(derivedKey.toString('hex') === storedHash);
      });
    } catch (err) {
      // If the stored hash isn't in the expected format, comparison fails
      resolve(false);
    }
  });
}

// Set up local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username: string, password: string, done: any) => {
      try {
        // Find user by username
        const user = await storage.findUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        // Verify password using the custom comparePassword function instead of bcrypt
        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        // Return user without password
        const userWithoutPassword: AuthUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };

        return done(null, userWithoutPassword);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Passport session setup
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done: (err: any, user?: any) => void) => {
  try {
    const user = await storage.findUserById(id);
    if (user) {
      const userWithoutPassword: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      return done(null, userWithoutPassword);
    } else {
      return done(null, null);
    }
  } catch (error) {
    return done(error);
  }
});

// Check if user is authenticated and has super admin role
function ensureSuperAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: "Not authorized. Only super admins can create new users." });
  }
  
  next();
}

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'Authentication failed' });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json(user);
    });
  })(req, res, next);
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Check if user is authenticated
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;
