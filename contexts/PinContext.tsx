
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PinContextType {
  isPinSet: boolean;
  isLocked: boolean;
  setPin: (pin: string | null) => void;
  verifyPin: (pin: string) => boolean;
  unlockApp: () => void;
  lockApp: () => void;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

const useStickyPin = (): [string | null, (pin: string | null) => void] => {
    const [pin, setPinState] = useState<string | null>(() => {
        try {
            return localStorage.getItem('app-pin');
        } catch {
            return null;
        }
    });

    const setPin = (newPin: string | null) => {
        setPinState(newPin);
        try {
            if (newPin) {
                localStorage.setItem('app-pin', newPin);
            } else {
                localStorage.removeItem('app-pin');
            }
        } catch (e) {
            console.error("Failed to save PIN to localStorage", e);
        }
    };
    
    return [pin, setPin];
};

export const PinProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pin, setPin] = useStickyPin();
  const [isLocked, setIsLocked] = useState<boolean>(!!pin);

  const verifyPin = (enteredPin: string) => {
    if (enteredPin === pin) {
        unlockApp();
        return true;
    }
    return false;
  };

  const unlockApp = () => {
    setIsLocked(false);
  };
  
  const lockApp = () => {
    if (pin) {
      setIsLocked(true);
    }
  }
  
  const isPinSet = !!pin;

  return (
    <PinContext.Provider value={{ isPinSet, isLocked, setPin, verifyPin, unlockApp, lockApp }}>
      {children}
    </PinContext.Provider>
  );
};

export const usePin = (): PinContextType => {
  const context = useContext(PinContext);
  if (!context) {
    throw new Error('usePin must be used within a PinProvider');
  }
  return context;
};
