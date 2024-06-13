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
        choices: ['React', 'Vue', 'Inertia.js with React', 'Inertia.js with Vue'],
      },
    ])
    .then((answers) => {
      const { frontend } = answers;
      let installCommand = '';
      let framework = '';

      switch (frontend) {
        case 'React':
          installCommand = 'npx create-react-app resources/js';
          framework = 'react';
          break;
        case 'Vue':
          installCommand = 'npm init vue@latest resources/js';
          framework = 'vue';
          break;
        case 'Inertia.js with React':
          installCommand = 'npx create-react-app resources/js && cd resources/js && npm install @inertiajs/inertia @inertiajs/inertia-react';
          framework = 'react';
          break;
        case 'Inertia.js with Vue':
          installCommand = 'npm init vue@latest resources/js && cd resources/js && npm install @inertiajs/inertia @inertiajs/inertia-vue';
          framework = 'vue';
          break;
        default:
          console.log('No front-end framework selected.');
      }

      if (installCommand) {
        exec(installCommand, (err, stdout, stderr) => {
          if (err) {
            console.error(`Error: ${err.message}`);
            return;
          }
          console.log(stdout);
          setupViteConfig(framework);
        });
      } else {
        setupViteConfig(framework);
      }
    });
}

program.version('1.0.0').description('CLI for PrismaJS Framework');

program
  .command('init')
  .description('Initialize a new project')
  .action(init);

program.parse(process.argv);

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
