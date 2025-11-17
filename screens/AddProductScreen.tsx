
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';

const AddProductScreen: React.FC = () => {
    const navigate = useNavigate();
    const { addProduct } = useData();
    const { firm } = useAuth();

    const [name, setName] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [buyGst, setBuyGst] = useState(firm?.default_gst?.toString() || '');
    const [sellPrice, setSellPrice] = useState('');
    const [sellGst, setSellGst] = useState(firm?.default_gst?.toString() || '');
    const [stock, setStock] = useState('0');
    const [category, setCategory] = useState('');
    const [isActive, setIsActive] = useState(true);
    
    const finalBuyPrice = useMemo(() => (parseFloat(buyPrice) || 0) * (1 + (parseFloat(buyGst) || 0) / 100), [buyPrice, buyGst]);
    const finalSellPrice = useMemo(() => (parseFloat(sellPrice) || 0) * (1 + (parseFloat(sellGst) || 0) / 100), [sellPrice, sellGst]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addProduct({
            name,
            buy_price: parseFloat(buyPrice) || 0,
            buy_gst: parseFloat(buyGst) || 0,
            sell_price: parseFloat(sellPrice) || 0,
            sell_gst: parseFloat(sellGst) || 0,
            stock: parseInt(stock) || 0,
            category,
            is_active: isActive
        });
        navigate('/products');
    };

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Add Product</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                <div className="flex-grow">
                    <div className="md:grid md:grid-cols-2 md:gap-x-8">
                        {/* Column 1: Core Details & Pricing */}
                        <div className="space-y-4">
                            <Input label="Product Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                            
                            <Card className="space-y-4">
                               <h3 className="font-semibold text-text-primary">Buying Details</h3>
                               <div className="grid grid-cols-2 gap-4">
                                    <Input label="Buying Price (no GST)" id="buy_price" type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
                                    <Input label="Buy GST %" id="buy_gst" type="number" value={buyGst} onChange={e => setBuyGst(e.target.value)} />
                                </div>
                                <p className="text-sm text-text-secondary">Final Buy Price: <span className="font-bold text-text-primary">₹{finalBuyPrice.toFixed(2)}</span></p>
                            </Card>

                            <Card className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Selling Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Selling Price (no GST)" id="sell_price" type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} required/>
                                    <Input label="Sell GST %" id="sell_gst" type="number" value={sellGst} onChange={e => setSellGst(e.target.value)} />
                                </div>
                                <p className="text-sm text-text-secondary">Final Sell Price: <span className="font-bold text-text-primary">₹{finalSellPrice.toFixed(2)}</span></p>
                            </Card>
                        </div>

                        {/* Column 2: Inventory & Status */}
                        <div className="space-y-4 mt-4 md:mt-0">
                           <Card className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Inventory & Status</h3>
                                <Input label="Stock Quantity" id="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} />
                                <Input label="Category (optional)" id="category" type="text" value={category} onChange={e => setCategory(e.target.value)} />
                                
                                <div className="flex justify-between items-center bg-background p-3 rounded-lg">
                                    <label htmlFor="is_active" className="font-medium text-text-primary">Product Active</label>
                                    <button type="button" onClick={() => setIsActive(!isActive)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isActive ? 'bg-primary' : 'bg-gray-600'}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                           </Card>
                        </div>
                    </div>
                </div>
                
                <div className="mt-auto pt-6">
                    <Button type="submit">SAVE PRODUCT</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddProductScreen;
