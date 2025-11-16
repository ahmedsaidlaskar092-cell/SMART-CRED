
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowUpRight, ArrowDownRight, IndianRupee, PlusCircle, Users, Archive, FileText } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { user, firm } = useAuth();
  const navigate = useNavigate();

  const summaryData = [
    { title: "Today's Sales", value: '12,500', trend: 'up' },
    { title: "Today's Purchases", value: '7,200', trend: 'down' },
    { title: "Today's Profit", value: '5,300', trend: 'up' },
    { title: "Pending Customer Credit", value: '45,800' },
  ];

  const quickActions = [
    { label: 'Add Sale', path: '/add-sale' },
    { label: 'Add Purchase', path: '/add-purchase' },
    { label: 'Give Credit', path: '/add-credit' },
    { label: 'Add Product', path: '/add-product' },
    { label: 'Add Customer', path: '/customers' },
    { label: 'View Reports', path: '/reports' },
  ];

  return (
    <>
      <PageWrapper>
        <header className="mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Welcome, {user?.full_name.split(' ')[0]}</h1>
          <p className="text-text-secondary">{firm?.name}</p>
        </header>

        <section className="mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-3">Today's Summary</h2>
            <div className="grid grid-cols-2 gap-4">
                {summaryData.map(item => (
                    <Card key={item.title} className="flex flex-col justify-between">
                        <p className="text-sm text-text-secondary">{item.title}</p>
                        <div className="flex items-baseline justify-between mt-2">
                           <p className="text-2xl font-bold text-text-primary flex items-center">
                               <IndianRupee size={20} className="mr-1"/> {item.value}
                           </p>
                           {item.trend && (
                               item.trend === 'up' ? 
                               <ArrowUpRight className="text-green-500" size={20}/> : 
                               <ArrowDownRight className="text-red-500" size={20}/>
                           )}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
        
        <section className="mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-3">GST & Stock</h2>
            <div className="grid grid-cols-2 gap-4">
                 <Card>
                    <p className="text-sm text-text-secondary">Net GST</p>
                    <p className="text-2xl font-bold text-text-primary mt-2 flex items-center"><IndianRupee size={20} className="mr-1"/> 1,845</p>
                </Card>
                 <Card>
                    <p className="text-sm text-text-secondary">Low Stock Products</p>
                    <p className="text-2xl font-bold text-text-primary mt-2">7</p>
                </Card>
            </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map(action => (
              <Button key={action.label} variant="secondary" className="h-20 text-md" onClick={() => navigate(action.path)}>
                {action.label}
              </Button>
            ))}
          </div>
        </section>
      </PageWrapper>
      <BottomNav />
    </>
  );
};

export default DashboardScreen;
