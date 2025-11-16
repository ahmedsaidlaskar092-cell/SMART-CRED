import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const AddCustomerScreen: React.FC = () => {
    const navigate = useNavigate();
    const { addCustomer } = useData();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !phone) {
            alert("Name and phone are required.");
            return;
        }
        addCustomer({name, phone, address});
        navigate('/customers');
    };

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Add Customer</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                <Input label="Full Name" id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Phone Number" id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required />
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">Address (optional)</label>
                    <textarea
                        id="address"
                        rows={3}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                
                <div className="mt-auto pt-4">
                    <Button type="submit">SAVE CUSTOMER</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddCustomerScreen;
