const Notification = require('../models/notificationModel');

// Crear una notificación de like o comentario.
// No se crea si el emisor es el mismo que el receptor (no te notificas a ti mismo).
async function createNotification({ recipientId, senderId, senderUsername, senderIcon, type, postId, postFile }) {
    try {
        if (String(recipientId) === String(senderId)) {
            return null; // no notificarse a uno mismo
        }

        const notification = new Notification({
            recipientId,
            senderId,
            senderUsername,
            senderIcon,
            type,
            postId,
            postFile,
        });

        await notification.save();
        return notification;
    } catch (err) {
        console.error('Error al crear notificación:', err);
        // No relanzamos el error: una notificación fallida no debe romper el like/comentario
        return null;
    }
}

// Obtener las notificaciones de un usuario, más recientes primero
async function getNotifications(userId) {
    try {
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ timestamp: -1 })
            .limit(50);
        return notifications;
    } catch (err) {
        console.error('Error al obtener notificaciones:', err);
        throw err;
    }
}

// Contador de notificaciones no leídas
async function getUnreadCount(userId) {
    try {
        const count = await Notification.countDocuments({ recipientId: userId, read: false });
        return count;
    } catch (err) {
        console.error('Error al contar notificaciones no leídas:', err);
        throw err;
    }
}

// Marcar una notificación concreta como leída
async function markAsRead(notificationId, userId) {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipientId: userId },
            { read: true },
            { new: true }
        );
        if (!notification) throw new Error('Notificación no encontrada');
        return notification;
    } catch (err) {
        console.error('Error al marcar notificación como leída:', err);
        throw err;
    }
}

// Marcar todas las notificaciones de un usuario como leídas
async function markAllAsRead(userId) {
    try {
        await Notification.updateMany({ recipientId: userId, read: false }, { read: true });
        return { success: true };
    } catch (err) {
        console.error('Error al marcar todas como leídas:', err);
        throw err;
    }
}

module.exports = { createNotification, getNotifications, getUnreadCount, markAsRead, markAllAsRead };