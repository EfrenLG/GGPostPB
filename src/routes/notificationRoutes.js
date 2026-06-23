const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET
router.get('/', notificationController.getNotificationsController);
router.get('/unread-count', notificationController.getUnreadCountController);

// PUT
router.put('/read-all', notificationController.markAllAsReadController);
router.put('/:id/read', notificationController.markAsReadController);

module.exports = router;