
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, Save } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const AddPaymentScreen: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const customerId = parseInt(id || '0');
    
    const { addPaymentReceived, getCustomerById } = useData();
    const customer = getCustomerById(customerId);
    
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId || !amount) {
            alert("Please enter a valid amount.");
            return;
        }
        addPaymentReceived({
            customer_id: customerId,
            amount: parseFloat(amount),
            method,
            date_time: new Date(date).toISOString(),
            notes
        });
        navigate(`/customer/${customerId}`);
    };

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <div>
                     <h1 className="text-2xl font-bold font-poppins text-text-primary">Add Payment</h1>
                     {customer && <p className="text-text-secondary">For: {customer.name}</p>}
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <Input 
                    label="Amount Received" 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    required
                    step="0.01"
                />
                
                <div>
                    <label htmlFor="method" className="block text-sm font-medium text-text-secondary mb-1">Payment Method</label>
                    <select 
                        id="method" 
                        value={method} 
                        onChange={e => setMethod(e.target.value as any)} 
                        className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </div>
                
                <Input 
                    label="Date" 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    required
                />
                
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Notes (optional)</label>
                    <textarea
                        id="notes"
                        rows={3}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g., Payment for last month's dues"
                    />
                </div>
                
                <div className="pt-4">
                     <Button type="submit" className="flex items-center justify-center">
                        <Save size={20} className="mr-2"/> SAVE PAYMENT
                     </Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddPaymentScreen;
