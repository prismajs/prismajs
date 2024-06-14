import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const HomePage = ({ message }) => {
  return (
    <div>
      <h1>{message}</h1>
      <InertiaLink href="/home">Go to Inertia Home</InertiaLink>
    </div>
  );
};

export default HomePage;
