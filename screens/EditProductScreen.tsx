
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Product } from '../types';
import Card from '../components/ui/Card';

const EditProductScreen: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { getProductById, updateProduct } = useData();
    
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const productId = parseInt(id || '0');
        const existingProduct = getProductById(productId);
        if (existingProduct) {
            setProduct(existingProduct);
        } else {
            navigate('/products');
        }
    }, [id, getProductById, navigate]);
    
    const handleChange = (field: keyof Omit<Product, 'id' | 'firm_id'>, value: string | number | boolean) => {
        if (product) {
            setProduct({ ...product, [field]: value });
        }
    };

    const finalBuyPrice = useMemo(() => (product?.buy_price || 0) * (1 + (product?.buy_gst || 0) / 100), [product]);
    const finalSellPrice = useMemo(() => (product?.sell_price || 0) * (1 + (product?.sell_gst || 0) / 100), [product]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            updateProduct({
                ...product,
                buy_price: parseFloat(String(product.buy_price)) || 0,
                buy_gst: parseFloat(String(product.buy_gst)) || 0,
                sell_price: parseFloat(String(product.sell_price)) || 0,
                sell_gst: parseFloat(String(product.sell_gst)) || 0,
                stock: parseInt(String(product.stock)) || 0,
            });
            navigate('/products');
        }
    };
    
    if (!product) {
        return <PageWrapper><div>Loading...</div></PageWrapper>;
    }

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Edit Product</h1>
            </header>

            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                <div className="flex-grow">
                     <div className="md:grid md:grid-cols-2 md:gap-x-8">
                        {/* Column 1: Core Details & Pricing */}
                        <div className="space-y-4">
                            <Input label="Product Name" id="name" type="text" value={product.name} onChange={e => handleChange('name', e.target.value)} required />
                            
                            <Card className="space-y-4">
                               <h3 className="font-semibold text-text-primary">Buying Details</h3>
                               <div className="grid grid-cols-2 gap-4">
                                    <Input label="Buying Price (no GST)" id="buy_price" type="number" value={product.buy_price} onChange={e => handleChange('buy_price', e.target.value)} />
                                    <Input label="Buy GST %" id="buy_gst" type="number" value={product.buy_gst} onChange={e => handleChange('buy_gst', e.target.value)} />
                                </div>
                                <p className="text-sm text-text-secondary">Final Buy Price: <span className="font-bold text-text-primary">₹{finalBuyPrice.toFixed(2)}</span></p>
                            </Card>

                            <Card className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Selling Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Selling Price (no GST)" id="sell_price" type="number" value={product.sell_price} onChange={e => handleChange('sell_price', e.target.value)} required />
                                    <Input label="Sell GST %" id="sell_gst" type="number" value={product.sell_gst} onChange={e => handleChange('sell_gst', e.target.value)} />
                                </div>
                                <p className="text-sm text-text-secondary">Final Sell Price: <span className="font-bold text-text-primary">₹{finalSellPrice.toFixed(2)}</span></p>
                            </Card>
                        </div>

                        {/* Column 2: Inventory & Status */}
                        <div className="space-y-4 mt-4 md:mt-0">
                           <Card className="space-y-4">
                                <h3 className="font-semibold text-text-primary">Inventory & Status</h3>
                                <Input label="Stock Quantity" id="stock" type="number" value={product.stock} onChange={e => handleChange('stock', e.target.value)} />
                                <Input label="Category (optional)" id="category" type="text" value={product.category || ''} onChange={e => handleChange('category', e.target.value)} />
                                
                                <div className="flex justify-between items-center bg-background p-3 rounded-lg">
                                    <label htmlFor="is_active" className="font-medium text-text-primary">Product Active</label>
                                    <button type="button" onClick={() => handleChange('is_active', !product.is_active)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${product.is_active ? 'bg-primary' : 'bg-gray-600'}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${product.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                           </Card>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6">
                    <Button type="submit">SAVE CHANGES</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default EditProductScreen;
