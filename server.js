const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
// Puerto dinámico para la nube (Render) o 3000 por defecto para pruebas locales
const PORT = process.env.PORT || 3000;

// Crear carpeta 'uploads' si no existe para guardar las fotos de los usuarios
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configurar almacenamiento con Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Ruta para recibir la foto desde la app
app.post('/subir-foto', upload.single('foto'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ mensaje: 'No se subió ninguna foto.' });
    }
    console.log('¡Foto recibida y guardada para servicio de apoyo!');
    res.status(200).send({ mensaje: 'Foto recibida con éxito en el servidor del programador.' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de programador corriendo en el puerto ${PORT}`);
});