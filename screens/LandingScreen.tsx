import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PackagePlus, History, ShoppingCart, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const highlightCards = [
    { icon: History, text: "Track credit & reminders" },
    { icon: ShoppingCart, text: "GST-ready sales & purchases" },
    { icon: PackagePlus, text: "Single & bulk product add" },
    { icon: Smartphone, text: "Multi-device owner access" }
];

const LandingScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 bg-background"
        >
            <div className="text-center w-full max-w-sm">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                >
                    <Logo className="w-24 h-24 mx-auto" />
                    <h1 className="text-3xl font-poppins font-bold text-text-primary mt-4">Simple GST Business Tracker</h1>
                    <p className="text-text-secondary mt-2">Smart GST billing, sales, purchases & credit tracking.</p>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-2 gap-4 my-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, staggerChildren: 0.1 }}
                >
                    {highlightCards.map((card, index) => (
                        <motion.div key={index} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                            <Card className="flex flex-col items-center justify-center p-4 h-full">
                                <card.icon className="w-8 h-8 text-primary mb-2" />
                                <span className="text-sm text-center font-medium text-text-primary">{card.text}</span>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div 
                    className="space-y-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <Button onClick={() => navigate('/signup')}>SIGN UP</Button>
                    <Button variant="outline" onClick={() => navigate('/login')}>LOGIN</Button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LandingScreen;