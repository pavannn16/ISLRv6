// HTTPS configuration for Next.js
const fs = require('fs');
const path = require('path');

// SSL certificate paths
const SSL_DIR = path.join(__dirname, 'ssl');
const certPath = path.join(SSL_DIR, 'server.crt');
const keyPath = path.join(SSL_DIR, 'server.key');

// Read SSL certificates
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

module.exports = {
  httpsOptions
};
