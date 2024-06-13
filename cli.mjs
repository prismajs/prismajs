#!/usr/bin/env node

import { exec } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { program } from 'commander';
import path from 'path';
import fs from 'fs';

async function init() {
  const inquirer = await import('inquirer');

  inquirer.default
    .prompt([
      {
        type: 'list',
        name: 'frontend',
        message: 'Which front-end framework do you want to use?',
        choices: ['Inertia.js with React', 'Inertia.js with Vue'],
      },
    ])
    .then((answers) => {
      const { frontend } = answers;
      let framework = '';

      switch (frontend) {
        case 'Inertia.js with React':
          framework = 'react';
          setupReact();
          break;
        case 'Inertia.js with Vue':
          framework = 'vue';
          setupVue();
          break;
        default:
          console.log('No front-end framework selected.');
      }

      setupViteConfig(framework);
    });
}

program.version('1.0.0').description('CLI for PrismaJS Framework');

program
  .command('init')
  .description('Initialize a new project')
  .action(init);

program.parse(process.argv);

function setupReact() {
  exec('npm install @inertiajs/inertia @inertiajs/inertia-react react react-dom', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return;
    }
    console.log(stdout);
    setupReactFiles();
  });
}

function setupVue() {
  exec('npm install @inertiajs/inertia @inertiajs/inertia-vue vue', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return;
    }
    console.log(stdout);
    setupVueFiles();
  });
}

function setupReactFiles() {
  fs.writeFileSync(path.join(process.cwd(), 'resources/js/app.jsx'), `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { InertiaApp } from '@inertiajs/inertia-react';

const el = document.getElementById('app');

createRoot(el).render(
  <InertiaApp
    initialPage={JSON.parse(el.dataset.page)}
    resolveComponent={(name) => import(\`./pages/\${name}\`).then(module => module.default)}
  />
);
  `);

  fs.writeFileSync(path.join(process.cwd(), 'resources/js/pages/HomePage.jsx'), `
import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const HomePage = ({ message }) => (
  <div>
    <h1>{message}</h1>
    <InertiaLink href="/another-page">Go to another page</InertiaLink>
  </div>
);

export default HomePage;
  `);
}

function setupVueFiles() {
  fs.writeFileSync(path.join(process.cwd(), 'resources/js/app.js'), `
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/inertia-vue3';

createInertiaApp({
  resolve: name => require(\`./pages/\${name}\`),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el);
  },
});
  `);

  fs.writeFileSync(path.join(process.cwd(), 'resources/js/pages/HomePage.vue'), `
<template>
  <div>
    <h1>{{ message }}</h1>
    <inertia-link href="/another-page">Go to another page</inertia-link>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
  },
};
</script>
  `);
}

function setupViteConfig(framework) {
  const viteConfigContent = generateViteConfig(framework);
  fs.writeFileSync(path.join(process.cwd(), 'vite.config.js'), viteConfigContent);
  console.log('Vite configuration created successfully.');
}

function generateViteConfig(framework) {
  let pluginImport = '';
  let pluginUsage = '';

  switch (framework) {
    case 'react':
      pluginImport = "import react from '@vitejs/plugin-react';";
      pluginUsage = 'react()';
      break;
    case 'vue':
      pluginImport = "import vue from '@vitejs/plugin-vue';";
      pluginUsage = 'vue()';
      break;
    default:
      pluginImport = '';
      pluginUsage = '';
  }

  return `
import { defineConfig } from 'vite';
${pluginImport}

export default defineConfig({
  plugins: [
    ${pluginUsage}
  ],
  build: {
    outDir: 'public/js',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
  `;
}
