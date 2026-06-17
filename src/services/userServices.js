const Usuario = require('../models/userModel');
const Post = require('../models/postModel');

async function getUser(id) {
    try {
        const usuario = await Usuario.findById(id);
        const post = await Post.find({ idUser: id });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return { usuario, post };

    } catch (err) {
        console.error('Error al obtener usuario:', err);
        throw err;
    }
}

async function updateUserIcon(id, file) {
    try {
        const res = await Usuario.findByIdAndUpdate(id, { icon: file });
        console.log('Usuario actualizado:', res);
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        throw err;
    }
}

async function updateUserPost(id, file, tittle, description) {
    try {
        const res = await Usuario.findByIdAndUpdate(id, { icon: file });
        console.log('Usuario actualizado:', res);
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        throw err;
    }
}

// ACTUALIZADO: ahora devuelve también username para las stories y sugerencias
async function getUsers() {
    try {
        const usuarios = await Usuario.find({}, '_id username icon');

        if (!usuarios || usuarios.length === 0) {
            return [];
        }

        return usuarios.map(usuario => ({
            id: usuario._id,
            username: usuario.username,
            icon: usuario.icon
        }));

    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        throw err;
    }
}

// NUEVO: toggle follow/unfollow
// - Añade currentUserId a followers del target
// - Añade targetUserId a following del current
// Si ya seguía, hace unfollow (elimina de ambos)
async function followUser(currentUserId, targetUserId) {
    try {
        const currentUser = await Usuario.findById(currentUserId);
        const targetUser  = await Usuario.findById(targetUserId);

        if (!currentUser || !targetUser) {
            throw new Error('Usuario no encontrado');
        }

        const alreadyFollowing = currentUser.following.includes(targetUserId);

        if (alreadyFollowing) {
            // UNFOLLOW
            await Usuario.findByIdAndUpdate(currentUserId, {
                $pull: { following: targetUserId }
            });
            await Usuario.findByIdAndUpdate(targetUserId, {
                $pull: { followers: currentUserId }
            });
            return { action: 'unfollow' };
        } else {
            // FOLLOW
            await Usuario.findByIdAndUpdate(currentUserId, {
                $addToSet: { following: targetUserId }
            });
            await Usuario.findByIdAndUpdate(targetUserId, {
                $addToSet: { followers: currentUserId }
            });
            return { action: 'follow' };
        }

    } catch (err) {
        console.error('Error al seguir usuario:', err);
        throw err;
    }
}

// NUEVO: perfil público — datos del usuario + sus posts + contadores
async function getPublicProfile(targetId) {
    try {
        const usuario = await Usuario.findById(targetId, '-password -email -permissions');
        if (!usuario) throw new Error('Usuario no encontrado');

        const posts = await Post.find({ idUser: targetId }).sort({ fechaAlta: -1 });

        return {
            usuario: {
                _id:       usuario._id,
                username:  usuario.username,
                icon:      usuario.icon,
                followers: usuario.followers,
                following: usuario.following,
                fechaAlta: usuario.fechaAlta,
            },
            posts,
            stats: {
                posts:     posts.length,
                followers: usuario.followers.length,
                following: usuario.following.length,
            }
        };

    } catch (err) {
        console.error('Error al obtener perfil público:', err);
        throw err;
    }
}

module.exports = { getUser, updateUserIcon, updateUserPost, getUsers, followUser, getPublicProfile };