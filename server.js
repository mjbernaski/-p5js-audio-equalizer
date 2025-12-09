const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const SONGS_DIR = path.join(__dirname, 'songs');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');

  // API endpoint to list songs
  if (req.url === '/api/songs') {
    fs.readdir(SONGS_DIR, (err, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Could not read songs directory' }));
        return;
      }

      const songs = files
        .filter(file => file.endsWith('.mp3'))
        .map(file => {
          // Create a readable name from filename
          let name = file.replace('.mp3', '');
          // Remove UUID-style names, keep readable ones
          if (!/^[0-9A-F]{8}-[0-9A-F]{4}-/.test(name)) {
            // Clean up underscores and format nicely
            name = name.replace(/_/g, ' ');
          }
          return {
            name: name,
            file: 'songs/' + file
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(songs));
    });
    return;
  }

  // Serve static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, decodeURIComponent(filePath));

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Accessible on network at http://0.0.0.0:${PORT}`);
});
