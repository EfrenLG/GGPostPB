const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// GET
router.get('/:postId', messageController.getCommentsController);

// POST
router.post('/', messageController.createCommentController);

// DELETE
router.delete('/:id', messageController.deleteCommentController);

module.exports = router;