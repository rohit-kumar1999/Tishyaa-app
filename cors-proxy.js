#!/usr/bin/env node

/**
 * Simple CORS proxy server for development
 * This proxy forwards requests to your backend server with CORS headers enabled
 * Usage: node cors-proxy.js
 */

const http = require("http");
const https = require("https");
const url = require("url");

const PORT = 3001;
const TARGET_HOST = "192.168.29.195";
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);

  // Set up the proxy request options
  const options = {
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: parsedUrl.path,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${TARGET_HOST}:${TARGET_PORT}`,
    },
  };

  console.log(
    `${req.method} ${req.url} -> ${TARGET_HOST}:${TARGET_PORT}${parsedUrl.path}`
  );

  // Create the proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Set response headers (preserve original headers and add CORS)
    Object.keys(proxyRes.headers).forEach((key) => {
      res.setHeader(key, proxyRes.headers[key]);
    });

    // Re-add CORS headers in case they were overwritten
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.writeHead(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  // Handle proxy request errors
  proxyReq.on("error", (err) => {
    console.error("Proxy Request Error:", err.message);
    res.writeHead(500);
    res.end(`Proxy Error: ${err.message}`);
  });

  // Pipe the request body to the proxy request
  req.pipe(proxyReq);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: http://${TARGET_HOST}:${TARGET_PORT}`);
  console.log(`🌐 Accessible from: http://192.168.29.195:${PORT}`);
  console.log("");
  console.log("💡 Update your API baseURL to: http://192.168.29.195:3001");
  console.log("");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use. Please stop other services or change the PORT.`
    );
  } else {
    console.error("❌ Server Error:", err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down CORS proxy server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
