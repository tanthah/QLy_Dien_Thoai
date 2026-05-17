const express = require('express');
const router = express.Router();
const PhoneController = require('../controllers/phone.controller');

// CRUD endpoints for Phone
router.get('/', PhoneController.getAll);
router.get('/:id', PhoneController.getById);
router.post('/', PhoneController.create);
router.put('/:id', PhoneController.update);
router.delete('/:id', PhoneController.delete);

module.exports = router;
