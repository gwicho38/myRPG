#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const distPath = path.join(__dirname, '../dist');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(distPath, req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // Try to serve index.html for SPA routing
            if (err.code === 'ENOENT' && path.extname(filePath) === '') {
                filePath = path.join(distPath, 'index.html');
                fs.readFile(filePath, (err2, data2) => {
                    if (err2) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end('<h1>404 Not Found</h1>');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(data2);
                    }
                });
                return;
            }
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1>');
            return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(`Serving files from: ${distPath}`);

    // Open browser on macOS/Linux
    const open = process.platform === 'darwin' ? 'open' : 'xdg-open';
    require('child_process').exec(`${open} http://localhost:${port}`);
});