const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// ── Public routes ──────────────────────────────────────
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// ── Customer routes (require login) ───────────────────
router.get('/me', authenticate, UserController.getProfile);
router.put('/me', authenticate, UserController.updateProfile);
router.put('/me/password', authenticate, UserController.changePassword);

router.get('/me/addresses', authenticate, UserController.getAddresses);
router.post('/me/addresses', authenticate, UserController.addAddress);
router.put('/me/addresses/:id', authenticate, UserController.updateAddress);
router.delete('/me/addresses/:id', authenticate, UserController.deleteAddress);

// ── Admin routes (require login + ADMIN role) ─────────
router.get('/', authenticate, requireAdmin, UserController.getAllUsers);
router.delete('/:id', authenticate, requireAdmin, UserController.deleteUser);

module.exports = router;
