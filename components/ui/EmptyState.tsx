import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionText, onAction }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 mt-10"
    >
      <div className="p-4 bg-accent rounded-full mb-4">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <p className="text-text-secondary mt-1 mb-6 max-w-xs">{message}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="w-auto px-6">
          {actionText}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
