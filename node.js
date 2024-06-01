const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const baseDir = path.join(__dirname, 'files');  // Directory to store files

// Ensure the base directory exists
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = path.join(baseDir, url.pathname);

    switch (req.method) {
        case 'POST':
            // Create or update a file
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                fs.writeFile(filePath, body, err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error writing file');
                    } else {
                        res.writeHead(201, { 'Content-Type': 'text/plain' });
                        res.end('File created/updated successfully');
                    }
                });
            });
            break;

        case 'GET':
            // Read a file
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('File not found');
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error reading file');
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(data);
                }
            });
            break;

        case 'DELETE':
            // Delete a file
            fs.unlink(filePath, err => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('File not found');
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Error deleting file');
                    }
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('File deleted successfully');
                }
            });
            break;

        default:
            res.writeHead(405, { 'Content-Type': 'text/plain' });
            res.end('Method not allowed');
            break;
    }
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
