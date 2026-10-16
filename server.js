const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
// Puerto dinámico para la nube (Render) o 3000 por defecto para pruebas locales
const PORT = process.env.PORT || 3000;

// Hacer que la carpeta 'public' sea accesible públicamente en la web
app.use(express.static('public'));

// Crear carpeta 'public/uploads' si no existe para guardar las fotos de los usuarios
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar almacenamiento con Multer apuntando a la carpeta pública
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Ruta para recibir la foto desde la app (con validación opcional de token)
app.post('/subir-foto', upload.single('foto'), (req, res) => {
    const adminToken = req.headers['x-admin-token'];
    
    // Si quieres asegurar que solo tu app suba fotos, puedes validar el token aquí
    if (adminToken && adminToken !== 'MiClaveSecretaDeAdministrador123') {
        return res.status(403).send({ mensaje: 'Acceso no autorizado' });
    }

    if (!req.file) {
        return res.status(400).send({ mensaje: 'No se subió ninguna foto.' });
    }
    
    console.log(`¡Foto recibida y guardada: ${req.file.filename}!`);
    res.status(200).send({ mensaje: 'Foto recibida con éxito en el servidor del programador.' });
});

// Ruta de la galería web para ver las imágenes desde el navegador sin duplicados
app.get('/galeria', (req, res) => {
    const dir = './public/uploads';
    
    if (!fs.existsSync(dir)) {
        return res.send('<h1>No hay fotos todavía</h1>');
    }

    fs.readdir(dir, (err, files) => {
        if (err) {
            return res.status(500).send('Error al leer las imágenes');
        }

        // Filtrar solo archivos de imagen y eliminar duplicados por nombre
        const uniqueFiles = [...new Set(files.filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file)))];

        let html = `
            <html>
                <head>
                    <title>Galería de Fotos Sincronizadas</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: #121212; color: #fff; text-align: center; }
                        .grid { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin-top: 20px; }
                        .card { background: #1e1e1e; padding: 10px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
                        img { width: 200px; height: 200px; object-fit: cover; border-radius: 6px; }
                        p { font-size: 12px; color: #aaa; margin-top: 5px; max-width: 200px; word-break: break-all; }
                    </style>
                </head>
                <body>
                    <h1>Galería de Fotos Recibidas</h1>
                    <p>Total de imágenes únicas: ${uniqueFiles.length}</p>
                    <div class="grid">
        `;

        if (uniqueFiles.length === 0) {
            html += `<p>Aún no se ha sincronizado ninguna imagen.</p>`;
        } else {
            uniqueFiles.forEach(file => {
                html += `
                    <div class="card">
                        <img src="/uploads/${file}" alt="Foto" />
                        <p>${file}</p>
                    </div>
                `;
            });
        }

        html += `
                    </div>
                </body>
            </html>
        `;

        res.send(html);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de programador corriendo en el puerto ${PORT}`);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de programador corriendo en el puerto ${PORT}`);
});
