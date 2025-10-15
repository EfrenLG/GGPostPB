// Importación de servicios
const { getUser, updateUserIcon, getUsers } = require('../services/userServices');
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
                const { id, file, } = req.body;

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
    ]
};

module.exports = userController;
