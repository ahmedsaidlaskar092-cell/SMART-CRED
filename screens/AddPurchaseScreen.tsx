import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';
import { useData } from '../contexts/DataContext';
import { Product } from '../types';

const AddPurchaseScreen: React.FC = () => {
    const navigate = useNavigate();
    const { products, addPurchase } = useData();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [isProductListOpen, setIsProductListOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [paymentType, setPaymentType] = useState('Cash Purchase');

    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch]);

    const buyPrice = selectedProduct?.buy_price || 0;
    const gstPercent = selectedProduct?.buy_gst || 0;

    const gstAmount = useMemo(() => buyPrice * quantity * (gstPercent / 100), [quantity, buyPrice, gstPercent]);
    const totalAmount = useMemo(() => buyPrice * quantity + gstAmount, [quantity, buyPrice, gstAmount]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            alert('Please select a product.');
            return;
        }
        addPurchase({
            product_id: selectedProduct.id,
            qty: quantity,
            buy_price: selectedProduct.buy_price,
            buy_gst: selectedProduct.buy_gst,
            payment_type: paymentType as any,
        });
        navigate('/');
    };

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">New Purchase</h1>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                <div className="relative">
                    <Input label="Product" id="product" type="text" placeholder="Search product..."
                        value={selectedProduct ? selectedProduct.name : productSearch}
                        onChange={e => { setSelectedProduct(null); setProductSearch(e.target.value); }}
                        onFocus={() => setIsProductListOpen(true)}
                        onBlur={() => setTimeout(() => setIsProductListOpen(false), 150)}
                        required
                    />
                    {isProductListOpen && filteredProducts.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="p-3 hover:bg-accent cursor-pointer" onClick={() => { setSelectedProduct(p); setProductSearch(p.name); setIsProductListOpen(false); }}>
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Input label="Quantity" id="quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />

                <div className="bg-card p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Buy Price (excl. GST)</span> <span>₹{buyPrice.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">GST %</span> <span>{gstPercent}%</span></div>
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">GST Amount</span> <span>₹{gstAmount.toFixed(2)}</span></div>
                    <hr className="border-gray-600 my-2" />
                    <div className="flex justify-between font-bold text-lg"><span className="text-text-primary">Total</span> <span className="text-primary">₹{totalAmount.toFixed(2)}</span></div>
                </div>
                
                <Input label="Supplier (optional)" id="supplier" type="text"/>
                
                <div>
                    <label htmlFor="payment_type" className="block text-sm font-medium text-text-secondary mb-1">Payment Type</label>
                    <select id="payment_type" value={paymentType} onChange={e => setPaymentType(e.target.value)} className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                        <option>Cash Purchase</option>
                        <option>Credit Purchase</option>
                    </select>
                </div>

                <div className="mt-auto pt-4">
                    <Button type="submit" disabled={!selectedProduct || quantity <= 0}>SAVE</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddPurchaseScreen;
