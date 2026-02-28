const http = require('http');
const https = require('https');

const FIREBASE_HOST = 'dpgames-66d73-default-rtdb.europe-west1.firebasedatabase.app';
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  let body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    body = Buffer.concat(body);
    
    const options = {
      hostname: FIREBASE_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        'Host': FIREBASE_HOST,
        'Content-Type': 'application/json',
      }
    };
    
    if (body.length > 0) {
      options.headers['Content-Length'] = body.length;
    }
    
    const proxyReq = https.request(options, (proxyRes) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(proxyRes.statusCode);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (e) => {
      res.writeHead(500);
      res.end('Error: ' + e.message);
    });
    
    if (body.length > 0) proxyReq.write(body);
    proxyReq.end();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Firebase Proxy running on port ' + PORT);
});
