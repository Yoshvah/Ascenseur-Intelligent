const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Hello from elevator server!',
    path: req.url,
    method: req.method
  }));
});

server.listen(5001, () => {
  console.log('✅ Serveur HTTP simple démarré sur le port 5000');
  console.log('📡 http://localhost:5001');
});