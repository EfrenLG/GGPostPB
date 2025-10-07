// Configuración global
const config = {
  PORT: process.env.PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};

// Configuración de Nodemailer
const createTransporter = () => {

  const nodemailer = require('nodemailer');

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });
};

module.exports = {
  config,
  createTransporter
}; 