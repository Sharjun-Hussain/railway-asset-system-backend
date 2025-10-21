import jwt from 'jsonwebtoken';
import User from '../models/user.js'
import Role from '../models/role.js'
import Permission from '../models/permission.js';

// Middleware to verify the JWT
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check for a specific permission
export const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // req.user is attached by the 'protect' middleware
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Find the user's roles and populate the permissions for each role
      const user = await User.findById(req.user._id).populate({
        path: 'roles',
        populate: {
          path: 'permissions',
          model: 'Permission'
        }
      });

      // Check if any of the user's roles contain the required permission
      let hasPermission = false;
      for (const role of user.roles) {
        for (const perm of role.permissions) {
          if (perm.name === permissionName) {
            hasPermission = true;
            break;
          }
        }
        if (hasPermission) break;
      }

      if (hasPermission) {
        next();
      } else {
        res.status(403).json({ message: `Forbidden: You do not have the '${permissionName}' permission.` });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
};