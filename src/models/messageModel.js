const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  username: String,
  userId: String,   // NUEVO: para saber quién puede borrar el comentario
  message: String,
  postId: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);