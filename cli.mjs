#!/usr/bin/env node

import { exec } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { program } from 'commander';
import path from 'path';
import fs from 'fs';

async function init() {
  const inquirer = await import('inquirer');

  const answers = await inquirer.default.prompt([
    {
      type: 'confirm',
      name: 'useInertia',
      message: 'Do you want to include Inertia.js?',
      default: true,
    },
    {
      type: 'list',
      name: 'frontend',
      message: 'Which front-end framework do you want to use?',
      choices: ['React', 'Vue'],
      when: (answers) => answers.useInertia,
    },
  ]);

  const { useInertia, frontend } = answers;

  if (useInertia) {
    let framework = frontend === 'React' ? 'react' : 'vue';
    setupInertia(framework);
  } else {
    setupStandard();
  }
}

program.version('1.0.0').description('CLI for PrismaJS Framework');

program
  .command('init')
  .description('Initialize a new project')
  .action(init);

program.parse(process.argv);

function setupInertia(framework) {
  const installCommand = framework === 'react' ?
    'npm install @inertiajs/inertia @inertiajs/inertia-react react react-dom' :
    'npm install @inertiajs/inertia @inertiajs/inertia-vue vue';

  exec(installCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return;
    }
    console.log(stdout);
    setupInertiaFiles(framework);
  });
}

function setupInertiaFiles(framework) {
  const dir = path.join(process.cwd(), 'resources/js/pages');
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  if (framework === 'react') {
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
    <InertiaLink href="/about">Go to About Page</InertiaLink>
  </div>
);

export default HomePage;
    `);

    fs.writeFileSync(path.join(process.cwd(), 'resources/js/pages/AboutPage.jsx'), `
import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const AboutPage = ({ title }) => (
  <div>
    <h1>{title}</h1>
    <InertiaLink href="/">Go back to Home Page</InertiaLink>
  </div>
);

export default AboutPage;
    `);
  } else {
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
    <inertia-link href="/about">Go to About Page</inertia-link>
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

    fs.writeFileSync(path.join(process.cwd(), 'resources/js/pages/AboutPage.vue'), `
<template>
  <div>
    <h1>{{ title }}</h1>
    <inertia-link href="/">Go back to Home Page</inertia-link>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
  },
};
</script>
    `);
  }

  setupViteConfig(framework);
  setupBaseEJS();
}

function setupStandard() {
  const dir = path.join(process.cwd(), 'resources/views');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  fs.writeFileSync(path.join(dir, 'home.ejs'), `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home</title>
</head>
<body>
  <h1>Home Page</h1>
</body>
</html>
  `);

  fs.writeFileSync(path.join(dir, 'user.ejs'), `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Profile</title>
</head>
<body>
  <h1>User Profile</h1>
  <p>User ID: <%= userId %></p>
</body>
</html>
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
      '/api': 'http://localhost:3001',
    },
  },
});
  `;
}

function setupBaseEJS() {
  const ejsContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PrismaJS with Inertia.js</title>
</head>
<body>
  <div id="app" data-page="<%= JSON.stringify(page) %>"><!-- app --></div>
  <script type="module" src="/js/app.js"></script>
</body>
</html>
  `;

  const viewsDir = path.join(process.cwd(), 'resources/views');
  if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir);
  }

  fs.writeFileSync(path.join(viewsDir, 'index.ejs'), ejsContent);
  console.log('Base EJS file created successfully.');
}
