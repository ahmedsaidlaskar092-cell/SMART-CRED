
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { ArrowLeft, Archive, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';

const LowStockScreen: React.FC = () => {
    const navigate = useNavigate();
    const { products } = useData();

    const lowStockProducts = useMemo(() => {
        return products
            .filter(p => p.stock <= 5)
            .sort((a, b) => a.stock - b.stock);
    }, [products]);

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Low Stock Items</h1>
            </header>

            {lowStockProducts.length > 0 ? (
                <motion.div
                    className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                    }}
                >
                    {lowStockProducts.map(product => (
                        <motion.div
                            key={product.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <Card onClick={() => navigate(`/product/edit/${product.id}`)} className="h-full cursor-pointer transition-transform transform hover:scale-105">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-text-primary">{product.name}</p>
                                        <p className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                                            Stock: {product.stock}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <AlertTriangle className={`${product.stock === 0 ? 'text-red-600' : 'text-orange-500'}`} />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <EmptyState
                    icon={<Archive size={40} className="text-primary" />}
                    title="No Low Stock Items"
                    message="All your products have sufficient stock. Great job!"
                />
            )}
        </PageWrapper>
    );
};

export default LowStockScreen;
