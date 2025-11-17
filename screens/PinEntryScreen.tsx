
import React, { useState } from 'react';
import { usePin } from '../contexts/PinContext';
import { motion } from 'framer-motion';
import { Lock, Delete } from 'lucide-react';

const PinEntryScreen: React.FC = () => {
  const { verifyPin } = usePin();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (key: string) => {
    if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };
  
  const handleClear = () => {
    setPin('');
  };

  React.useEffect(() => {
    if (pin.length === 4) {
      const isValid = verifyPin(pin);
      if (!isValid) {
        setError(true);
        setTimeout(() => {
            setPin('');
            setError(false);
        }, 800);
      }
    }
  }, [pin, verifyPin]);

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '<'];
  
  const pinDots = Array(4).fill(0).map((_, i) => (
      <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? 'bg-primary border-primary' : 'border-text-secondary'}`} />
  ));

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col justify-center items-center p-6 bg-background text-text-primary"
    >
      <div className="w-full max-w-xs text-center">
        <Lock size={40} className="mx-auto text-primary mb-4" />
        <h1 className="text-2xl font-bold font-poppins">Enter PIN</h1>
        <p className="text-text-secondary mb-8">Enter your 4-digit PIN to unlock.</p>
        
        <motion.div 
            className="flex justify-center gap-4 mb-8"
            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.3 }}
        >
          {pinDots}
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
            {numpadKeys.map(key => {
                if (key === 'C') {
                    return <button key={key} onClick={handleClear} className="h-16 text-2xl font-bold bg-card rounded-full flex items-center justify-center transition-transform transform active:scale-95 text-red-500">C</button>
                }
                if (key === '<') {
                    return <button key={key} onClick={handleDelete} className="h-16 text-2xl font-bold bg-card rounded-full flex items-center justify-center transition-transform transform active:scale-95"><Delete /></button>
                }
                return (
                    <button key={key} onClick={() => handleKeyPress(key)} className="h-16 text-2xl font-bold bg-card rounded-full flex items-center justify-center transition-transform transform active:scale-95">
                        {key}
                    </button>
                )
            })}
        </div>
      </div>
    </motion.div>
  );
};

export default PinEntryScreen;
