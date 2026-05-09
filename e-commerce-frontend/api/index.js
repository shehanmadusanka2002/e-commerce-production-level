import server from '../dist/server/server.js';

export default async function handler(req, res) {
  // If Vercel eventually passes a standard Web Request (Edge or modern Node), handle it directly.
  if (req instanceof Request) {
    return server.fetch(req);
  }

  // Construct a full absolute URL for the Web Request
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);

  // Map Node.js headers to a Headers object
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  // Prepare the Web Request initialization
  const init = {
    method: req.method,
    headers,
  };

  // For non-GET/HEAD requests, pass the Node.js request stream as the body.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req;
    init.duplex = 'half';
  }

  try {
    // Execute the TanStack Start server fetch
    const request = new Request(url, init);
    const response = await server.fetch(request);

    // Stream the Web Response back to the Node.js ServerResponse
    res.statusCode = response.status;
    res.statusMessage = response.statusText;
    
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (error) {
    console.error('SSR Bridge Error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error: SSR Bridge failed to process request.');
  }
}
