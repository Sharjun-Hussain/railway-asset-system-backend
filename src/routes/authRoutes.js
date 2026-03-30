import express from 'express';
import { registerUser, loginUser, getMe, logoutUser, refreshToken, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); 
router.post('/logout', logoutUser);   
router.get('/refresh', refreshToken); 
router.post('/forgot-password', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;