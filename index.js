const http = require('http');
const httpProxy = require('http-proxy');

const FIREBASE_TARGET = 'https://dpgames-66d73-default-rtdb.europe-west1.firebasedatabase.app';
const PORT = process.env.PORT || 3000;

const proxy = httpProxy.createProxyServer({
  target: FIREBASE_TARGET,
  changeOrigin: true,
  secure: true,
  ws: true,
  headers: {
    'Host': 'dpgames-66d73-default-rtdb.europe-west1.firebasedatabase.app'
  }
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  if (res.writeHead) {
    res.writeHead(502);
    res.end('Proxy error');
  }
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
});

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  proxy.web(req, res);
});

// WebSocket проксирование
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Firebase WS+HTTP Proxy on port ' + PORT);
  console.log('Target:', FIREBASE_TARGET);
});
