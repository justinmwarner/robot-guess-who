import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";

export default defineConfig({
  base: '/robot-guess-who/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'generated/*',
          dest: 'generated'
        }
      ]
    }),
    // Serve generated folder during dev
    {
      name: 'serve-generated',
      configureServer(server) {
        server.middlewares.use('/generated', (req, res, next) => {
          const filePath = path.join(__dirname, 'generated', req.url || '');
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/png');
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: "./postcss.config.cjs",
  },
});

