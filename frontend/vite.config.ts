import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { contentData } from './src/content/contentData';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'virtual-content-plugin',
      resolveId(id) {
        if (id === 'virtual:content') {
          return '\0virtual:content';
        }
        if (id === 'virtual:format-overrides') {
          return '\0virtual:format-overrides';
        }
      },
      load(id) {
        if (id === '\0virtual:content') {
          return `
export const home = ${JSON.stringify(contentData.home)};
export const services = ${JSON.stringify(contentData.services)};
export const about = ${JSON.stringify(contentData.about)};
export const work = ${JSON.stringify(contentData.work)};
export const contact = ${JSON.stringify(contentData.contact)};
export const endpoint_management = ${JSON.stringify(contentData.endpoint_management)};
export const ems_pricing = ${JSON.stringify(contentData.ems_pricing)};
export default { home, services, about, work, contact, endpoint_management, ems_pricing };
`;
        }
        if (id === '\0virtual:format-overrides') {
          return `export default { version: 1, scopes: {} };`;
        }
      }
    },
    {
      name: 'airo-assets-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/airo-assets/images/logo/')) {
            req.url = '/assets/images/logo/logo-logo.webp';
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
});
