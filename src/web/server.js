const http = require('http');
const fs = require('fs');
const path = require('path');

class WebServer {
    constructor(port = 8080) {
        this.port = port;
        this.server = null;
    }

    start() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, () => {
            console.log(`🌐 Servidor web iniciado en puerto ${this.port}`);
        });
    }

    handleRequest(req, res) {
        let filePath = req.url === '/' ? '/pages/home.html' : req.url;
        
        // Mapear rutas limpias a archivos HTML
        const routes = {
            '/': '/pages/home.html',
            '/home': '/pages/home.html',
            '/comandos': '/pages/comandos.html',
            '/pururin': '/pages/pururin.html'
        };

        if (routes[req.url]) {
            filePath = routes[req.url];
        }

        // Si es un archivo público, mantener la ruta completa
        if (req.url.startsWith('/public/')) {
            filePath = req.url; // Mantener /public/css/style.css
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg'
        };

        const contentType = mimeTypes[extname] || 'application/octet-stream';
        const fullPath = path.join(__dirname, filePath);

        // Para archivos multimedia grandes, usar streaming
        if (['.mp4', '.webm', '.mp3', '.wav'].includes(extname)) {
            fs.stat(fullPath, (error, stat) => {
                if (error) {
                    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end('<h1>404 - Archivo no encontrado dx</h1>', 'utf-8');
                    return;
                }

                const fileSize = stat.size;
                const range = req.headers.range;

                if (range) {
                    // Soporte para Range requests (streaming)
                    const parts = range.replace(/bytes=/, "").split("-");
                    const start = parseInt(parts[0], 10);
                    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                    const chunksize = (end - start) + 1;
                    const file = fs.createReadStream(fullPath, { start, end });

                    res.writeHead(206, {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': contentType
                    });
                    file.pipe(res);
                } else {
                    // Sin range, enviar todo el archivo
                    res.writeHead(200, {
                        'Content-Length': fileSize,
                        'Content-Type': contentType
                    });
                    fs.createReadStream(fullPath).pipe(res);
                }
            });
        } else {
            // Archivos normales (HTML, CSS, imágenes pequeñas)
            fs.readFile(fullPath, (error, content) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end('<h1>404 - Página no encontrada dx</h1>', 'utf-8');
                    } else {
                        res.writeHead(500);
                        res.end('Error del servidor: ' + error.code);
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
                    res.end(content, 'utf-8');
                }
            });
        }
    }

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
}

module.exports = WebServer;
