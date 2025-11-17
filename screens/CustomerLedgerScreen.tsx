import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Phone, CreditCard, Send, Trash2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { LedgerEntry, PaymentReceived } from '../types';
import { useAuth } from '../contexts/AuthContext';
import ReminderModal from '../components/ReminderModal';
import Modal from '../components/ui/Modal';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'year';

const CustomerLedgerScreen: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { firm } = useAuth();
    const { getCustomerById, getSalesByCustomerId, getPaymentsByCustomerId, deletePaymentReceived } = useData();
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [isReminderOpen, setIsReminderOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState<PaymentReceived | null>(null);

    const customerId = parseInt(id || '0');
    const customer = getCustomerById(customerId);
    
    const periodData = useMemo(() => {
        if (!customerId) return { summary: { openingBalance: 0, totalDebits: 0, totalCredits: 0, closingBalance: 0 }, filteredLedgerEntries: [] };
        
        const customerSales = getSalesByCustomerId(customerId);
        const customerPayments = getPaymentsByCustomerId(customerId);

        const combined: Omit<LedgerEntry, 'balance'>[] = [
            ...customerSales.map(sale => ({ id: `sale-${sale.id}`, date: new Date(sale.date_time), type: 'sale' as const, description: `Sale - Bill #${sale.bill_no}`, debit: sale.total_amount, credit: 0, originalEntry: sale })),
            ...customerPayments.map(payment => ({ id: `payment-${payment.id}`, date: new Date(payment.date_time), type: 'payment' as const, description: `Payment Received - ${payment.method}`, debit: 0, credit: payment.amount, originalEntry: payment }))
        ];
        
        const sorted = combined.sort((a, b) => a.date.getTime() - b.date.getTime());

        let runningBalance = 0;
        const fullLedger = sorted.map(entry => {
            runningBalance += entry.debit - entry.credit;
            return { ...entry, balance: runningBalance };
        });
        
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        let startDate: Date | null = null;
        switch(dateFilter) {
            case 'today': startDate = todayStart; break;
            case 'week': startDate = weekStart; break;
            case 'month': startDate = monthStart; break;
            case 'year': startDate = yearStart; break;
            default: startDate = null;
        }

        const entriesBeforePeriod = startDate ? fullLedger.filter(entry => entry.date < startDate!) : [];
        const openingBalance = entriesBeforePeriod.length > 0 ? entriesBeforePeriod[entriesBeforePeriod.length - 1].balance : 0;
        
        const entriesInPeriod = startDate ? fullLedger.filter(entry => entry.date >= startDate!) : fullLedger;
        
        const totalDebits = entriesInPeriod.reduce((acc, entry) => acc + entry.debit, 0);
        const totalCredits = entriesInPeriod.reduce((acc, entry) => acc + entry.credit, 0);
        
        let periodRunningBalance = openingBalance;
        const filteredLedgerEntries = entriesInPeriod.map(entry => {
            periodRunningBalance += entry.debit - entry.credit;
            return { ...entry, balance: periodRunningBalance };
        });

        const closingBalance = openingBalance + totalDebits - totalCredits;

        const summary = { openingBalance, totalDebits, totalCredits, closingBalance };
        
        return { summary, filteredLedgerEntries };

    }, [customerId, getSalesByCustomerId, getPaymentsByCustomerId, dateFilter]);
    
    const handleDeletePayment = () => {
        if (paymentToDelete) {
            deletePaymentReceived(paymentToDelete.id);
            setPaymentToDelete(null);
        }
    };

    if (!customer) {
        return <PageWrapper><div className="text-center mt-10"><h1 className="text-2xl font-bold">Customer not found</h1><Button onClick={() => navigate('/customers')} className="mt-4 w-auto px-6">Go to Customers</Button></div></PageWrapper>
    }

    const dateFilters: { label: string, key: DateFilter }[] = [
        { label: 'All Time', key: 'all' },
        { label: 'Today', key: 'today' },
        { label: 'This Week', key: 'week' },
        { label: 'This Month', key: 'month' },
        { label: 'This Year', key: 'year' }
    ];

    return (
        <>
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <div>
                    <h1 className="text-2xl font-bold font-poppins text-text-primary">{customer.name}</h1>
                    <p className="text-text-secondary">{customer.phone}</p>
                </div>
            </header>
            
            <Card className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center md:text-left"><p className="text-sm text-text-secondary">Opening Bal</p><p className="font-bold text-text-primary mt-1">₹{periodData.summary.openingBalance.toLocaleString('en-IN')}</p></div>
                <div className="text-center md:text-left"><p className="text-sm text-text-secondary">Total Debit</p><p className="font-bold text-red-500 mt-1">₹{periodData.summary.totalDebits.toLocaleString('en-IN')}</p></div>
                <div className="text-center md:text-left"><p className="text-sm text-text-secondary">Total Credit</p><p className="font-bold text-green-500 mt-1">₹{periodData.summary.totalCredits.toLocaleString('en-IN')}</p></div>
                <div className="text-center md:text-left"><p className="text-sm text-text-secondary">Closing Bal</p><p className="font-bold text-text-primary mt-1">₹{periodData.summary.closingBalance.toLocaleString('en-IN')}</p></div>
            </Card>

            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <Button onClick={() => navigate(`/customer/${customerId}/add-payment`)} className="flex flex-col items-center p-2 rounded-lg hover:bg-card h-auto bg-transparent text-text-primary font-normal">
                    <CreditCard className="text-primary mb-1"/> <span className="text-xs">Add Payment</span>
                </Button>
                <Button onClick={() => setIsReminderOpen(true)} className="flex flex-col items-center p-2 rounded-lg hover:bg-card h-auto bg-transparent text-text-primary font-normal">
                    <Send className="text-primary mb-1"/> <span className="text-xs">Send Reminder</span>
                </Button>
                <a href={`tel:${customer.phone}`} className="flex flex-col items-center p-2 rounded-lg hover:bg-card">
                    <Phone className="text-primary mb-1"/> <span className="text-xs text-text-primary">Call</span>
                </a>
            </div>
            
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary">Ledger Statement</h2>
                <div className="bg-card p-1 rounded-lg flex flex-wrap">
                    {dateFilters.map(filter => (
                        <button key={filter.key} onClick={() => setDateFilter(filter.key)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${dateFilter === filter.key ? 'bg-primary text-white' : 'text-text-secondary hover:bg-accent'}`}>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b border-gray-700/50"><th className="p-3 text-sm font-semibold text-text-secondary">Date</th><th className="p-3 text-sm font-semibold text-text-secondary">Particulars</th><th className="p-3 text-sm font-semibold text-text-secondary text-right">Debit</th><th className="p-3 text-sm font-semibold text-text-secondary text-right">Credit</th><th className="p-3 text-sm font-semibold text-text-secondary text-right">Balance</th><th className="p-3 text-sm font-semibold text-text-secondary text-center"></th></tr></thead>
                    <tbody>
                        {periodData.filteredLedgerEntries.map(entry => (
                            <tr key={entry.id} className="border-b border-gray-700/50 last:border-b-0 hover:bg-accent/50">
                                <td className="p-3 text-xs text-text-secondary">{entry.date.toLocaleDateString()}</td>
                                <td className="p-3 font-medium text-text-primary cursor-pointer" onClick={() => entry.type === 'sale' && navigate(`/bill/${entry.originalEntry.id}`)}>{entry.description}</td>
                                <td className="p-3 text-text-primary text-right">{entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '-'}</td>
                                <td className="p-3 text-green-500 text-right">{entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '-'}</td>
                                <td className="p-3 font-bold text-right">{`₹${entry.balance.toFixed(2)}`}</td>
                                <td className="p-3 text-center">{entry.type === 'payment' && (<button onClick={() => setPaymentToDelete(entry.originalEntry as PaymentReceived)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {periodData.filteredLedgerEntries.length === 0 && <p className="text-center text-text-secondary p-4">No transactions in this period.</p>}
            </Card>
        </PageWrapper>

        {firm && customer && (
            <ReminderModal 
                isOpen={isReminderOpen}
                onClose={() => setIsReminderOpen(false)}
                customer={customer}
                firm={firm}
                dueAmount={periodData.summary.closingBalance}
            />
        )}
        <Modal title="Confirm Deletion" isOpen={!!paymentToDelete} onClose={() => setPaymentToDelete(null)}>
            <p className="text-text-primary mb-4">Are you sure you want to delete this payment of <span className="font-bold">₹{paymentToDelete?.amount.toFixed(2)}</span>? This action will update the customer's balance and cannot be undone.</p>
            <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setPaymentToDelete(null)}>Cancel</Button>
                <Button onClick={handleDeletePayment} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
        </Modal>
        </>
    );
};

export default CustomerLedgerScreen;