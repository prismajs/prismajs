import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/inertia-react';

createInertiaApp({
  id: 'app', // Ensure this matches the id in your HTML template
  resolve: name => {
    console.log("Resolving component on client:", name); // Debugging line
    if (!name) {
      console.error("Component name is undefined");
      return Promise.resolve(() => <div>Error: Component not found</div>);
    }
    return import(`./pages/${name}`).then(module => module.default);
  },
  setup({ el, App, props }) {
    console.log("Setting up Inertia app:", props); // Debugging line
    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: '#29d',
  },
});
