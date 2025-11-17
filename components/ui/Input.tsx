import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  prefix?: string;
}

const Input: React.FC<InputProps> = ({ label, id, prefix, ...props }) => {
  const hasPrefix = !!prefix;
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
      <div className="relative">
        {hasPrefix && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={`w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none ${hasPrefix ? 'pl-12' : ''}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;