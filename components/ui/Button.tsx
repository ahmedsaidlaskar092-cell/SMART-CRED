
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'w-full text-center py-3 px-4 rounded-lg font-semibold transition-transform transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-primary';

  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-accent text-primary',
    outline: 'bg-transparent border-2 border-primary text-primary',
    ghost: 'bg-transparent text-primary hover:bg-accent',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
