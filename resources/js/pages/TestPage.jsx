import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const TestPage = ({ message }) => {
  return (
    <div>
      <h1>{message}</h1>
      <InertiaLink href="/">Go to home page</InertiaLink>
    </div>
  );
};

export default TestPage;
