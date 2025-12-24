import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full fixed top-0 left-0 bg-gray-900 bg-opacity-75 z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <span className="sr-only">加载中...</span>
    </div>
  );
};

export default LoadingSpinner;