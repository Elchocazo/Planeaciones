const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // =========================================================================
  // PROTOCOLO DE SALVAGUARDA: API DE RESPALDO FÍSICO AUTOMÁTICO EN DISCO LOCAL
  // =========================================================================
  if (req.method === 'POST' && reqPath === '/api/autosave') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const backupsDir = path.join(BASE_DIR, 'backups');
        if (!fs.existsSync(backupsDir)) {
          fs.mkdirSync(backupsDir, { recursive: true });
        }
        // Guardar la versión más reciente en caliente
        fs.writeFileSync(path.join(backupsDir, 'autosave_latest.json'), JSON.stringify(data, null, 2), 'utf-8');
        
        // Guardar copia histórica del día
        const todayStr = new Date().toISOString().slice(0, 10);
        fs.writeFileSync(path.join(backupsDir, `backup_${todayStr}.json`), JSON.stringify(data, null, 2), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({
          success: true,
          message: 'Respaldo físico guardado en disco con éxito',
          savedAt: new Date().toISOString(),
          location: 'backups/autosave_latest.json'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && reqPath === '/api/latest-backup') {
    const filePath = path.join(BASE_DIR, 'backups', 'autosave_latest.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
      res.end(JSON.stringify({ error: 'No se encontró archivo de respaldo en disco' }));
    }
    return;
  }

  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Servidor local activo en: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
