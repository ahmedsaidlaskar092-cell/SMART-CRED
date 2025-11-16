
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Input from '../components/ui/Input';

const AddPurchaseScreen: React.FC = () => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const buyPrice = 100; // Mocked
    const gstPercent = 18; // Mocked

    const gstAmount = useMemo(() => buyPrice * quantity * (gstPercent / 100), [quantity, buyPrice, gstPercent]);
    const totalAmount = useMemo(() => buyPrice * quantity + gstAmount, [quantity, buyPrice, gstAmount]);

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">New Purchase</h1>
            </header>
            
            <form className="space-y-4 flex-grow flex flex-col">
                <Input label="Product" id="product" type="text" placeholder="Search product..."/>
                <Input label="Quantity" id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />

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
                    <select id="payment_type" className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                        <option>Cash Purchase</option>
                        <option>Credit Purchase</option>
                    </select>
                </div>

                <div className="mt-auto pt-4">
                    <Button type="submit">SAVE</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddPurchaseScreen;
