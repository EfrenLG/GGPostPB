const WebSocket = require('ws');
const Message = require('../models/messageModel');

const clients = new Map(); // ws -> postId

const handleConnection = (ws) => {
  ws.on('message', async (data) => {
    const parsed = JSON.parse(data);

    if (parsed.type === 'join') {

      // Cliente se une a la sala de un post
      clients.set(ws, parsed.postId);

      // Envia historial de mensajes para ese post
      const messages = await Message.find({ postId: parsed.postId }).sort({ timestamp: 1 });
      ws.send(JSON.stringify({ type: 'history', messages }));

    } else if (parsed.type === 'message') {

      // Nuevo mensaje para guardar y reenviar
      const { postId, user, message } = parsed;

      const newMessage = new Message({
        postId,
        username: user,
        message,
        timestamp: new Date()
      });

      await newMessage.save();

      // Envia a todos los clientes conectados a ese post
      clients.forEach((clientPostId, clientWs) => {
        if (clientWs.readyState === WebSocket.OPEN && clientPostId === postId) {
          clientWs.send(JSON.stringify({
            type: 'message',
            username: user,
            message,
            timestamp: newMessage.timestamp
          }));
        }
      });
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
};

module.exports = { handleConnection };
