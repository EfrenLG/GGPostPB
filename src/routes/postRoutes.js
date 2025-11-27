const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

//POST
router.get('/all', postController.all);
router.get('/:id', postController.getPostController);
router.post('/register', postController.register);
router.delete('/delete/:id', postController.delete);
router.put('/edit', postController.uploadPost);
router.put('/view', postController.uploadPostView);
router.put('/like', postController.uploadPostLike);

module.exports = router; 