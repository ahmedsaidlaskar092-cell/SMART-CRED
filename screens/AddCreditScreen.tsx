
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, Save, MessageSquare } from 'lucide-react';

const AddCreditScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Give Credit</h1>
            </header>

            <form className="space-y-4 flex-grow flex flex-col">
                <Input label="Customer" id="customer" type="text" placeholder="Search customer..."/>
                <Input label="Product (optional)" id="product" type="text" placeholder="Search product..."/>
                <Input label="Amount" id="amount" type="number" placeholder="0.00"/>
                <div>
                    <label htmlFor="gst" className="block text-sm font-medium text-text-secondary mb-1">GST %</label>
                    <select id="gst" className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                        <option>0%</option>
                        <option>5%</option>
                        <option>12%</option>
                        <option>18%</option>
                        <option>28%</option>
                    </select>
                </div>
                <Input label="Due Date" id="due_date" type="date"/>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Notes (optional)</label>
                    <textarea id="notes" rows={3} className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div className="mt-auto pt-4 space-y-3">
                     <Button type="submit" className="flex items-center justify-center">
                        <Save size={20} className="mr-2"/> SAVE
                     </Button>
                     <Button type="button" variant="outline" className="flex items-center justify-center">
                        <MessageSquare size={20} className="mr-2"/> SAVE & SEND WHATSAPP
                     </Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddCreditScreen;
