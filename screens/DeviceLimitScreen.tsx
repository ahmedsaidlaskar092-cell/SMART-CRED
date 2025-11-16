
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const DeviceLimitScreen: React.FC = () => {
  const { setDeviceLimitReached } = useAuth();

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col justify-center items-center p-6 text-center"
    >
        <div className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-lg">
            <Smartphone className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-2xl font-bold font-poppins text-text-primary mb-2">Device Limit Reached</h1>
            <p className="text-text-secondary mb-8">
                You can use this firm account on up to 3 devices. Please remove a device from Settings → Device Manager to continue.
            </p>
            <Button onClick={() => setDeviceLimitReached(false)}>OK</Button>
        </div>
    </motion.div>
  );
};

export default DeviceLimitScreen;
