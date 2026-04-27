import express from 'express';
import { registerUser, loginUser, getMe, logoutUser, refreshToken, forgotPassword, resetPassword, acceptInvitation } from '../controllers/authController.js';
import { protect } from '../middlewares/authmiddleware.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); 
router.post('/logout', logoutUser);   
router.get('/refresh', refreshToken); 
router.post('/forgot-password', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/accept-invitation/:token', acceptInvitation);

router.post('/test-email', async (req, res) => {
  const { email } = req.body;
  try {
    await sendEmail({
      email,
      subject: 'SL Railway Portal - SMTP Test',
      message: 'If you are reading this, your Nodemailer setup is working correctly!',
      html: '<h1>SMTP Test Successful</h1><p>Your SL Railway Portal email configuration is active.</p>'
    });
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Email Test Failed:', error);
    res.status(500).json({ success: false, message: 'Email sending failed', error: error.message });
  }
});

export default router;