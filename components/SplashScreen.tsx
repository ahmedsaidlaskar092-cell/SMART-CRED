import React from 'react';
import { motion } from 'framer-motion';
import Logo from './ui/Logo';

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="text-center"
    >
      <Logo className="w-32 h-32 mx-auto" />
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="text-3xl font-poppins font-bold text-text-primary mt-6"
      >
        Simple GST Business Tracker
      </motion.h1>
    </motion.div>
  </div>
);

export default SplashScreen;
