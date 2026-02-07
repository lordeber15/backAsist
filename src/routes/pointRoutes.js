const express = require('express');
const router = express.Router();
const pointController = require('../controllers/pointController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, pointController.setPoint);
router.get('/', authMiddleware, pointController.getPoint);

module.exports = router;
