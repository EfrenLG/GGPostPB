const { getUser, updateUserIcon, getUsers, followUser, getPublicProfile, getFollowList } = require('../services/userServices');
const { getUserValidations, updateUserIconValidations } = require('../validations/userValidations');

const userController = {

    getUserController: [
        ...getUserValidations,
        async (req, response) => {
            try {
                const { id } = req.params;
                const data = await getUser(id);
                response.status(200).json(data);
            } catch (e) {
                console.log('Error al recoger usuario de la BBDD', e);
                response.status(500).json({ error: 'Error al recoger usuario de la BBDD' });
            }
        }
    ],

    updateUserIcon: [
        ...updateUserIconValidations,
        async (req, response) => {
            try {
                const { id, file } = req.body;
                const updatedUser = await updateUserIcon(id, file);
                response.status(200).json({ success: true });
            } catch (e) {
                console.log('Error al actualizar usuario', e);
                response.status(500).json({ error: 'Error al actualizar usuario' });
            }
        }
    ],

    getUsersController: [
        async (req, response) => {
            try {
                const data = await getUsers();
                response.status(200).json(data);
            } catch (e) {
                console.log('Error al recoger los usuarios de la BBDD', e);
                response.status(500).json({ error: 'Error al recoger usuario de la BBDD' });
            }
        }
    ],

    // NUEVO: toggle follow/unfollow
    // Lee el id del usuario autenticado desde req.user (puesto por authMiddleware)
    followUserController: [
        async (req, response) => {
            try {
                const currentUserId = req.user.id;
                const { id: targetUserId } = req.params;

                if (currentUserId === targetUserId) {
                    return response.status(400).json({ error: 'No puedes seguirte a ti mismo' });
                }

                const result = await followUser(currentUserId, targetUserId);
                response.status(200).json({ success: true, action: result.action });

            } catch (e) {
                console.log('Error al seguir usuario', e);
                response.status(500).json({ error: 'Error al seguir usuario' });
            }
        }
    ],

    // NUEVO: perfil público de cualquier usuario
    getPublicProfileController: [
        async (req, response) => {
            try {
                const { id } = req.params;
                const data = await getPublicProfile(id);
                response.status(200).json(data);
            } catch (e) {
                console.log('Error al recoger perfil público', e);
                response.status(500).json({ error: 'Error al recoger perfil' });
            }
        }
    ],

    // NUEVO: lista de seguidores o seguidos con datos completos
    // GET /api/user/follow-list/:id?type=followers|following
    getFollowListController: [
        async (req, response) => {
            try {
                const { id } = req.params;
                const { type } = req.query;

                if (type !== 'followers' && type !== 'following') {
                    return response.status(400).json({ error: "El parámetro 'type' debe ser 'followers' o 'following'" });
                }

                const data = await getFollowList(id, type);
                response.status(200).json(data);

            } catch (e) {
                console.log('Error al recoger lista de seguidores/seguidos', e);
                response.status(500).json({ error: 'Error al recoger la lista' });
            }
        }
    ],
};

module.exports = userController;