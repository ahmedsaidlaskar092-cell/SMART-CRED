
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { ThemeContext } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const themes: { name: string; key: Theme; colors: { primary: string; bg: string; card: string } }[] = [
    { name: 'Classic Blue', key: 'blue', colors: { primary: '#1E88E5', bg: '#FFFFFF', card: '#F5F5F5' } },
    { name: 'Emerald Green', key: 'green', colors: { primary: '#2ECC71', bg: '#FFFFFF', card: '#F3F3F3' } },
    { name: 'Royal Purple', key: 'purple', colors: { primary: '#8E44AD', bg: '#FFFFFF', card: '#F2F2F2' } },
    { name: 'Dark Mode', key: 'dark', colors: { primary: '#00C3FF', bg: '#0A0A0A', card: '#1C1C1C' } },
];

const ThemeSelectorScreen: React.FC = () => {
    const navigate = useNavigate();
    const { theme: currentTheme, setTheme } = useContext(ThemeContext);

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Choose Theme</h1>
            </header>

            <div className="grid grid-cols-2 gap-4">
                {themes.map(themeOption => (
                    <div key={themeOption.key} onClick={() => setTheme(themeOption.key)} className="cursor-pointer">
                        <Card className={`relative border-2 ${currentTheme === themeOption.key ? 'border-primary' : 'border-transparent'}`}>
                            {currentTheme === themeOption.key &&
                                <CheckCircle className="absolute top-2 right-2 text-primary bg-background rounded-full" size={24}/>
                            }
                            <div className="w-full h-24 rounded-md mb-3" style={{ backgroundColor: themeOption.colors.bg }}>
                                <div className="p-2 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-center">
                                        <div style={{ backgroundColor: themeOption.colors.primary }} className="w-6 h-6 rounded-full"></div>
                                        <div style={{ backgroundColor: themeOption.colors.card }} className="w-10 h-3 rounded-sm"></div>
                                    </div>
                                    <div style={{ backgroundColor: themeOption.colors.card }} className="w-full h-8 rounded-md"></div>
                                </div>
                            </div>
                            <p className="font-semibold text-center text-text-primary">{themeOption.name}</p>
                        </Card>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
};

export default ThemeSelectorScreen;
