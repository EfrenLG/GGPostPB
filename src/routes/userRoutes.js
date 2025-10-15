const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//GET
router.get('/all', userController.getUsersController);
router.get('/:id', userController.getUserController);

// PUT
router.put('/icon', userController.updateUserIcon);

module.exports = router; 