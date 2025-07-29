const http = require('http');
const fs = require('fs');
const path = require('path');

/*
 * Simple Node.js server that exposes a set of REST API endpoints and serves
 * static files for the client application.  This implementation avoids
 * external dependencies (such as Express or Mongoose) to remain compatible
 * with environments where installing npm packages is not possible.  Data is
 * stored in memory and therefore cleared when the process restarts.  In a
 * production‑ready MERN application you would replace the in‑memory arrays
 * with MongoDB models accessed via Mongoose.
 */

const PORT = 3000;

// Basic mime type map for serving static files
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

// In‑memory data collections
let banners = [
  {
    id: 1,
    title: "Middle East’s largest trusted partner", // headline text
    subtitle: "for Audio Visual & IT Business Solutions", // subheadline
    imageUrl: "hero-placeholder.jpg", // relative path served from /client
    ctaLabel: "Discover",
    ctaLink: "#"
  }
];

let products = [
  {
    id: 1,
    name: "Sample Printer",
    description: "A sample printer product used as a placeholder.",
    imageUrl: "product-placeholder.jpg",
    category: "Printers"
  }
];

let events = [
  {
    id: 1,
    title: "GESS Dubai 2023",
    description: "Almoe Digital Solutions participates in GESS Dubai, 2023",
    date: "2023-11-01"
  },
  {
    id: 2,
    title: "GITEX Global 2024",
    description: "Almoe Digital Solutions participates in GITEX Global Dubai, 2024",
    date: "2024-10-15"
  }
];

let testimonials = [
  {
    id: 1,
    name: "Marcus Tolledo",
    company: "Zayed University",
    message: "Almoe Digital Solutions has truly elevated our educational experience."
  },
  {
    id: 2,
    name: "Shafeer N",
    company: "Athena Education",
    message: "From the moment we engaged with Almoe they demonstrated an impressive understanding of our specific needs and objectives."
  }
];

let contactSubmissions = [];

/**
 * Helper: send a JSON response
 * @param {http.ServerResponse} res
 * @param {*} data
 */
function sendJson(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Helper: send a plain text 404 response
 * @param {http.ServerResponse} res
 */
function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

/**
 * Serve a static file from the client directory.  Looks up the file relative
 * to the client folder.  If not found, returns a 404 response.
 *
 * @param {string} fileName Path relative to the client directory
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function serveStatic(fileName, req, res) {
  const filePath = path.join(__dirname, '../client', fileName);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // File doesn't exist
      return notFound(res);
    }
    const ext = path.extname(fileName).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

/**
 * Parse the body of an incoming request as JSON.  Since Node's native
 * http module does not provide built‑in body parsing, this helper
 * accumulates data chunks and then invokes the callback with the parsed
 * object.  If parsing fails, an empty object is returned.
 *
 * @param {http.IncomingMessage} req
 * @param {(Object) => void} callback
 */
function collectRequestData(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      callback(data);
    } catch (e) {
      callback({});
    }
  });
}

/**
 * Handle API routes beginning with /api.
 * Each resource supports basic CRUD operations.  IDs are assigned using
 * Date.now() for simplicity.
 *
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {string} pathname
 */
function handleApi(req, res, pathname) {
  // Simple router based on the pathname
  if (pathname === '/api/banners') {
    if (req.method === 'GET') {
      return sendJson(res, banners);
    } else if (req.method === 'POST') {
      return collectRequestData(req, data => {
        const banner = { id: Date.now(), ...data };
        banners.push(banner);
        sendJson(res, banner);
      });
    }
  }

  if (pathname.startsWith('/api/banners/')) {
    const parts = pathname.split('/');
    const id = parseInt(parts[3]);
    if (req.method === 'DELETE') {
      banners = banners.filter(b => b.id !== id);
      return sendJson(res, { success: true });
    }
  }

  if (pathname === '/api/products') {
    if (req.method === 'GET') {
      return sendJson(res, products);
    } else if (req.method === 'POST') {
      return collectRequestData(req, data => {
        const product = { id: Date.now(), ...data };
        products.push(product);
        sendJson(res, product);
      });
    }
  }
  if (pathname.startsWith('/api/products/')) {
    const parts = pathname.split('/');
    const id = parseInt(parts[3]);
    if (req.method === 'DELETE') {
      products = products.filter(p => p.id !== id);
      return sendJson(res, { success: true });
    }
  }

  if (pathname === '/api/events') {
    if (req.method === 'GET') {
      return sendJson(res, events);
    } else if (req.method === 'POST') {
      return collectRequestData(req, data => {
        const event = { id: Date.now(), ...data };
        events.push(event);
        sendJson(res, event);
      });
    }
  }
  if (pathname.startsWith('/api/events/')) {
    const parts = pathname.split('/');
    const id = parseInt(parts[3]);
    if (req.method === 'DELETE') {
      events = events.filter(e => e.id !== id);
      return sendJson(res, { success: true });
    }
  }

  if (pathname === '/api/testimonials') {
    if (req.method === 'GET') {
      return sendJson(res, testimonials);
    } else if (req.method === 'POST') {
      return collectRequestData(req, data => {
        const testimonial = { id: Date.now(), ...data };
        testimonials.push(testimonial);
        sendJson(res, testimonial);
      });
    }
  }
  if (pathname.startsWith('/api/testimonials/')) {
    const parts = pathname.split('/');
    const id = parseInt(parts[3]);
    if (req.method === 'DELETE') {
      testimonials = testimonials.filter(t => t.id !== id);
      return sendJson(res, { success: true });
    }
  }

  if (pathname === '/api/contact-submissions') {
    if (req.method === 'GET') {
      // Admin use: return list of submissions
      return sendJson(res, contactSubmissions);
    } else if (req.method === 'POST') {
      return collectRequestData(req, data => {
        const submission = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
        contactSubmissions.push(submission);
        sendJson(res, { success: true });
      });
    }
  }
  if (pathname.startsWith('/api/contact-submissions/')) {
    const parts = pathname.split('/');
    const id = parseInt(parts[3]);
    if (req.method === 'DELETE') {
      contactSubmissions = contactSubmissions.filter(s => s.id !== id);
      return sendJson(res, { success: true });
    }
  }

  // default 404 for API
  notFound(res);
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Route API requests to the handler
  if (pathname.startsWith('/api/')) {
    return handleApi(req, res, pathname);
  }

  // Serve admin page on /admin
  if (pathname === '/admin' || pathname === '/admin.html') {
    return serveStatic('admin.html', req, res);
  }

  // Serve index.html for root or other .html requests
  if (pathname === '/' || pathname === '/index.html') {
    return serveStatic('index.html', req, res);
  }

  // Attempt to serve static file from client directory
  serveStatic(pathname, req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});