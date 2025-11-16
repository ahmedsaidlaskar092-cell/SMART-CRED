
import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full max-w-md mx-auto flex flex-col p-4 pb-20">
      {children}
    </div>
  );
};

export default PageWrapper;
