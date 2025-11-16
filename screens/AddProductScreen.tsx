
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const AddProductScreen: React.FC = () => {
    const navigate = useNavigate();
    const [buyPrice, setBuyPrice] = useState(0);
    const [buyGst, setBuyGst] = useState(0);
    const [sellPrice, setSellPrice] = useState(0);
    const [sellGst, setSellGst] = useState(0);
    const [isActive, setIsActive] = useState(true);
    
    const finalBuyPrice = useMemo(() => buyPrice * (1 + buyGst / 100), [buyPrice, buyGst]);
    const finalSellPrice = useMemo(() => sellPrice * (1 + sellGst / 100), [sellPrice, sellGst]);

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Add Product</h1>
            </header>

            <form className="space-y-4 flex-grow flex flex-col">
                <Input label="Product Name" id="name" type="text" required />
                
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Buying Price (no GST)" id="buy_price" type="number" onChange={e => setBuyPrice(parseFloat(e.target.value) || 0)} />
                    <Input label="Buy GST %" id="buy_gst" type="number" onChange={e => setBuyGst(parseFloat(e.target.value) || 0)} />
                </div>
                <p className="text-sm text-text-secondary -mt-2">Final Buy Price (with GST): <span className="font-bold text-text-primary">₹{finalBuyPrice.toFixed(2)}</span></p>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="Selling Price (no GST)" id="sell_price" type="number" onChange={e => setSellPrice(parseFloat(e.target.value) || 0)} />
                    <Input label="Sell GST %" id="sell_gst" type="number" onChange={e => setSellGst(parseFloat(e.target.value) || 0)} />
                </div>
                <p className="text-sm text-text-secondary -mt-2">Final Sell Price (with GST): <span className="font-bold text-text-primary">₹{finalSellPrice.toFixed(2)}</span></p>
                
                <Input label="Stock Quantity" id="stock" type="number" defaultValue={0} />
                <Input label="Category (optional)" id="category" type="text" />
                
                <div className="flex justify-between items-center bg-card p-3 rounded-lg">
                    <label htmlFor="is_active" className="font-medium text-text-primary">Product Active</label>
                    <button type="button" onClick={() => setIsActive(!isActive)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isActive ? 'bg-primary' : 'bg-gray-600'}`}>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
                
                <div className="mt-auto pt-4">
                    <Button type="submit">SAVE</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddProductScreen;
