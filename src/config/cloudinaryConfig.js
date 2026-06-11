const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// FIX: eliminados console.log en producción (exponían detalles internos en logs)
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (!file.originalname) {
      throw new Error('originalname no está definido en el archivo recibido por Multer');
    }
    const cleanName = file.originalname.replace(/\.[^/.]+$/, '');
    const id = `${Date.now()}-${cleanName}`;
    return {
      folder: 'ggpost-icons',
      public_id: id,
    };
  }
});

module.exports = {
  cloudinary,
  storage,
};