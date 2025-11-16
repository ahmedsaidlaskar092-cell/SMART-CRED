
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, ThemeContext } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import FirmSetupScreen from './screens/FirmSetupScreen';
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
import BulkAddProductScreen from './screens/BulkAddProductScreen';
import CustomerLedgerScreen from './screens/CustomerLedgerScreen';
import AddCreditScreen from './screens/AddCreditScreen';

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
};

const AppContent: React.FC = () => {
    const { theme } = React.useContext(ThemeContext);
    const { isAuthenticated, firmSetupComplete, deviceLimitReached } = useAuth();

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-dark');
        root.classList.add(`theme-${theme}`);
    }, [theme]);
    
    return (
        <div className="min-h-screen bg-background text-text-primary">
            <HashRouter>
                <Routes>
                    {!isAuthenticated ? (
                        <>
                            <Route path="/login" element={<LoginScreen />} />
                            <Route path="/signup" element={<SignUpScreen />} />
                            <Route path="/" element={<LandingScreen />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : deviceLimitReached ? (
                        <>
                            <Route path="/" element={<DeviceLimitScreen />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : !firmSetupComplete ? (
                        <>
                            <Route path="/" element={<FirmSetupScreen />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    ) : (
                        <>
                            <Route path="/" element={<DashboardScreen />} />
                            <Route path="/customers" element={<CustomersScreen />} />
                            <Route path="/customer/:id" element={<CustomerLedgerScreen />} />
                            <Route path="/add-credit" element={<AddCreditScreen />} />
                            <Route path="/products" element={<ProductsScreen />} />
                            <Route path="/add-product" element={<AddProductScreen />} />
                            <Route path="/bulk-add-products" element={<BulkAddProductScreen />} />
                            <Route path="/add-sale" element={<AddSaleScreen />} />
                            <Route path="/add-purchase" element={<AddPurchaseScreen />} />
                            <Route path="/reports" element={<ReportsScreen />} />
                            <Route path="/settings" element={<SettingsScreen />} />
                            <Route path="/settings/theme" element={<ThemeSelectorScreen />} />
                            <Route path="*" element={<Navigate to="/" />} />
                        </>
                    )}
                </Routes>
            </HashRouter>
        </div>
    );
}

export default App;
