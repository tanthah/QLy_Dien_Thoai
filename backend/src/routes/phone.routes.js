const express = require('express');
const router = express.Router();
const PhoneController = require('../controllers/phone.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth.middleware');

// CRUD endpoints for Phone
router.get('/', PhoneController.getAll);
router.get('/:id', PhoneController.getById);
router.post('/', authenticate, requireAdmin, PhoneController.create);
router.put('/:id', authenticate, requireAdmin, PhoneController.update);
router.delete('/:id', authenticate, requireAdmin, PhoneController.delete);

module.exports = router;
