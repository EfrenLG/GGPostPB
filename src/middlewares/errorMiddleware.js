// FIX: typos corregidos: "succes" -> "success", "ssservidor" -> "servidor"
const errorHandler = (error, request, response, next) => {
    console.log('Ejecutamos el middleware de error', error);
    response.status(error.status || 500).json({
        success: 'NOK',
        message: error.message || 'Error interno del servidor'
    });
};

module.exports = errorHandler;