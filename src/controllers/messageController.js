const { getMessagesByPost, createMessage, deleteMessage } = require('../services/messageService');

const messageController = {

    // GET /api/comments/:postId
    getCommentsController: [
        async (req, response) => {
            try {
                const { postId } = req.params;
                const messages = await getMessagesByPost(postId);
                response.status(200).json(messages);
            } catch (e) {
                console.log('Error al recoger comentarios', e);
                response.status(500).json({ error: 'Error al recoger comentarios' });
            }
        }
    ],

    // POST /api/comments
    createCommentController: [
        async (req, response) => {
            try {
                const userId = req.user.id;
                const username = req.user.username;
                const { postId, message } = req.body;

                if (!postId) {
                    return response.status(400).json({ error: 'El postId es requerido' });
                }
                if (!message || !message.trim()) {
                    return response.status(400).json({ error: 'El comentario no puede estar vacío' });
                }

                const newComment = await createMessage(postId, userId, username, message);
                response.status(201).json(newComment);

            } catch (e) {
                console.log('Error al crear comentario', e);
                response.status(500).json({ error: e.message || 'Error al crear comentario' });
            }
        }
    ],

    // DELETE /api/comments/:id
    deleteCommentController: [
        async (req, response) => {
            try {
                const userId = req.user.id;
                const { id } = req.params;

                await deleteMessage(id, userId);
                response.status(200).json({ success: true });

            } catch (e) {
                console.log('Error al borrar comentario', e);
                response.status(e.status || 500).json({ error: e.message || 'Error al borrar comentario' });
            }
        }
    ],
};

module.exports = messageController;