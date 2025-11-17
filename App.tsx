
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { PinProvider, usePin } from './contexts/PinContext';

import SplashScreen from './components/SplashScreen';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import DeviceLimitScreen from './screens/DeviceLimitScreen';
import DashboardScreen from './screens/DashboardScreen';
import CustomersScreen from './screens/CustomersScreen';
import ProductsScreen from './screens/ProductsScreen';
import AddSaleScreen from './screens/AddSaleScreen';
import AddPurchaseScreen from './screens/AddPurchaseScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ThemeSelectorScreen from './screens/ThemeSelectorScreen';
import AddProductScreen from './screens/AddProductScreen';
import EditProductScreen from './screens/EditProductScreen';
import BulkAddProductScreen from './screens/BulkAddProductScreen';
import CustomerLedgerScreen from './screens/CustomerLedgerScreen';
import AddCreditScreen from './screens/AddCreditScreen';
import AddCustomerScreen from './screens/AddCustomerScreen';
import BillPreviewScreen from './screens/BillPreviewScreen';
import FirmSettingsScreen from './screens/FirmSettingsScreen';
import SalesListScreen from './screens/SalesListScreen';
import PinLockScreen from './screens/settings/PinLockScreen';
import BackupScreen from './screens/settings/BackupScreen';
import DeviceManagerScreen from './screens/settings/DeviceManagerScreen';
import PinEntryScreen from './screens/PinEntryScreen';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import LowStockScreen from './screens/LowStockScreen';
import MockDataScreen from './screens/settings/MockDataScreen';


const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <PinProvider>
                        <AppContent />
                    </PinProvider>
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

const AppContent: React.FC = () => {
    const { theme } = React.useContext(ThemeContext);
    const { isAuthenticated, deviceLimitReached } = useAuth();
    const { isLocked } = usePin();
    const [appLoading, setAppLoading] = useState(true);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-dark');
        root.classList.add(`theme-${theme}`);
    }, [theme]);

    useEffect(() => {
        const timer = setTimeout(() => setAppLoading(false), 2500); // Simulate app loading
        return () => clearTimeout(timer);
    }, []);

    if (appLoading) {
        return <SplashScreen />;
    }
    
    if (isAuthenticated && isLocked) {
        return <PinEntryScreen />;
    }

    return (
        <div className="min-h-screen bg-background text-text-primary">
            <HashRouter>
                {!isAuthenticated ? (
                    <Routes>
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/signup" element={<SignUpScreen />} />
                        <Route path="/" element={<LandingScreen />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                ) : deviceLimitReached ? (
                     <Routes>
                        <Route path="/" element={<DeviceLimitScreen />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                ) : (
                    <div className="relative min-h-screen md:flex">
                        <Sidebar />
                        <main className="flex-1 w-full md:ml-60">
                             <Routes>
                                <Route path="/" element={<DashboardScreen />} />
                                <Route path="/customers" element={<CustomersScreen />} />
                                <Route path="/add-customer" element={<AddCustomerScreen />} />
                                <Route path="/customer/:id" element={<CustomerLedgerScreen />} />
                                <Route path="/add-credit" element={<AddCreditScreen />} />
                                <Route path="/products" element={<ProductsScreen />} />
                                <Route path="/add-product" element={<AddProductScreen />} />
                                <Route path="/product/edit/:id" element={<EditProductScreen />} />
                                <Route path="/bulk-add-products" element={<BulkAddProductScreen />} />
                                <Route path="/add-sale" element={<AddSaleScreen />} />
                                <Route path="/bill/:saleId" element={<BillPreviewScreen />} />
                                <Route path="/add-purchase" element={<AddPurchaseScreen />} />
                                <Route path="/reports" element={<ReportsScreen />} />
                                <Route path="/sales" element={<SalesListScreen />} />
                                <Route path="/low-stock-products" element={<LowStockScreen />} />
                                <Route path="/settings" element={<SettingsScreen />} />
                                <Route path="/settings/firm" element={<FirmSettingsScreen />} />
                                <Route path="/settings/theme" element={<ThemeSelectorScreen />} />
                                <Route path="/settings/pin" element={<PinLockScreen />} />
                                <Route path="/settings/backup" element={<BackupScreen />} />
                                <Route path="/settings/mock-data" element={<MockDataScreen />} />
                                <Route path="/settings/devices" element={<DeviceManagerScreen />} />
                                {/* Fallback route for users who might have bookmarked the firm setup */}
                                <Route path="/firm-setup" element={<FirmSettingsScreen />} /> 
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                        <BottomNav />
                    </div>
                )}
            </HashRouter>
        </div>
    );
}

export default App;
