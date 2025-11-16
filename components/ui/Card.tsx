
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-card p-4 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;
