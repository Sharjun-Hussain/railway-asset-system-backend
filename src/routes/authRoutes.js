import express from 'express';
import { registerUser, loginUser, getMe, logoutUser, refreshToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); 
router.post('/logout', logoutUser);   // <-- Add
router.get('/refresh', refreshToken); // <-- Add

export default router;