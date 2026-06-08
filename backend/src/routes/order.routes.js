const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All order routes require authentication
router.use(authenticate);

router.post('/', OrderController.placeOrder);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/my-addresses', OrderController.getMyAddresses);

module.exports = router;
