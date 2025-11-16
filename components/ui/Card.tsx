import React from 'react';

// FIX: Extended CardProps with React.HTMLAttributes<HTMLDivElement> to allow passing standard element properties like `onClick`.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`bg-card p-4 rounded-xl shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
