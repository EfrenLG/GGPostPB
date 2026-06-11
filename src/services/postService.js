const fs = require('fs').promises;
const Post = require('../models/postModel');
const Usuario = require('../models/userModel');
const path = require('path');

const uploadDir = path.join(__dirname, '../../post');

async function getPost(id) {
    try {
        const post = await Post.findById(id);

        if (!post) {
            throw new Error('Post no encontrado');
        }

        const user = await Usuario.findById(post.idUser);

        return { post, user };

    } catch (err) {
        console.error('Error al obtener post:', err);
        throw err;
    }
}

async function initializeUploadDir() {
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
}

async function uploadFile(file) {
    const filePath = path.join(uploadDir, file.originalname);
    await fs.writeFile(filePath, file.buffer);
    return file.originalname;
}

async function updateUserPost(id, tittle, description, categories) {
    try {
        const res = await Post.findByIdAndUpdate(id, { tittle, description, categories });
        console.log('Post actualizado:', res);
    } catch (err) {
        console.error('Error al actualizar Post:', err);
        throw err;
    }
}

// FIX: query atómica con $inc en lugar de dos operaciones separadas (findById + findByIdAndUpdate)
async function updatePostView(id) {
    try {
        const res = await Post.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );
        console.log('Vistas actualizadas:', res?.views);
    } catch (err) {
        console.error('Error al actualizar vistas:', err);
        throw err;
    }
}

// FIX: ahora retorna { updatedPost, action } que es lo que espera postController.js
// Antes solo retornaba updatedPost y el destructuring en el controller fallaba silenciosamente
async function updatePostLike(id, userId) {
    try {
        const post = await Post.findById(id);

        if (!post) {
            throw new Error('Post no encontrado');
        }

        const hasLiked = post.likes.includes(userId);

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            hasLiked
                ? { $pull: { likes: userId } }
                : { $addToSet: { likes: userId } },
            { new: true }
        );

        const action = hasLiked ? 'dislike' : 'like'; // FIX: añadido

        return { updatedPost, action }; // FIX: objeto completo que espera el controller
    } catch (err) {
        console.error('Error al actualizar likes:', err);
        throw err;
    }
}

initializeUploadDir();

module.exports = {
    getPost, uploadFile, updateUserPost, updatePostView, updatePostLike
};