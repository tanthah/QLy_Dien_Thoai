const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// All order routes require authentication
router.use(authenticate);

// ── Customer routes ───────────────────────────────────────
router.post('/', OrderController.placeOrder);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/my-addresses', OrderController.getMyAddresses);

// ── Admin routes ──────────────────────────────────────────
router.get('/', requireAdmin, OrderController.getAllOrders);
router.put('/:id/status', requireAdmin, OrderController.updateOrderStatus);

module.exports = router;

