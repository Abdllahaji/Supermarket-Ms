import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
};

export default LoadingSpinner;
