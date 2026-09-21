process.env.RUNNING_CUSTOM_SERVER = 'true';
import path from 'path';
import fs from 'fs';
import express from 'express';
import app from './server/app.js';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const PORT = 3000;

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPublic = path.join(process.cwd(), 'dist/public');
    const distRoot = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(distPublic) ? distPublic : distRoot;
    app.use(express.static(distPath));
    app.get('*', (_req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Dukkani Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
