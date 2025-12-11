import React from 'react';
import { demoPGs } from '../PGListing/demoData';

// Simple component to debug the demo PGs data
const DebugComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Demo PGs</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-[500px]">
        {JSON.stringify(demoPGs, null, 2)}
      </pre>
    </div>
  );
};

export default DebugComponent;
