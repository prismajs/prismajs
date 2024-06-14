import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import prismajs from './plugins/prismajs-vite';

export default defineConfig(({ command, mode }) => {
  let plugins = [];
  const framework = process.env.FRAMEWORK;

  if (framework === 'react') {
    plugins.push(react());
  } else if (framework === 'vue') {
    // plugins.push(vue()); // Uncomment and add the vue plugin if needed
  }

  plugins.push(prismajs({
    input: ['./resources/js/app.jsx'],
    refresh: true
  }));

  return {
    plugins,
    build: {
      manifest: true, // Ensure manifest is generated
      outDir: 'public/js',
      rollupOptions: {
        input: './resources/js/app.jsx',
      },
    },
    server: {
      proxy: {
        '/api': 'http://localhost:3001',
      },
    },
  };
});
