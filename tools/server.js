// Kleiner Webserver zum lokalen Testen – ohne Python, ohne Zusatzpakete.
// Start im Projektordner:  node tools/server.js
// Dann im Browser öffnen:  http://localhost:8000
// Beenden: Strg+C
// Läuft auch mit sehr alten Node-Versionen (getestet mit Node 6).

'use strict';
var http = require('http');
var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var PORT = Number(process.env.PORT) || 8000;
var TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.chopro': 'text/plain; charset=utf-8',
  '.cho': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

http.createServer(function (req, res) {
  var p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { p = '/'; }
  if (p.slice(-1) === '/') p += 'index.html';
  var file = path.join(ROOT, path.normalize(p));
  if (file.indexOf(ROOT) !== 0) { res.writeHead(403); res.end('Verboten'); return; }
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Nicht gefunden: ' + p); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', function () {
  console.log('SoulTape Stage läuft auf http://localhost:' + PORT + '  (Beenden mit Strg+C)');
});
