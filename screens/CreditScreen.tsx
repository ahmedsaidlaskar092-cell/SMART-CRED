import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import { CreditCard, Send, Search, Filter } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import { Customer } from '../types';
import ReminderModal from '../components/ReminderModal';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

type SortOption = 'highest-due' | 'lowest-due' | 'name-asc' | 'name-desc';

const CreditScreen: React.FC = () => {
    const navigate = useNavigate();
    const { customers } = useData();
    const { firm } = useAuth();
    
    const [customerToRemind, setCustomerToRemind] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('highest-due');

    const filteredAndSortedCustomers = useMemo(() => {
        let customersToProcess = customers.filter(c => c.outstanding > 0);

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            customersToProcess = customersToProcess.filter(c => 
                c.name.toLowerCase().includes(lowerCaseSearch) ||
                c.phone.includes(searchTerm)
            );
        }

        switch(sortOption) {
            case 'highest-due':
                return customersToProcess.sort((a, b) => b.outstanding - a.outstanding);
            case 'lowest-due':
                return customersToProcess.sort((a, b) => a.outstanding - b.outstanding);
            case 'name-asc':
                return customersToProcess.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return customersToProcess.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return customersToProcess;
        }
    }, [customers, searchTerm, sortOption]);

    const totalOutstanding = useMemo(() => {
        return filteredAndSortedCustomers.reduce((acc, customer) => acc + customer.outstanding, 0);
    }, [filteredAndSortedCustomers]);

    return (
        <>
        <PageWrapper>
            <header className="mb-6">
                <h1 className="text-3xl font-bold font-poppins text-text-primary">Credit / Dues</h1>
                <p className="text-text-secondary">Track all outstanding customer payments.</p>
            </header>

            <div className="flex gap-2 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Search by name or phone" 
                        className="w-full bg-card border-none rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary outline-none" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => setIsFilterOpen(true)} className="p-3 bg-card rounded-lg">
                    <Filter className="text-text-primary" size={20}/>
                </button>
            </div>
            
            <Card className="mb-6">
                <p className="text-sm text-text-secondary">Total Outstanding (Filtered)</p>
                <p className="text-3xl font-bold text-red-500 mt-1">₹{totalOutstanding.toLocaleString('en-IN')}</p>
            </Card>

            {filteredAndSortedCustomers.length > 0 ? (
                <motion.div
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.05 } },
                    }}
                >
                    {filteredAndSortedCustomers.map(customer => (
                        <motion.div
                            key={customer.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                            }}
                        >
                            <Card
                                className="transition-all"
                            >
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => navigate(`/customer/${customer.id}`)}>
                                    <div>
                                        <p className="font-bold text-text-primary">{customer.name}</p>
                                        <p className="text-sm text-text-secondary">{customer.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-text-secondary">Outstanding</p>
                                        <p className="font-bold text-red-500">
                                            ₹{customer.outstanding.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-700/50">
                                    <Button 
                                        variant="ghost" 
                                        className="w-auto px-4 py-1 h-auto text-sm"
                                        onClick={(e) => { e.stopPropagation(); setCustomerToRemind(customer); }}
                                    >
                                        <Send size={16} className="mr-2" />
                                        Send Reminder
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <EmptyState
                    icon={<CreditCard size={40} className="text-primary" />}
                    title={searchTerm ? "No Matches Found" : "All Clear!"}
                    message={searchTerm ? "No customers match your search." : "No customers have any outstanding dues. Great work on collections!"}
                />
            )}
        </PageWrapper>
        {firm && customerToRemind && (
            <ReminderModal
                isOpen={!!customerToRemind}
                onClose={() => setCustomerToRemind(null)}
                customer={customerToRemind}
                firm={firm}
                dueAmount={customerToRemind.outstanding}
            />
        )}
        <Modal title="Sort & Filter" isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
            <div className="space-y-4">
                <label className="text-sm font-medium text-text-secondary">Sort by</label>
                <div className="flex flex-col gap-2">
                    {(['highest-due', 'lowest-due', 'name-asc', 'name-desc'] as SortOption[]).map(option => (
                        <button key={option} onClick={() => { setSortOption(option); setIsFilterOpen(false); }} className={`p-3 rounded-lg text-left ${sortOption === option ? 'bg-primary text-white' : 'bg-background hover:bg-accent'}`}>
                            {option.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>
        </Modal>
        </>
    );
};

export default CreditScreen;