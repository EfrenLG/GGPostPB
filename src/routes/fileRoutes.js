const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');
const upload = multer({ storage });

// Rutas para archivos
router.post('/upload/icon', upload.single('file'), async (req, res) => {
  try {
    
    console.log("Archivo recibido:", req.file);
    return res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (err) {

    console.error("Error al subir imagen a Cloudinary:", err);
    return res.status(500).json({ success: false, message: 'Error al subir imagen.' });
  }
});


router.post('/upload/post', upload.single('file'), async (req, res) => {
  try {

    console.log("Archivo recibido:", req.file);
    return res.status(200).json({
      success: true,
      imageUrl: req.file.path,
    });
  } catch (err) {
    
    console.error("Error al subir imagen a Cloudinary:", err);
    return res.status(500).json({ success: false, message: 'Error al subir imagen.' });
  }
});


module.exports = router; 