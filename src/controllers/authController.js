import User from '../models/user.js';
import Role from '../models/role.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- Helper Functions ---
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION,
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION,
  });
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      
      // 1. Create both tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // 2. Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // Prevents client-side JS from accessing
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        sameSite: 'strict', // Mitigates CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matches token)
      });

      // 3. Send access token and user data in response body
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        accessToken: accessToken, // <-- Send the short-lived access token
      });

    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW refreshToken Controller ---
export const refreshToken = async (req, res) => {
  // 1. Get refresh token from the cookie
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Access denied. No refresh token provided.' });
  }

  try {
    // 2. Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Check user (optional but good)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    // 4. Generate a new access token
    const newAccessToken = generateAccessToken(user._id);

    res.json({
      accessToken: newAccessToken
    });

  } catch (error) {
    // If token is expired or invalid
    return res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
  }
};

// --- NEW logoutUser Controller ---
export const logoutUser = (req, res) => {
  // To log out, we just clear the cookie.
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Set expiry to a past date
  });

  res.status(200).json({ message: 'Logged out successfully' });
};
// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, roleName } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Find the role to assign
    const defaultRole = await Role.findOne({ name: roleName || 'Warehouse Staff' }); // Assign a default role
    if (!defaultRole) {
      return res.status(400).json({ message: 'Default role not found' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roles: [defaultRole._id],
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  // req.user is available from 'protect' middleware
  res.status(200).json(req.user);
};