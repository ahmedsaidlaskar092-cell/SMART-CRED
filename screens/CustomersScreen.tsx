
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, Filter, Plus } from 'lucide-react';
import { Customer } from '../types';

const mockCustomers: Customer[] = [
  { id: 1, firm_id: 1, name: 'Aarav Sharma', phone: '9876543210', outstanding: 1500, totalPaid: 5000 },
  { id: 2, firm_id: 1, name: 'Priya Patel', phone: '8765432109', outstanding: 0, totalPaid: 12000 },
  { id: 3, firm_id: 1, name: 'Rohan Singh', phone: '7654321098', outstanding: 850, totalPaid: 2500 },
];

const CustomersScreen: React.FC = () => {
    const navigate = useNavigate();

  return (
    <>
      <PageWrapper>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Customers</h1>
           <Button className="w-auto px-4 py-2" onClick={() => { /* Add logic */ }}>
            <Plus size={20} className="mr-2"/> New
          </Button>
        </header>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
            <input type="text" placeholder="Search by name or phone" className="w-full bg-card border-none rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <button className="p-3 bg-card rounded-lg">
            <Filter className="text-text-primary" size={20}/>
          </button>
        </div>

        <div className="space-y-3">
          {mockCustomers.map(customer => (
            <Card key={customer.id} className="cursor-pointer" onClick={() => navigate(`/customer/${customer.id}`)}>
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
          ))}
        </div>
      </PageWrapper>
      <BottomNav />
    </>
  );
};

export default CustomersScreen;
