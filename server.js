// Custom HTTPS server for Next.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const { httpsOptions } = require('./next-https-config');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    
    // Get the IP address
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let ipAddress = 'localhost';
    
    // Find the first non-internal IPv4 address
    Object.keys(networkInterfaces).forEach((interfaceName) => {
      networkInterfaces[interfaceName].forEach((iface) => {
        if (iface.family === 'IPv4' && !iface.internal) {
          ipAddress = iface.address;
        }
      });
    });
    
    console.log(`\x1b[32m===== ISLRv6 Frontend Server =====\x1b[0m`);
    console.log(`\x1b[36mReady on:\x1b[0m`);
    console.log(`\x1b[36m- Local:   https://localhost:${port}\x1b[0m`);
    console.log(`\x1b[36m- Network: https://${ipAddress}:${port}\x1b[0m`);
    console.log(`\x1b[33mNote: Using self-signed certificates. Browsers will show a security warning.\x1b[0m`);
  });
});
