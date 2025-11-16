import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Search, Filter, Trash2, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';
import { Sale } from '../types';
import EmptyState from '../components/ui/EmptyState';

const SalesListScreen: React.FC = () => {
    const navigate = useNavigate();
    const { sales, customers, getCustomerById, getProductById, deleteSale } = useData();

    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ customerId: '', startDate: '', endDate: '' });
    
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

    const filteredSales = useMemo(() => {
        return sales
            .filter(sale => {
                const customer = sale.customer_id ? getCustomerById(sale.customer_id) : null;
                const saleDate = new Date(sale.date_time);

                const searchTermMatch = sale.bill_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (customer && customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
                
                const customerFilterMatch = !filters.customerId || sale.customer_id === parseInt(filters.customerId);
                const startDateMatch = !filters.startDate || saleDate >= new Date(filters.startDate);
                const endDateMatch = !filters.endDate || saleDate <= new Date(filters.endDate + 'T23:59:59');

                return searchTermMatch && customerFilterMatch && startDateMatch && endDateMatch;
            })
            .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
    }, [sales, searchTerm, filters, getCustomerById]);
    
    const handleDeleteConfirm = () => {
        if(saleToDelete) {
            deleteSale(saleToDelete.id);
            setSaleToDelete(null);
        }
    }

    return (
        <>
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-3xl font-bold font-poppins text-text-primary">All Sales</h1>
            </header>

            <div className="flex gap-2 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
                    <input 
                        type="text" 
                        placeholder="Search bill no. or customer" 
                        className="w-full bg-card border-none rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary outline-none" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => setIsFilterOpen(true)} className="p-3 bg-card rounded-lg">
                    <Filter className="text-text-primary" size={20}/>
                </button>
            </div>
            
            {filteredSales.length > 0 ? (
                 <motion.div 
                    className="space-y-3"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                    {filteredSales.map(sale => {
                        const customer = sale.customer_id ? getCustomerById(sale.customer_id) : null;
                        const product = getProductById(sale.product_id);
                        return (
                            <motion.div
                                key={sale.id}
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <Card>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-text-primary">{sale.bill_no}</p>
                                            <p className="text-sm text-text-secondary">{customer?.name || 'Walk-in Customer'}</p>
                                            <p className="text-xs text-text-secondary">{new Date(sale.date_time).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-primary">₹{sale.total_amount.toLocaleString('en-IN')}</p>
                                            <p className="text-sm text-text-secondary">{product?.name || 'Product'} x {sale.qty}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-3 border-t border-gray-700/50 pt-3">
                                        <Button onClick={() => navigate(`/bill/${sale.id}`)} variant="outline" className="flex-1 py-1 text-sm flex items-center justify-center"><FileText size={14} className="mr-2"/> View Bill</Button>
                                        <Button onClick={() => setSaleToDelete(sale)} variant="ghost" className="flex-1 py-1 text-sm text-red-500 flex items-center justify-center"><Trash2 size={14} className="mr-2"/> Delete</Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })}
                 </motion.div>
            ) : (
                <EmptyState
                    icon={<FileText size={40} className="text-primary"/>}
                    title="No Sales Found"
                    message="No sales match your current search or filters. Try adjusting them or create a new sale."
                />
            )}

        </PageWrapper>
        
        <Modal title="Filter Sales" isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
             <div className="space-y-4">
                <div>
                    <label htmlFor="customer_filter" className="text-sm font-medium text-text-secondary">Customer</label>
                    <select
                        id="customer_filter"
                        className="w-full mt-2 bg-background border-none text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                        value={filters.customerId}
                        onChange={(e) => setFilters({...filters, customerId: e.target.value})}
                    >
                        <option value="">All Customers</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="start_date" className="text-sm font-medium text-text-secondary">Start Date</label>
                        <input type="date" id="start_date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} className="w-full mt-2 bg-background border-none text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"/>
                    </div>
                     <div>
                        <label htmlFor="end_date" className="text-sm font-medium text-text-secondary">End Date</label>
                        <input type="date" id="end_date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} className="w-full mt-2 bg-background border-none text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"/>
                    </div>
                </div>
                 <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
             </div>
        </Modal>

        <Modal title="Confirm Deletion" isOpen={!!saleToDelete} onClose={() => setSaleToDelete(null)}>
            <p className="text-text-primary mb-4">Are you sure you want to delete bill <span className="font-bold">{saleToDelete?.bill_no}</span>? This will restore the product stock and reverse any credit entry. This action cannot be undone.</p>
            <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setSaleToDelete(null)}>Cancel</Button>
                <Button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
        </Modal>
        </>
    )
};

export default SalesListScreen;
