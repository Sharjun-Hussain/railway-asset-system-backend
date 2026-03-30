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


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // IMPORTANT: Always send a success response, even if user isn't found.
    // This prevents attackers from checking which emails are registered.
    if (!user) {
      return res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    }

    // 1. Generate a random token
    // We create a random token, then hash it before saving to the DB.
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash token and set to user model
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // 3. Set token expiration (e.g., 10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    // 4. Create reset URL
    // The 'resetToken' (unhashed) is sent to the user.
    const resetUrl = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    
    // 5. Send the email (this is a placeholder, you'll need a mail service)
    try {
      // --- TODO: Implement your email sending logic here ---
      // Example: await sendEmail(user.email, 'Password Reset', `Click here to reset: ${resetUrl}`);
      console.log('--- PASSWORD RESET ---');
      console.log(`User: ${user.email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('---------------------');
      // ----------------------------------------------------

      res.status(200).json({ message: 'If an account with this email exists, a password reset link has been sent.' });
    } catch (err) {
      console.error('Email sending error:', err);
      // Clear token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Error sending reset email.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ---------------------------------------------
// --- ADD NEW resetPassword CONTROLLER ---
// ---------------------------------------------
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resettoken } = req.params;

  try {
    // 1. Get the hashed token from the URL parameter
    const hashedToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    // 2. Find user by the hashed token AND check if it's expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() } // Check if expiry is in the future
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // 3. Set the new password
    // The 'pre-save' hook on your User model will automatically hash this.
    user.password = password;

    // 4. Invalidate the token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 5. (Optional but recommended) Log the user in
    // Create new tokens
    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Set the cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Send response
    res.status(200).json({
      message: 'Password reset successful. You are now logged in.',
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      accessToken: accessToken,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};