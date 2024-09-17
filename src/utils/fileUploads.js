const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.includes('json') || file.mimetype.includes('sheet') || file.mimetype.includes('excel')) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});


module.exports  = upload.single('file');
