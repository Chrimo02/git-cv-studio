import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { renderFullPrintableHtml } from './public/renderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 4400;
const PUBLIC_DIR = path.join(__dirname, 'public');
const PROFILES_DIR = path.join(__dirname, 'data', 'profiles');
const EXPORTS_DIR = path.join(__dirname, 'exports');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'photos', 'uploads');

fs.mkdirSync(PROFILES_DIR, { recursive: true });
fs.mkdirSync(EXPORTS_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

let browserPromise = null;
async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({ headless: 'new' }).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

async function generateNativePdfBuffer(profile, serverOrigin) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1024, height: 1448, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);

    const html = renderFullPrintableHtml(profile, serverOrigin);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.evaluate(async () => {
      await document.fonts.ready;
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          });
        })
      );
    });

    const marginMm = Number(profile?.layout?.pageMarginMm) ?? 10;
    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: `${marginMm}mm`,
        bottom: `${marginMm}mm`,
        left: '12mm',
        right: '12mm',
      },
    });

    return Buffer.from(pdfUint8);
  } finally {
    await page.close();
  }
}

function loadAllProfiles() {
  const files = fs.readdirSync(PROFILES_DIR).filter((f) => f.endsWith('.json'));
  const profiles = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(PROFILES_DIR, file), 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.id) parsed.id = path.basename(file, '.json');
      profiles.push(parsed);
    } catch (e) {
      console.error(`Failed to parse profile ${file}:`, e.message);
    }
  }
  return profiles;
}

function sanitizeId(str) {
  return String(str || 'profile')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'profile';
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const str = Buffer.concat(chunks).toString('utf-8');
        resolve(str ? JSON.parse(str) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(urlObj.pathname);

    // API: List all profiles
    if (req.method === 'GET' && pathname === '/api/profiles') {
      const profiles = loadAllProfiles();
      return sendJson(res, 200, { profiles });
    }

    // API: Save or update profile
    if (req.method === 'POST' && pathname === '/api/profiles') {
      const body = await readJsonBody(req);
      const profile = body.profile;
      if (!profile || typeof profile !== 'object') {
        return sendJson(res, 400, { error: 'Missing profile object' });
      }
      const id = sanitizeId(profile.id || profile.name);
      profile.id = id;
      profile.updatedAt = new Date().toISOString();
      const targetPath = path.join(PROFILES_DIR, `${id}.json`);
      fs.writeFileSync(targetPath, JSON.stringify(profile, null, 2), 'utf-8');
      return sendJson(res, 200, { ok: true, profile });
    }

    // API: Delete profile
    if (req.method === 'DELETE' && pathname.startsWith('/api/profiles/')) {
      const id = sanitizeId(pathname.slice('/api/profiles/'.length));
      const all = loadAllProfiles();
      if (all.length <= 1) {
        return sendJson(res, 400, { error: 'Cannot delete the last remaining profile.' });
      }
      const targetPath = path.join(PROFILES_DIR, `${id}.json`);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      return sendJson(res, 200, { ok: true });
    }

    // API: Upload image (base64 data URL)
    if (req.method === 'POST' && pathname === '/api/upload-image') {
      const body = await readJsonBody(req);
      const { filename, dataUrl } = body;
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        return sendJson(res, 400, { error: 'Invalid image dataUrl' });
      }
      const match = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (!match) {
        return sendJson(res, 400, { error: 'Malformed base64 image' });
      }
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Data = match[2];
      const safeName = sanitizeId(path.basename(filename || 'image', path.extname(filename || ''))) + '-' + Date.now() + '.' + ext;
      const outPath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
      return sendJson(res, 200, { ok: true, url: `/photos/uploads/${safeName}` });
    }

    // API: Native PDF Generation (Download or Inline Preview)
    if (req.method === 'POST' && pathname === '/api/export-pdf') {
      const body = await readJsonBody(req);
      const profile = body.profile;
      const inline = Boolean(body.inline);
      if (!profile) {
        return sendJson(res, 400, { error: 'Missing profile data' });
      }

      const origin = `http://localhost:${PORT}`;
      const pdfBuffer = await generateNativePdfBuffer(profile, origin);

      const rawName = body.filename || `${(profile.header?.fullName || 'Resume').replace(/\s+/g, '_')}_CV_${profile.id || 'export'}.pdf`;
      const safeFilename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');

      // Also save a copy into cv-studio/exports/ when downloading
      if (!inline) {
        const exportPath = path.join(EXPORTS_DIR, safeFilename);
        fs.writeFileSync(exportPath, pdfBuffer);
      }

      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.length,
        'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${safeFilename}"`,
        'Cache-Control': 'no-store',
      });
      return res.end(pdfBuffer);
    }

    // Static file serving from PUBLIC_DIR
    let relPath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.normalize(path.join(PUBLIC_DIR, relPath));
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (err) {
    console.error('Server error:', err);
    sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

// Check if invoked in CLI --export mode
if (process.argv.includes('--export')) {
  const idx = process.argv.indexOf('--export');
  const requestedProfileId = process.argv[idx + 1] || 'default-en';
  const customOut = process.argv[idx + 2];

  server.listen(0, async () => {
    const assignedPort = server.address().port;
    try {
      const profiles = loadAllProfiles();
      const profile = profiles.find((p) => p.id === requestedProfileId) || profiles[0];
      if (!profile) throw new Error('No profile found in data/profiles/');

      console.log(`Generating native PDF for profile "${profile.name}" (${profile.id})...`);
      const pdfBuffer = await generateNativePdfBuffer(profile, `http://localhost:${assignedPort}`);
      const defaultOutName = `${(profile.header?.fullName || 'Git_CV').replace(/\s+/g, '_')}_CV_${profile.id}.pdf`;
      const outPath = customOut ? path.resolve(process.cwd(), customOut) : path.join(EXPORTS_DIR, defaultOutName);
      fs.writeFileSync(outPath, pdfBuffer);
      console.log(`Saved native PDF to: ${outPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
    } finally {
      if (browserPromise) {
        const b = await browserPromise;
        await b.close();
      }
      server.close(() => process.exit(0));
    }
  });
} else {
  server.listen(PORT, () => {
    console.log(`\n========================================================`);
    console.log(`  Git-CV Studio running at: http://localhost:${PORT}`);
    console.log(`  Profiles directory:       ${PROFILES_DIR}`);
    console.log(`  PDF exports directory:    ${EXPORTS_DIR}`);
    console.log(`========================================================\n`);
  });
}
