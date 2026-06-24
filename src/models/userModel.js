const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    permissions: {
        type: String,
        required: true,
        default: 'NO'
    },
    icon: {
        type: String,
        required: true,
        default: 'default.png'
    },
    // NUEVO: campos para seguir/ser seguido
    followers: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    },
    // NUEVO: cuentas privadas
    isPrivate: {
        type: Boolean,
        default: false
    },
    followRequests: {
        type: [String],
        default: []
    },
    // NUEVO: biografía del perfil
    bio: {
        type: String,
        default: '',
        maxlength: 150
    },
    // NUEVO: usuarios bloqueados por este usuario
    blocked: {
        type: [String],
        default: []
    },
    fechaAlta: {
        type: Date,
        required: true,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    };
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Usuario = mongoose.model('Users', userSchema);

module.exports = Usuario;