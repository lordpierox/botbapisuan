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
        
        // Mapear rutas limpias a archivos
        const routes = {
            '/': '/pages/home.html',
            '/home': '/pages/home.html',
            '/comandos': '/pages/comandos.html',
            '/plan': '/pages/plan.html',
            '/pururin': '/pages/pururin.html',
            '/aurora': '/pages/aurora.html'
        };

        if (routes[req.url]) {
            filePath = routes[req.url];
        }

        // Si es un archivo público (CSS, imágenes, etc.), ajustar la ruta
        if (req.url.startsWith('/public/')) {
            filePath = req.url.replace('/public/', '/');
        }

        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        const contentType = mimeTypes[extname] || 'text/html';
        const fullPath = path.join(__dirname, filePath);

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

    stop() {
        if (this.server) {
            this.server.close();
        }
    }
}

module.exports = WebServer;
