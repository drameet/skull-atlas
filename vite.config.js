import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        cleft: path.resolve(__dirname, 'cleft.html')
      }
    }
  },
  plugins: [
    {
      name: 'save-snapshot-endpoint',
      configureServer(server) {
        server.middlewares.use('/api/save-snapshot', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                const base64Data = data.image.replace(/^data:image\/png;base64,/, '');
                const exportDir = path.resolve(__dirname, 'exports');
                if (!fs.existsSync(exportDir)) {
                  fs.mkdirSync(exportDir, { recursive: true });
                }
                const filename = data.filename || `Within_Skull_Beauchene_${Date.now()}.png`;
                const filePath = path.join(exportDir, filename);
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, path: filePath, filename }));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else {
            res.statusCode = 405;
            res.end('Method Not Allowed');
          }
        });
      }
    }
  ]
});

