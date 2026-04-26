const express  = require('express');
const userCtrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',              protect, authorize('admin'), userCtrl.list);
router.delete('/:id',        protect, authorize('admin'), userCtrl.remove);
router.put('/:id/block',     protect, authorize('admin'), userCtrl.toggleBlock);
router.get('/entreprise/me', protect, authorize('entreprise'), userCtrl.entrepriseMe);
router.get('/entreprises',   protect, authorize('admin'), userCtrl.entreprises);

module.exports = router;
