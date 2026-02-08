const multer = require('multer');

// Configure storage (memory storage for immediate processing/upload to B2)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no soportado. Solo se permiten imágenes y PDF.'), false);
    }
};

// Limits
const limits = {
    fileSize: 5 * 1024 * 1024 // 5MB limit
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

module.exports = upload;
