import User from '../models/user.js';
import Role from '../models/role.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { logActivity } from './auditController.js';

// --- Helper Functions ---
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '1d',
  });
};


const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', {
    expiresIn: '7d',
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate({
      path: 'roles',
      populate: { path: 'permissions' }
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        roles: user.roles,
        stationId: user.stationId,
        divisionId: user.divisionId,
        warehouseIds: user.warehouseIds,
        accessToken: accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newAccessToken = generateAccessToken(user._id);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const registerUser = async (req, res) => {
  const { full_name, email, password, roleIds, stationId, divisionId, warehouseIds } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      email,
      password_hash: hashedPassword,
      roles: roleIds,
      stationId,
      divisionId,
      warehouseIds
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        roles: user.roles,
        token: generateAccessToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${user.email}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px;">
        <h2 style="color: #42369E; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #4a5568; line-height: 1.6;">You are receiving this email because you requested a password reset for your SL Railway Portal account.</p>
        <p style="color: #4a5568; line-height: 1.6;">Click the button below to reset your password. This link is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #42369E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #718096; font-size: 12px; line-height: 1.6;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #a0aec0; font-size: 11px;">&copy; 2026 Sri Lankan Railway Department</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request - SL Railway Portal',
        message,
        html,
      });

      res.status(200).json({
        success: true,
        message: 'Password reset link sent to email',
        // Still return resetToken in development for easy testing
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password_hash')
      .populate('roles')
      .populate('divisionId', 'division_name')
      .populate('stationId', 'station_name')
      .populate('warehouseIds', 'warehouse_name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { full_name, email, roles, stationId, divisionId, warehouseIds, isActive } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.full_name = full_name || user.full_name;
    user.email = email || user.email;
    user.roles = roles || user.roles;
    user.stationId = stationId !== undefined ? stationId : user.stationId;
    user.divisionId = divisionId !== undefined ? divisionId : user.divisionId;
    user.warehouseIds = warehouseIds || user.warehouseIds;
    user.isActive = isActive !== undefined ? isActive : user.isActive;

    await user.save();
    
    // Log Activity
    await logActivity(req, 'USER', 'UPDATE', { 
      targetUser: user.email,
      updates: Object.keys(req.body)
    }, user._id);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const inviteUser = async (req, res) => {
  const { full_name, email, roleIds, stationId, divisionId, warehouseIds } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Generate invitation token
    const invitationToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');
    const invitationExpire = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create user with random password and pending status
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      full_name,
      email,
      password_hash,
      roles: roleIds,
      stationId,
      divisionId,
      warehouseIds,
      isActive: false,
      isPending: true,
      invitationToken: hashedToken,
      invitationExpire: invitationExpire
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}&email=${email}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #42369E; margin-bottom: 20px;">Welcome to SL Railway Portal</h2>
        <p style="color: #4a5568; line-height: 1.6;">Hello ${full_name},</p>
        <p style="color: #4a5568; line-height: 1.6;">You have been invited to join the Sri Lankan Railway Department's Inventory & Asset Management System.</p>
        <p style="color: #4a5568; line-height: 1.6;">Click the button below to accept the invitation and set up your password.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #42369E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="color: #718096; font-size: 12px; line-height: 1.6;">This link will expire in 7 days.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #a0aec0; font-size: 11px;">&copy; 2026 Sri Lankan Railway Department</p>
      </div>
    `;

    try {
      await sendEmail({
        email,
        subject: 'You are invited to SL Railway Portal',
        message: `Welcome to SLR. Accept your invitation here: ${inviteUrl}`,
        html,
      });

      // Log Activity
      await logActivity(req, 'USER', 'INVITE', { 
        invitedEmail: email,
        assignedRoles: roleIds 
      }, user._id);

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        // Still return invitationToken in development
        invitationToken: process.env.NODE_ENV === 'development' ? invitationToken : undefined
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptInvitation = async (req, res) => {
  const { password } = req.body;
  const invitationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  try {
    const user = await User.findOne({
      invitationToken,
      invitationExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired invitation link' });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    user.isActive = true;
    user.isPending = false;
    user.invitationToken = undefined;
    user.invitationExpire = undefined;

    await user.save();
    res.status(200).json({ message: 'Account activated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};