const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    idUser: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
    tittle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    likes: {
        type: [String],
        default: []
    },
    views: {
        type: Number,
        required: true,
        default: 0
    },
    categories: {
        type: String
    },
    fechaAlta: {
        type: Date,
        required: true,
        default: Date.now
    }
});


// Crear el modelo de usuario
const Post = mongoose.model('Post', postSchema);

module.exports = Post; 