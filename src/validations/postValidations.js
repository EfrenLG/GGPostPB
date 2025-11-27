const { body, param, validationResult } = require('express-validator');

// Función de validación de resultados
const validateResult = (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const getPostValidations = [
    param('id')
        .notEmpty()
        .withMessage('El id es requerido')
        .isString()
        .withMessage('El id del post debe ser una cadena'),

    validateResult
];

const createPostValidations = [
    body('idUser')
        .notEmpty()
        .withMessage('El idUser es requerido')
        .isString()
        .withMessage('El idUser debe ser texto'),

    body('file')
        .notEmpty()
        .withMessage('El file es requerido')
        .isString()
        .withMessage('El file debe ser texto'),

    body('tittle')
        .notEmpty()
        .withMessage('El titulo es requerida')
        .isString()
        .withMessage('El titulo debe ser texto'),

    body('description')
        .notEmpty()
        .withMessage('La descripcion es requerida')
        .isString()
        .withMessage('La descripcion debe ser texto'),

    validateResult
];

const deletePostValidations = [
    param('id')
        .notEmpty()
        .withMessage('El id es requerido')
        .isString()
        .withMessage('El id debe ser texto'),

    validateResult
];

module.exports = {
    getPostValidations, createPostValidations, deletePostValidations
}; 