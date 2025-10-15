const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

//GET
router.get('/:id', userController.getUserController);
router.get('/all', userController.getUsersController);

// PUT
router.put('/icon', userController.updateUserIcon);

module.exports = router; 