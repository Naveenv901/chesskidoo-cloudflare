import { defineConfig } from 'vite';
import { resolve, extname } from 'path';
import { existsSync, statSync, createReadStream, cpSync } from 'fs';

const MIME = {
  '.html': 'text/html',            '.js':   'text/javascript',
  '.mjs':  'text/javascript',      '.css':  'text/css',
  '.json': 'application/json',     '.map':  'application/json',
  '.svg':  'image/svg+xml',        '.png':  'image/png',
  '.jpg':  'image/jpeg',           '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',            '.webp': 'image/webp',
  '.ico':  'image/x-icon',         '.woff': 'font/woff',
  '.woff2': 'font/woff2',          '.ttf':  'font/ttf',
  '.wasm': 'application/wasm',     '.txt':  'text/plain',
  '.mp4':  'video/mp4',            '.webm': 'video/webm',
};

export default defineConfig({
  plugins: [
    {
      name: 'ck-copy-assets-build',
      // Ensure videos (and any assets/videos content) ship in dist during
      // `vite build` itself, independent of the separate copy-assets step.
      writeBundle() {
        const src = resolve(__dirname, 'assets/videos');
        const dest = resolve(__dirname, 'dist/assets/videos');
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true });
        }
      },
    },
    {
      name: 'ck-serve-lms-from-root',
      configureServer(server) {
        const lmsRoot = resolve(__dirname, 'lms');
        server.middlewares.use((req, res, next) => {
          const [pathname] = (req.url || '').split('?');
          if (!pathname.startsWith('/lms/')) return next();
          let rel = pathname.slice('/lms'.length);
          if (rel === '/' ) rel = '/index.html';
          const file = resolve(lmsRoot, '.' + rel);
          if (!file.startsWith(lmsRoot)) return next();
          if (!existsSync(file) || statSync(file).isDirectory()) return next();
          res.setHeader('Content-Type', MIME[extname(file).toLowerCase()] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'no-cache');
          return createReadStream(file).pipe(res);
        });
      },
    },
    {
      name: 'ck-lms-dir-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const [path, query] = (req.url || '').split('?');
          if (path === '/lms') {
            res.writeHead(301, { Location: '/lms/' + (query ? '?' + query : '') });
            return res.end();
          }
          next();
        });
      },
    },
  ],

  build: {
    rollupOptions: {
      input: {
        landing: resolve(__dirname, 'index.html'),
      },
      output: {
        chunkFileNames:  'assets/js/[name]-[hash].js',
        entryFileNames:  'assets/js/[name]-[hash].js',
        assetFileNames:  'assets/[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('stockfish'))     return 'stockfish';
          if (id.includes('@supabase'))     return 'supabase';
          if (id.includes('node_modules'))  return 'vendor';
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: true,
  },

  resolve: {
    alias: {
      '@lib':        resolve(__dirname, 'src/lib'),
      '@pages':      resolve(__dirname, 'src/pages'),
      '@components': resolve(__dirname, 'src/components'),
      '@styles':     resolve(__dirname, 'src/styles'),
    },
  },

  publicDir: 'public',

  server: {
    port: 5173,
    host: true,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8788',
        changeOrigin: true,
      }
    },
  },
});
