
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Building, Smartphone, Palette, UploadCloud, Lock, LogOut } from 'lucide-react';

const SettingsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    
    const settingsItems = [
      { icon: Building, label: 'Firm Settings', path: '/settings/firm' },
      { icon: Smartphone, label: 'Device Manager', path: '/settings/devices' },
      { icon: Palette, label: 'App Theme', path: '/settings/theme' },
      { icon: UploadCloud, label: 'Export / Backup', path: '/settings/backup' },
      { icon: Lock, label: 'App PIN Lock', path: '/settings/pin' },
      { icon: LogOut, label: 'Logout', action: logout, isDestructive: true },
    ];

  return (
    <>
      <PageWrapper>
        <h1 className="text-3xl font-bold font-poppins text-text-primary mb-8">Settings</h1>

        <div className="space-y-2">
            {settingsItems.map(item => (
                <button
                    key={item.label}
                    onClick={() => item.path ? navigate(item.path) : item.action && item.action()}
                    className={`w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors ${item.isDestructive ? 'text-red-500 hover:bg-red-500/10' : 'hover:bg-gray-500/10'}`}
                >
                    <div className="flex items-center">
                        <item.icon className={`mr-4 ${item.isDestructive ? 'text-red-500' : 'text-primary'}`} size={24} />
                        <span className="font-semibold text-text-primary">{item.label}</span>
                    </div>
                    {!item.action && <ChevronRight className="text-text-secondary" />}
                </button>
            ))}
        </div>

      </PageWrapper>
      <BottomNav />
    </>
  );
};

export default SettingsScreen;
