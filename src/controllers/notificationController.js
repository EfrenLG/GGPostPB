const { getNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../services/notificationService');

const notificationController = {

    // GET /api/notifications
    getNotificationsController: [
        async (req, response) => {
            try {
                const userId = req.user.id;
                const notifications = await getNotifications(userId);
                response.status(200).json(notifications);
            } catch (e) {
                console.log('Error al recoger notificaciones', e);
                response.status(500).json({ error: 'Error al recoger notificaciones' });
            }
        }
    ],

    // GET /api/notifications/unread-count
    getUnreadCountController: [
        async (req, response) => {
            try {
                const userId = req.user.id;
                const count = await getUnreadCount(userId);
                response.status(200).json({ count });
            } catch (e) {
                console.log('Error al contar notificaciones no leídas', e);
                response.status(500).json({ error: 'Error al contar notificaciones' });
            }
        }
    ],

    // PUT /api/notifications/:id/read
    markAsReadController: [
        async (req, response) => {
            try {
                const userId = req.user.id;
                const { id } = req.params;
                await markAsRead(id, userId);
                response.status(200).json({ success: true });
            } catch (e) {
                console.log('Error al marcar notificación como leída', e);
                response.status(500).json({ error: 'Error al marcar como leída' });
            }
        }
    ],

    // PUT /api/notifications/read-all
    markAllAsReadController: [
        async (req, response) => {
            try {
                const userId = req.user.id;
                await markAllAsRead(userId);
                response.status(200).json({ success: true });
            } catch (e) {
                console.log('Error al marcar todas como leídas', e);
                response.status(500).json({ error: 'Error al marcar todas como leídas' });
            }
        }
    ],
};

module.exports = notificationController;