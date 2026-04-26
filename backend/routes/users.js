const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const userCtrl = require('../controllers/userController');
const router = express.Router();

router.get('/', protect, authorize('admin'), userCtrl.list);

module.exports = router;
