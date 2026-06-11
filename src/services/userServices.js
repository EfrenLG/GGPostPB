const Usuario = require('../models/userModel');
const Post = require('../models/postModel');

async function getUser(id) {
    try {
        const usuario = await Usuario.findById(id);
        const post = await Post.find({ idUser: id });

        // FIX: "res" no existe en un servicio, solo en controllers
        // Antes: return res.status(401).json({...}) -> ReferenceError en runtime
        // Ahora: lanzamos un error que el controller captura y responde correctamente
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

async function getUsers() {
    try {
        const usuarios = await Usuario.find({}, '_id icon');

        if (!usuarios || usuarios.length === 0) {
            return [];
        }

        return usuarios.map(usuario => ({
            id: usuario._id,
            icon: usuario.icon
        }));

    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        throw err;
    }
}

module.exports = { getUser, updateUserIcon, updateUserPost, getUsers };