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

// NUEVO: actualizar la biografía del perfil
async function updateBio(userId, bio) {
    try {
        const cleanBio = (bio || '').trim().slice(0, 150);
        const updated = await Usuario.findByIdAndUpdate(
            userId,
            { bio: cleanBio },
            { new: true }
        );
        if (!updated) throw new Error('Usuario no encontrado');
        return { bio: updated.bio };
    } catch (err) {
        console.error('Error al actualizar la bio:', err);
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

// ACTUALIZADO: toggle follow/unfollow con soporte para cuentas privadas
// - Si el target es público: comportamiento normal (follow directo / unfollow)
// - Si el target es privado y no le sigues: se crea una solicitud pendiente en vez de seguir directo
// - Si ya había una solicitud pendiente: se cancela (toggle)
async function followUser(currentUserId, targetUserId) {
    try {
        const currentUser = await Usuario.findById(currentUserId);
        const targetUser  = await Usuario.findById(targetUserId);

        if (!currentUser || !targetUser) {
            throw new Error('Usuario no encontrado');
        }

        // NUEVO: si hay un bloqueo en cualquier sentido, no se puede seguir
        const blockedByMe = currentUser.blocked.includes(targetUserId);
        const blockedByThem = targetUser.blocked.includes(currentUserId);
        if (blockedByMe || blockedByThem) {
            const err = new Error('No es posible seguir a este usuario');
            err.status = 403;
            throw err;
        }

        const alreadyFollowing = currentUser.following.includes(targetUserId);

        // Ya le sigues -> unfollow (independientemente de si es privada o no)
        if (alreadyFollowing) {
            await Usuario.findByIdAndUpdate(currentUserId, {
                $pull: { following: targetUserId }
            });
            await Usuario.findByIdAndUpdate(targetUserId, {
                $pull: { followers: currentUserId }
            });
            return { action: 'unfollow' };
        }

        // Cuenta privada: gestionar solicitud en vez de seguir directo
        if (targetUser.isPrivate) {
            const alreadyRequested = targetUser.followRequests.includes(currentUserId);

            if (alreadyRequested) {
                // Cancelar solicitud pendiente
                await Usuario.findByIdAndUpdate(targetUserId, {
                    $pull: { followRequests: currentUserId }
                });
                return { action: 'cancelled' };
            } else {
                // Crear solicitud pendiente
                await Usuario.findByIdAndUpdate(targetUserId, {
                    $addToSet: { followRequests: currentUserId }
                });
                return { action: 'requested' };
            }
        }

        // Cuenta pública -> follow directo
        await Usuario.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId }
        });
        await Usuario.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId }
        });
        return { action: 'follow' };

    } catch (err) {
        console.error('Error al seguir usuario:', err);
        throw err;
    }
}

// NUEVO: activar/desactivar cuenta privada
async function togglePrivate(userId) {
    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario) throw new Error('Usuario no encontrado');

        const updated = await Usuario.findByIdAndUpdate(
            userId,
            { isPrivate: !usuario.isPrivate },
            { new: true }
        );

        return { isPrivate: updated.isPrivate };
    } catch (err) {
        console.error('Error al cambiar privacidad:', err);
        throw err;
    }
}

// NUEVO: lista de solicitudes pendientes que ha recibido el usuario, con datos completos
async function getFollowRequests(userId) {
    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario) throw new Error('Usuario no encontrado');

        const ids = usuario.followRequests;
        if (!ids || ids.length === 0) return [];

        const usuarios = await Usuario.find(
            { _id: { $in: ids } },
            '_id username icon'
        );

        return usuarios.map(u => ({
            id: u._id,
            username: u.username,
            icon: u.icon
        }));

    } catch (err) {
        console.error('Error al obtener solicitudes de seguimiento:', err);
        throw err;
    }
}

// NUEVO: aceptar una solicitud de seguimiento
// requesterId empieza a seguir a userId
async function acceptFollowRequest(userId, requesterId) {
    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario) throw new Error('Usuario no encontrado');

        if (!usuario.followRequests.includes(requesterId)) {
            throw new Error('No existe esa solicitud de seguimiento');
        }

        // Quitar de followRequests, añadir a followers/following
        await Usuario.findByIdAndUpdate(userId, {
            $pull:     { followRequests: requesterId },
            $addToSet: { followers: requesterId }
        });
        await Usuario.findByIdAndUpdate(requesterId, {
            $addToSet: { following: userId }
        });

        return { success: true };
    } catch (err) {
        console.error('Error al aceptar solicitud:', err);
        throw err;
    }
}

// NUEVO: rechazar una solicitud de seguimiento (simplemente se borra)
async function rejectFollowRequest(userId, requesterId) {
    try {
        await Usuario.findByIdAndUpdate(userId, {
            $pull: { followRequests: requesterId }
        });
        return { success: true };
    } catch (err) {
        console.error('Error al rechazar solicitud:', err);
        throw err;
    }
}

