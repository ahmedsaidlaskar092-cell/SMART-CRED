import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, Filter, Plus, Users } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';

const CustomersScreen: React.FC = () => {
    const navigate = useNavigate();
    const { customers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        showOutstanding: false,
        sortBy: 'name_asc', // 'name_asc', 'name_desc', 'outstanding_desc', 'outstanding_asc'
    });

    const filteredCustomers = useMemo(() => {
        let customersToFilter = [...customers];
        
        // Filter
        if (filterOptions.showOutstanding) {
            customersToFilter = customersToFilter.filter(c => c.outstanding > 0);
        }

        // Search
        if (searchTerm) {
            customersToFilter = customersToFilter.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm)
            );
        }

        // Sort
        switch (filterOptions.sortBy) {
            case 'name_desc':
                customersToFilter.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'outstanding_desc':
                customersToFilter.sort((a, b) => b.outstanding - a.outstanding);
                break;
            case 'outstanding_asc':
                customersToFilter.sort((a, b) => a.outstanding - b.outstanding);
                break;
            case 'name_asc':
            default:
                customersToFilter.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }

        return customersToFilter;
    }, [customers, searchTerm, filterOptions]);

  return (
    <>
      <PageWrapper>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Customers</h1>
           <Button className="w-auto px-4 py-2 flex items-center" onClick={() => navigate('/add-customer')}>
            <Plus size={20} className="mr-2"/> New
          </Button>
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

        {filteredCustomers.length > 0 ? (
            <motion.div 
                className="space-y-3"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.05 } },
                }}
            >
            {filteredCustomers.map(customer => (
                <motion.div
                    key={customer.id}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                    }}
                >
                    <Card className="cursor-pointer transition-transform transform hover:scale-105" onClick={() => navigate(`/customer/${customer.id}`)}>
                    <div className="flex justify-between items-center">
                        <div>
                        <p className="font-bold text-text-primary">{customer.name}</p>
                        <p className="text-sm text-text-secondary">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                        <p className="text-sm text-text-secondary">Outstanding</p>
                        <p className={`font-bold ${customer.outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            ₹{customer.outstanding.toLocaleString('en-IN')}
                        </p>
                        </div>
                    </div>
                    </Card>
                </motion.div>
            ))}
            </motion.div>
        ) : (
            <EmptyState
                icon={<Users size={40} className="text-primary"/>}
                title="No Customers Yet"
                message="Add your first customer to start tracking their sales and credit."
                actionText="Add Customer"
                onAction={() => navigate('/add-customer')}
            />
        )}
      </PageWrapper>
      <Modal title="Filter & Sort Customers" isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-text-secondary">Filter</label>
                <div className="mt-2 flex items-center bg-background p-3 rounded-lg">
                    <input 
                        type="checkbox" 
                        id="outstanding" 
                        className="h-4 w-4 rounded border-gray-500 text-primary focus:ring-primary"
                        checked={filterOptions.showOutstanding}
                        onChange={(e) => setFilterOptions({...filterOptions, showOutstanding: e.target.checked})}
                    />
                    <label htmlFor="outstanding" className="ml-3 block text-sm font-medium text-text-primary">
                        Show only with outstanding balance
                    </label>
                </div>
            </div>
             <div>
                <label htmlFor="sort" className="text-sm font-medium text-text-secondary">Sort By</label>
                <select 
                    id="sort" 
                    className="w-full mt-2 bg-background border-none text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={filterOptions.sortBy}
                    onChange={(e) => setFilterOptions({...filterOptions, sortBy: e.target.value})}
                >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="outstanding_desc">Outstanding (High to Low)</option>
                    <option value="outstanding_asc">Outstanding (Low to High)</option>
                </select>
            </div>
            <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
        </div>
    </Modal>
      <BottomNav />
    </>
  );
};

export default CustomersScreen;