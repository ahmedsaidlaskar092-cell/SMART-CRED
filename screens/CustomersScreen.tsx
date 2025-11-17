
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, Filter, Plus, Users, LayoutGrid, List, ChevronsUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';
import { Customer } from '../types';

type SortKey = keyof Customer | 'outstanding';
type SortDirection = 'ascending' | 'descending';

const CustomersScreen: React.FC = () => {
    const navigate = useNavigate();
    const { customers } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'ascending' });
    
    const [filterOptions, setFilterOptions] = useState({
        showOutstanding: false,
    });

    const sortedCustomers = useMemo(() => {
        let customersToFilter = [...customers];
        
        if (filterOptions.showOutstanding) {
            customersToFilter = customersToFilter.filter(c => c.outstanding > 0);
        }

        if (searchTerm) {
            customersToFilter = customersToFilter.filter(customer =>
                customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.phone.includes(searchTerm)
            );
        }

        customersToFilter.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return customersToFilter;
    }, [customers, searchTerm, filterOptions, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) {
            return <ChevronsUpDown size={16} className="ml-2 text-text-secondary" />;
        }
        if (sortConfig.direction === 'ascending') {
            return <ChevronUp size={16} className="ml-2" />;
        }
        return <ChevronDown size={16} className="ml-2" />;
    };

    const renderTableView = () => (
      <Card className="p-0 overflow-x-auto">
          <table className="w-full text-left">
              <thead>
                  <tr className="border-b border-gray-700/50">
                      <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer" onClick={() => requestSort('name')}>
                          <div className="flex items-center">Name {getSortIcon('name')}</div>
                      </th>
                      <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer" onClick={() => requestSort('phone')}>
                          <div className="flex items-center">Phone {getSortIcon('phone')}</div>
                      </th>
                      <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer text-right" onClick={() => requestSort('outstanding')}>
                          <div className="flex items-center justify-end">Outstanding {getSortIcon('outstanding')}</div>
                      </th>
                  </tr>
              </thead>
              <tbody>
                  {sortedCustomers.map(customer => (
                      <tr key={customer.id} className="border-b border-gray-700/50 last:border-b-0 hover:bg-accent/50 cursor-pointer" onClick={() => navigate(`/customer/${customer.id}`)}>
                          <td className="p-3 font-medium text-text-primary">{customer.name}</td>
                          <td className="p-3 text-text-secondary">{customer.phone}</td>
                          <td className={`p-3 font-bold text-right ${customer.outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                              ₹{customer.outstanding.toLocaleString('en-IN')}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </Card>
    );

    const renderCardView = () => (
        <motion.div 
            className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.05 } },
            }}
        >
            {sortedCustomers.map(customer => (
                <motion.div
                    key={customer.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                    <Card className="cursor-pointer transition-transform transform hover:scale-105 h-full" onClick={() => navigate(`/customer/${customer.id}`)}>
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
    );

  return (
    <>
      <PageWrapper>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Customers</h1>
           <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center bg-card rounded-lg p-1">
                  <button onClick={() => setViewMode('card')} className={`p-2 rounded ${viewMode === 'card' ? 'bg-primary text-white' : 'text-text-secondary'}`}><LayoutGrid size={20}/></button>
                  <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary'}`}><List size={20}/></button>
              </div>
              <Button className="w-auto px-4 py-2 flex items-center" onClick={() => navigate('/add-customer')}>
                  <Plus size={20} className="mr-2"/> New
              </Button>
           </div>
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

        {sortedCustomers.length > 0 ? (
            <div className="hidden md:block">
                {viewMode === 'card' ? renderCardView() : renderTableView()}
            </div>
        ) : (
            <EmptyState
                icon={<Users size={40} className="text-primary"/>}
                title="No Customers Yet"
                message="Add your first customer to start tracking their sales and credit."
                actionText="Add Customer"
                onAction={() => navigate('/add-customer')}
            />
        )}
        
        {/* Always render card view on mobile */}
        <div className="md:hidden">
            {sortedCustomers.length > 0 ? renderCardView() : null}
        </div>

      </PageWrapper>
      <Modal title="Filter Customers" isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
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
            <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
        </div>
    </Modal>
    </>
  );
};

export default CustomersScreen;
