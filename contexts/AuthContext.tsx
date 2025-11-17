import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Firm, Device } from '../types';

// A helper hook to persist state to localStorage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (e) {
            console.warn(`Error reading localStorage key “${key}”:`, e);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Error setting localStorage key “${key}”:`, e);
        }
    }, [key, value]);

    return [value, setValue];
};

const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
        deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  firm: Firm | null;
  devices: Device[];
  currentDeviceId: string;
  deviceLimitReached: boolean;
  login: () => void;
  logout: () => void;
  updateFirm: (updatedFirmDetails: Partial<Firm>) => void;
  removeDevice: (deviceId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [deviceLimitReached, setDeviceLimitReached] = useState<boolean>(false);
  const [devices, setDevices] = useStickyState<Device[]>([], 'auth_devices');
  const [currentDeviceId] = useState<string>(getDeviceId());


  const login = () => {
    const isKnownDevice = devices.some(d => d.id === currentDeviceId);

    if (devices.length >= 3 && !isKnownDevice) {
        setDeviceLimitReached(true);
        setIsAuthenticated(false);
        return;
    }

    const mockUser = { id: 1, firm_id: 1, full_name: 'John Doe', email: 'owner@example.com', role: 'owner' as const };
    const mockFirm = {
        id: 1,
        name: 'My Business',
        owner_name: mockUser.full_name,
        address: '123 Main St, Anytown',
        phone: '+911234567890',
        gstin: '',
        tagline: 'Quality you can trust',
        default_gst: 18,
    };
    
    setIsAuthenticated(true);
    setUser(mockUser);
    setFirm(mockFirm);
    setDeviceLimitReached(false);
    
    // Register or update device
    setDevices(prevDevices => {
        const existingDeviceIndex = prevDevices.findIndex(d => d.id === currentDeviceId);
        
        if (existingDeviceIndex > -1) {
            const updatedDevices = [...prevDevices];
            updatedDevices[existingDeviceIndex].lastLogin = new Date().toISOString();
            return updatedDevices;
        } else {
             // Simple naming convention, find highest number and add 1
            const deviceNumbers = prevDevices.map(d => parseInt(d.name.replace('Device ', ''))).filter(n => !isNaN(n));
            const nextDeviceNumber = deviceNumbers.length > 0 ? Math.max(...deviceNumbers) + 1 : 1;
            const deviceName = `Device ${nextDeviceNumber}`;
            
            return [...prevDevices, {
                id: currentDeviceId,
                name: deviceName,
                lastLogin: new Date().toISOString()
            }];
        }
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setFirm(null);
    setDeviceLimitReached(false);
  };

  const updateFirm = (updatedFirmDetails: Partial<Firm>) => {
    if (firm) {
        const detailsToSave = { ...updatedFirmDetails };
        if (detailsToSave.phone && !detailsToSave.phone.startsWith('+91')) {
            detailsToSave.phone = `+91${detailsToSave.phone}`;
        }
        const newFirm = { ...firm, ...detailsToSave };
        setFirm(newFirm);
        if (updatedFirmDetails.owner_name && user) {
            setUser(prevUser => ({...prevUser!, full_name: updatedFirmDetails.owner_name!}));
        }
    }
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, firm, devices, currentDeviceId, deviceLimitReached, login, logout, updateFirm, removeDevice }}>
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