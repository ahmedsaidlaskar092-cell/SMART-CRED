
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Phone, MessageSquare, CreditCard, Send } from 'lucide-react';
import { CreditEntry, Customer } from '../types';

const mockCustomer: Customer = { id: 1, firm_id: 1, name: 'Aarav Sharma', phone: '9876543210', outstanding: 1500, totalPaid: 5000 };
const mockCreditHistory: CreditEntry[] = [
    { id: 1, firm_id: 1, customer_id: 1, productName: 'Product A', amount: 1000, gst: 18, due_date: '2024-08-15', date_time: '2024-07-15T10:00:00Z', status: 'PAID'},
    { id: 2, firm_id: 1, customer_id: 1, productName: 'Product B', amount: 1500, gst: 12, due_date: '2024-08-20', date_time: '2024-07-20T14:30:00Z', status: 'PENDING'},
];

const CustomerLedgerScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <div>
                    <h1 className="text-2xl font-bold font-poppins text-text-primary">{mockCustomer.name}</h1>
                    <p className="text-text-secondary">{mockCustomer.phone}</p>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <p className="text-sm text-text-secondary">Outstanding</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">₹{mockCustomer.outstanding.toLocaleString('en-IN')}</p>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Total Paid</p>
                    <p className="text-2xl font-bold text-green-500 mt-1">₹{mockCustomer.totalPaid.toLocaleString('en-IN')}</p>
                </Card>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-8 text-center">
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><CreditCard className="text-primary mb-1"/> <span className="text-xs">Give Credit</span></button>
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><Send className="text-primary mb-1"/> <span className="text-xs">Reminder</span></button>
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><Phone className="text-primary mb-1"/> <span className="text-xs">Call</span></button>
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><MessageSquare className="text-primary mb-1"/> <span className="text-xs">WhatsApp</span></button>
            </div>
            
            <h2 className="text-xl font-bold text-text-primary mb-4">Credit History</h2>
            <div className="space-y-3">
                {mockCreditHistory.map(entry => (
                    <Card key={entry.id}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{entry.productName}</p>
                                <p className="text-xs text-text-secondary">{new Date(entry.date_time).toLocaleString()}</p>
                                <p className="text-xs text-text-secondary">Due: {new Date(entry.due_date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">₹{entry.amount.toLocaleString('en-IN')}</p>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${entry.status === 'PENDING' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{entry.status}</span>
                            </div>
                        </div>
                        {entry.status === 'PENDING' && <Button variant="secondary" className="w-full mt-3 py-1 text-sm">Mark as Paid</Button>}
                    </Card>
                ))}
            </div>
        </PageWrapper>
    );
};

export default CustomerLedgerScreen;
