import React from 'react';
import { useIdentity } from '../lib/withIdentity';

const Home = () => {
  const identity = useIdentity();
  if (!identity) {
    return null;
  }

  return (
    <main>
      <h1>{JSON.stringify(identity)}</h1>
    </main>
  );
};

export default Home;
