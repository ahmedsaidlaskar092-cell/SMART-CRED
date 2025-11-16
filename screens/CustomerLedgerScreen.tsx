import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Phone, MessageSquare, CreditCard, Send, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';

const CustomerLedgerScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCustomerById, getCreditEntriesByCustomerId, markCreditAsPaid, sales, getProductById } = useData();

    const customerId = parseInt(id || '0');
    const customer = getCustomerById(customerId);
    
    const transactionHistory = useMemo(() => {
        if (!customerId) return [];
        
        const customerCreditHistory = getCreditEntriesByCustomerId(customerId);
        const customerSalesHistory = sales.filter(s => s.customer_id === customerId);

        const combined = [
            ...customerCreditHistory.map(entry => ({
                id: `credit-${entry.id}`,
                date: new Date(entry.date_time),
                type: 'credit' as const,
                description: entry.productName || 'Misc. Credit',
                amount: entry.amount * (1 + entry.gst / 100),
                status: entry.status,
                originalEntry: entry,
            })),
            ...customerSalesHistory.map(sale => ({
                id: `sale-${sale.id}`,
                date: new Date(sale.date_time),
                type: 'sale' as const,
                description: `${getProductById(sale.product_id)?.name || 'Product'} (x${sale.qty})`,
                amount: sale.total_amount,
                status: 'COMPLETED' as const,
                originalEntry: sale,
            }))
        ];
        
        return combined.sort((a, b) => b.date.getTime() - a.date.getTime());

    }, [customerId, getCreditEntriesByCustomerId, sales, getProductById]);
    
    if (!customer) {
        return (
            <PageWrapper>
                <div className="text-center mt-10">
                    <h1 className="text-2xl font-bold">Customer not found</h1>
                    <Button onClick={() => navigate('/customers')} className="mt-4 w-auto px-6">Go to Customers</Button>
                </div>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <div>
                    <h1 className="text-2xl font-bold font-poppins text-text-primary">{customer.name}</h1>
                    <p className="text-text-secondary">{customer.phone}</p>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                    <p className="text-sm text-text-secondary">Outstanding</p>
                    <p className="text-2xl font-bold text-red-500 mt-1">₹{customer.outstanding.toLocaleString('en-IN')}</p>
                </Card>
                <Card>
                    <p className="text-sm text-text-secondary">Total Paid</p>
                    <p className="text-2xl font-bold text-green-500 mt-1">₹{customer.totalPaid.toLocaleString('en-IN')}</p>
                </Card>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-8 text-center">
                <button onClick={() => navigate('/add-credit')} className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><CreditCard className="text-primary mb-1"/> <span className="text-xs">Give Credit</span></button>
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><Send className="text-primary mb-1"/> <span className="text-xs">Reminder</span></button>
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><Phone className="text-primary mb-1"/> <span className="text-xs">Call</span></button>
                <button className="flex flex-col items-center p-2 rounded-lg hover:bg-card"><MessageSquare className="text-primary mb-1"/> <span className="text-xs">WhatsApp</span></button>
            </div>
            
            <h2 className="text-xl font-bold text-text-primary mb-4">Transaction History</h2>
            <div className="space-y-3">
                {transactionHistory.length > 0 ? transactionHistory.map(item => (
                    <Card key={item.id}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{item.description}</p>
                                <p className="text-xs text-text-secondary">{item.date.toLocaleString()}</p>
                                {item.type === 'credit' && <p className="text-xs text-text-secondary">Due: {new Date(item.originalEntry.due_date).toLocaleDateString()}</p>}
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${item.type === 'sale' ? '' : 'text-red-500'}`}>₹{item.amount.toLocaleString('en-IN')}</p>
                                {item.type === 'credit' && <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === 'PENDING' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>{item.status}</span>}
                                {item.type === 'sale' && <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">SALE</span>}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                            {item.type === 'credit' && item.status === 'PENDING' && <Button onClick={() => markCreditAsPaid(item.originalEntry.id)} variant="secondary" className="flex-1 py-1 text-sm">Mark as Paid</Button>}
                            {item.type === 'sale' && <Button onClick={() => navigate(`/bill/${item.originalEntry.id}`)} variant="outline" className="flex-1 py-1 text-sm flex items-center justify-center"><FileText size={14} className="mr-2"/> View Bill</Button>}
                        </div>
                    </Card>
                )) : (
                    <p className="text-center text-text-secondary mt-4">No transaction history found.</p>
                )}
            </div>
        </PageWrapper>
    );
};

export default CustomerLedgerScreen;