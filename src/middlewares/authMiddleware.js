const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

// FIX: ya no se lee req.cookies.token (las cookies cross-domain se bloquean con
// protecciones de privacidad tipo Brave Shields, Safari ITP, uBlock, etc.)
// Ahora se lee el header 'Authorization: Bearer <token>' que el front envía
// manualmente desde el interceptor de axios.
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso no autorizado' });
    };

    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        };

        req.user = decoded;
        next();
    });
};

module.exports = authMiddleware;