const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const SUBMISSIONS_DIR = path.join(DATA_DIR, 'submissions');
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8'
};

function safeJoin(base, target) {
  const targetPath = path.posix.normalize('/' + target);
  return path.join(base, targetPath);
}

function readJsonFileSync(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=UTF-8' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    try {
      const str = Buffer.concat(body).toString('utf8');
      const json = str ? JSON.parse(str) : {};
      callback(null, json);
    } catch (err) {
      callback(err);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname || '/');

  // API routes
  if (pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }
    // Simple GET endpoints for data
    if (req.method === 'GET') {
      if (pathname === '/api/health') return sendJson(res, 200, { status: 'ok' });
      if (pathname === '/api/ngos') {
        const data = readJsonFileSync(path.join(DATA_DIR, 'ngos.json')) || [];
        return sendJson(res, 200, data);
      }
      if (pathname === '/api/events') {
        const data = readJsonFileSync(path.join(DATA_DIR, 'events.json')) || [];
        return sendJson(res, 200, data);
      }
      if (pathname === '/api/news') {
        const data = readJsonFileSync(path.join(DATA_DIR, 'news.json')) || [];
        return sendJson(res, 200, data);
      }
      if (pathname === '/api/resources') {
        const data = readJsonFileSync(path.join(DATA_DIR, 'resources.json')) || [];
        return sendJson(res, 200, data);
      }
      res.writeHead(404, { 'Content-Type': 'application/json; charset=UTF-8' });
      return res.end(JSON.stringify({ error: 'Not Found' }));
    }

    if (req.method === 'POST') {
      if (['/api/contact', '/api/membership', '/api/donate-pledge', '/api/event-register'].includes(pathname)) {
        return parseBody(req, (err, body) => {
          if (err) {
            return sendJson(res, 400, { error: 'Invalid JSON' });
          }
          ensureDirSync(SUBMISSIONS_DIR);
          const fileName = `${pathname.replace('/api/', '')}-${Date.now()}.json`;
          fs.writeFile(path.join(SUBMISSIONS_DIR, fileName), JSON.stringify(body, null, 2), (writeErr) => {
            if (writeErr) {
              return sendJson(res, 500, { error: 'Failed to save submission' });
            }
            return sendJson(res, 200, { ok: true });
          });
        });
      }
      return sendJson(res, 404, { error: 'Not Found' });
    }

    return sendJson(res, 405, { error: 'Method Not Allowed' });
  }

  // Serve data from /data
  if (pathname.startsWith('/data/')) {
    const dataPath = safeJoin(DATA_DIR, pathname.replace('/data/', ''));
    fs.stat(dataPath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(dataPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(dataPath).pipe(res);
    });
    return;
  }

  // Default to index.html for root and directory requests
  let filePath = safeJoin(PUBLIC_DIR, pathname === '/' ? '/index.html' : pathname);

  // If path is a directory, try index.html inside
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    fs.stat(filePath, (innerErr, innerStats) => {
      if (innerErr || !innerStats.isFile()) {
        // Try adding .html if extensionless
        if (!path.extname(filePath)) {
          const htmlPath = filePath + '.html';
          return fs.stat(htmlPath, (htmlErr, htmlStats) => {
            if (!htmlErr && htmlStats.isFile()) {
              const ext = '.html';
              res.writeHead(200, { 'Content-Type': mimeTypes[ext] });
              return fs.createReadStream(htmlPath).pipe(res);
            }
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('Not Found');
          });
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Static server running at http://localhost:${PORT}`);
});