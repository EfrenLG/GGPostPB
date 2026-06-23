const Message = require('../models/messageModel');
const Post = require('../models/postModel');

// Obtener todos los comentarios de un post, ordenados del más antiguo al más nuevo
async function getMessagesByPost(postId) {
    try {
        const messages = await Message.find({ postId }).sort({ timestamp: 1 });
        return messages;
    } catch (err) {
        console.error('Error al obtener comentarios:', err);
        throw err;
    }
}

// Crear un nuevo comentario
async function createMessage(postId, userId, username, message) {
    try {
        if (!message || !message.trim()) {
            throw new Error('El comentario no puede estar vacío');
        }

        const newMessage = new Message({
            postId,
            userId,
            username,
            message: message.trim(),
            timestamp: new Date()
        });

        await newMessage.save();
        return newMessage;
    } catch (err) {
        console.error('Error al crear comentario:', err);
        throw err;
    }
}

// Borrar un comentario — solo el autor del comentario o el dueño del post pueden hacerlo
async function deleteMessage(messageId, requesterId) {
    try {
        const comment = await Message.findById(messageId);
        if (!comment) {
            throw new Error('Comentario no encontrado');
        }

        const post = await Post.findById(comment.postId);

        const isCommentOwner = String(comment.userId) === String(requesterId);
        const isPostOwner = post && String(post.idUser) === String(requesterId);

        if (!isCommentOwner && !isPostOwner) {
            const err = new Error('No tienes permiso para borrar este comentario');
            err.status = 403;
            throw err;
        }

        await Message.findByIdAndDelete(messageId);
        return { deleted: true };
    } catch (err) {
        console.error('Error al borrar comentario:', err);
        throw err;
    }
}

module.exports = { getMessagesByPost, createMessage, deleteMessage };