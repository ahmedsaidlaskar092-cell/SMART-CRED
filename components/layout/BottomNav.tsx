
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Archive, FileText, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/products', icon: Archive, label: 'Products' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-gray-700/50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
                `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-text-secondary hover:text-primary'
                }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
