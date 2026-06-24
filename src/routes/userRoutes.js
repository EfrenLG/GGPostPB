const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET
router.get('/all', userController.getUsersController);
router.get('/profile/:id', userController.getPublicProfileController); // NUEVO: perfil público
router.get('/follow-list/:id', userController.getFollowListController); // NUEVO: lista seguidores/seguidos
router.get('/follow-requests', userController.getFollowRequestsController); // NUEVO: solicitudes pendientes
router.get('/blocked', userController.getBlockedUsersController); // NUEVO: lista de bloqueados
router.get('/:id', userController.getUserController);

// POST
router.post('/follow/:id', userController.followUserController); // NUEVO: follow/unfollow/request
router.post('/follow-requests/:id/accept', userController.acceptFollowRequestController); // NUEVO
router.post('/follow-requests/:id/reject', userController.rejectFollowRequestController); // NUEVO
router.post('/block/:id', userController.blockUserController); // NUEVO: bloquear usuario
router.post('/unblock/:id', userController.unblockUserController); // NUEVO: desbloquear usuario

// DELETE
router.delete('/followers/:id', userController.removeFollowerController); // NUEVO: eliminar seguidor

// PUT
router.put('/icon', userController.updateUserIcon);
router.put('/privacy', userController.togglePrivateController); // NUEVO: toggle cuenta privada
router.put('/bio', userController.updateBioController); // NUEVO: actualizar biografía

module.exports = router;