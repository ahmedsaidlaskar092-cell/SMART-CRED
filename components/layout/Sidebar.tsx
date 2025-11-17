
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Archive, FileText, Settings, CreditCard } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/credit', icon: CreditCard, label: 'Credit' },
  { path: '/products', icon: Archive, label: 'Products' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
    const { firm } = useAuth();
  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-card border-r border-gray-700/50 hidden md:flex flex-col z-10">
        <div className="p-4 border-b border-gray-700/50 flex flex-col items-center text-center">
            <Logo className="w-16 h-16"/>
            <h2 className="text-lg font-bold font-poppins text-text-primary mt-2 truncate w-full" title={firm?.name}>{firm?.name}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
            <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => 
                    `flex items-center py-3 px-4 rounded-lg transition-colors duration-200 ${
                        isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-accent hover:text-primary'
                    }`
                }
            >
                <item.icon size={20} className="mr-3" />
                <span className="font-semibold">{item.label}</span>
            </NavLink>
            ))}
      </nav>
    </aside>
  );
};

export default Sidebar;