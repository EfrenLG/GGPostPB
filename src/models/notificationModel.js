const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: String,
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    senderUsername: {
        type: String,
        required: true,
    },
    senderIcon: {
        type: String,
        default: 'default.png'
    },
    type: {
        type: String,
        enum: ['like', 'comment'],
        required: true,
    },
    postId: {
        type: String,
        required: true,
    },
    postFile: {
        type: String, // miniatura del post para mostrar en la notificación
    },
    read: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Notification', notificationSchema);