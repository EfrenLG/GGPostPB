const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET
router.get('/all', userController.getUsersController);
router.get('/profile/:id', userController.getPublicProfileController); // NUEVO: perfil público
router.get('/:id', userController.getUserController);

// POST
router.post('/follow/:id', userController.followUserController); // NUEVO: follow/unfollow

// PUT
router.put('/icon', userController.updateUserIcon);

module.exports = router;