// NUEVO: perfil público — datos del usuario + sus posts + contadores
// ACTUALIZADO: tiene en cuenta isPrivate. Si es privada y el visitante no sigue,
// no se devuelven los posts (el front decide qué mostrar según canViewPosts)
async function getPublicProfile(targetId, viewerId) {
    try {
        const usuario = await Usuario.findById(targetId, '-password -email -permissions');
        if (!usuario) throw new Error('Usuario no encontrado');

        const isOwner = String(targetId) === String(viewerId);

        // NUEVO: comprobar bloqueo en cualquier sentido
        const viewer = viewerId ? await Usuario.findById(viewerId) : null;
        const blockedByMe = viewer ? viewer.blocked.includes(targetId) : false;
        const blockedByThem = usuario.blocked.includes(viewerId);
        const isBlocked = blockedByMe || blockedByThem;

        const isFollower   = usuario.followers.includes(viewerId);
        const canViewPosts = !isBlocked && (isOwner || !usuario.isPrivate || isFollower);

        const posts = canViewPosts
            ? await Post.find({ idUser: targetId }).sort({ fechaAlta: -1 })
            : [];

        const hasPendingRequest = usuario.followRequests.includes(viewerId);

        return {
            usuario: {
                _id:        usuario._id,
                username:   usuario.username,
                icon:       usuario.icon,
                bio:        usuario.bio || '',
                followers:  usuario.followers,
                following:  usuario.following,
                isPrivate:  usuario.isPrivate,
                fechaAlta:  usuario.fechaAlta,
            },
            posts,
            stats: {
                posts:     canViewPosts ? posts.length : 0,
                followers: usuario.followers.length,
                following: usuario.following.length,
            },
            canViewPosts,
            hasPendingRequest,
            isBlocked,        // NUEVO: el front lo usa para ocultar el botón Seguir
            blockedByMe,      // NUEVO: para saber si fui yo quien bloqueó
        };

    } catch (err) {
        console.error('Error al obtener perfil público:', err);
        throw err;
    }
}

// NUEVO: lista de seguidores o seguidos con datos completos (username, icon)
// type: 'followers' | 'following'
async function getFollowList(targetId, type) {
    try {
        const usuario = await Usuario.findById(targetId);
        if (!usuario) throw new Error('Usuario no encontrado');

        const ids = type === 'followers' ? usuario.followers : usuario.following;

        if (!ids || ids.length === 0) return [];

        const usuarios = await Usuario.find(
            { _id: { $in: ids } },
            '_id username icon'
        );

        return usuarios.map(u => ({
            id: u._id,
            username: u.username,
            icon: u.icon
        }));

    } catch (err) {
        console.error('Error al obtener lista de seguidores/seguidos:', err);
        throw err;
    }
}

// NUEVO: eliminar a alguien de tus seguidores (sin bloquearlo, puede volver a seguirte)
async function removeFollower(myId, followerId) {
    try {
        const me = await Usuario.findById(myId);
        if (!me) throw new Error('Usuario no encontrado');

        if (!me.followers.includes(followerId)) {
            throw new Error('Ese usuario no te sigue');
        }

        await Usuario.findByIdAndUpdate(myId, {
            $pull: { followers: followerId }
        });
        await Usuario.findByIdAndUpdate(followerId, {
            $pull: { following: myId }
        });

        return { success: true };
    } catch (err) {
        console.error('Error al eliminar seguidor:', err);
        throw err;
    }
}

// NUEVO: bloquear a un usuario — rompe cualquier relación de seguimiento existente
// en ambos sentidos y añade el bloqueo
async function blockUser(myId, targetId) {
    try {
        if (String(myId) === String(targetId)) {
            throw new Error('No puedes bloquearte a ti mismo');
        }

        const target = await Usuario.findById(targetId);
        if (!target) throw new Error('Usuario no encontrado');

        // Romper relación de seguimiento en ambos sentidos
        await Usuario.findByIdAndUpdate(myId, {
            $pull: { following: targetId, followers: targetId, followRequests: targetId },
            $addToSet: { blocked: targetId }
        });
        await Usuario.findByIdAndUpdate(targetId, {
            $pull: { following: myId, followers: myId, followRequests: myId }
        });

        return { success: true };
    } catch (err) {
        console.error('Error al bloquear usuario:', err);
        throw err;
    }
}

// NUEVO: desbloquear a un usuario (no restaura el seguimiento previo)
async function unblockUser(myId, targetId) {
    try {
        await Usuario.findByIdAndUpdate(myId, {
            $pull: { blocked: targetId }
        });
        return { success: true };
    } catch (err) {
        console.error('Error al desbloquear usuario:', err);
        throw err;
    }
}

// NUEVO: lista de usuarios bloqueados con datos completos
async function getBlockedUsers(myId) {
    try {
        const me = await Usuario.findById(myId);
        if (!me) throw new Error('Usuario no encontrado');

        const ids = me.blocked;
        if (!ids || ids.length === 0) return [];

        const usuarios = await Usuario.find(
            { _id: { $in: ids } },
            '_id username icon'
        );

        return usuarios.map(u => ({
            id: u._id,
            username: u.username,
            icon: u.icon
        }));
    } catch (err) {
        console.error('Error al obtener usuarios bloqueados:', err);
        throw err;
    }
}

module.exports = {
    getUser,
    updateUserIcon,
    updateUserPost,
    getUsers,
    followUser,
    getPublicProfile,
    getFollowList,
    togglePrivate,
    getFollowRequests,
    acceptFollowRequest,
    rejectFollowRequest,
    updateBio,
    removeFollower,
    blockUser,
    unblockUser,
    getBlockedUsers,
};