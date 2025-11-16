
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Firm } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firm: Firm | null;
  firmSetupComplete: boolean;
  deviceLimitReached: boolean;
  login: () => void;
  logout: () => void;
  completeFirmSetup: (firmDetails: Firm) => void;
  updateFirm: (updatedFirmDetails: Partial<Firm>) => void;
  setDeviceLimitReached: (isReached: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [firmSetupComplete, setFirmSetupComplete] = useState<boolean>(false);
  const [deviceLimitReached, setDeviceLimitReached] = useState<boolean>(false);


  const login = () => {
    // Mock login logic
    setIsAuthenticated(true);
    setUser({ id: 1, firm_id: 1, full_name: 'John Doe', email: 'owner@example.com', role: 'owner' });
    // In a real app, you would check if the firm is set up. We'll assume not for the flow.
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setFirm(null);
    setFirmSetupComplete(false);
  };

  const completeFirmSetup = (firmDetails: Firm) => {
    setFirm(firmDetails);
    setFirmSetupComplete(true);
  };

  const updateFirm = (updatedFirmDetails: Partial<Firm>) => {
    if (firm) {
        setFirm({ ...firm, ...updatedFirmDetails });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, firm, firmSetupComplete, deviceLimitReached, login, logout, completeFirmSetup, updateFirm, setDeviceLimitReached }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};