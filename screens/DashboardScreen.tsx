import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, TrendingUp, Users, Package } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { user, firm } = useAuth();
  const { sales, purchases, customers } = useData();
  const navigate = useNavigate();

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    const todaysSales = sales.filter(s => new Date(s.date_time).toDateString() === today);
    const todaysPurchases = purchases.filter(p => new Date(p.date_time).toDateString() === today);

    const totalSales = todaysSales.reduce((acc, s) => acc + s.total_amount, 0);
    const totalPurchases = todaysPurchases.reduce((acc, p) => acc + p.total_amount, 0);
    const totalProfit = totalSales - totalPurchases;
    const totalCredit = customers.reduce((acc, c) => acc + c.outstanding, 0);

    return { totalSales, totalPurchases, totalProfit, totalCredit };
  }, [sales, purchases, customers]);

  const summaryData = [
    { title: "Today's Sales", value: summary.totalSales.toLocaleString('en-IN'), trend: 'up', icon: TrendingUp, color: 'bg-green-500' },
    { title: "Today's Purchases", value: summary.totalPurchases.toLocaleString('en-IN'), trend: 'down', icon: ShoppingCart, color: 'bg-blue-500' },
    { title: "Pending Credit", value: summary.totalCredit.toLocaleString('en-IN'), icon: Users, color: 'bg-red-500' },
    { title: "Today's Profit", value: summary.totalProfit.toLocaleString('en-IN'), trend: 'up', icon: IndianRupee, color: 'bg-yellow-500' },
  ];

  const quickActions = [
    { label: 'Add Sale', path: '/add-sale' },
    { label: 'Add Purchase', path: '/add-purchase' },
    { label: 'Give Credit', path: '/add-credit' },
    { label: 'Add Product', path: '/add-product' },
    { label: 'Add Customer', path: '/add-customer' },
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
            <div className="grid grid-cols-2 gap-4">
                {summaryData.map(item => (
                    <Card key={item.title} className="flex flex-col justify-between">
                         <div className="flex items-start justify-between">
                            <p className="text-sm text-text-secondary font-medium">{item.title}</p>
                            <div className={`p-2 rounded-full ${item.color}`}>
                                <item.icon size={16} className="text-white"/>
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between mt-2">
                           <p className="text-2xl font-bold text-text-primary flex items-center">
                               <IndianRupee size={20} className="mr-1"/>{item.value}
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

        <section>
          <h2 className="text-xl font-bold text-text-primary mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
