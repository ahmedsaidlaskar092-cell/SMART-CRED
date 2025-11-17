
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, TrendingUp, Users, AlertTriangle, FileText } from 'lucide-react';

const DashboardScreen: React.FC = () => {
  const { user, firm } = useAuth();
  const { sales, purchases, customers, products, getCustomerById } = useData();
  const navigate = useNavigate();

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    const todaysSales = sales.filter(s => new Date(s.date_time).toDateString() === today);
    const todaysPurchases = purchases.filter(p => new Date(p.date_time).toDateString() === today);

    const totalSales = todaysSales.reduce((acc, s) => acc + s.total_amount, 0);
    const totalPurchases = todaysPurchases.reduce((acc, p) => acc + p.total_amount, 0);
    
    const totalProfit = todaysSales.reduce((acc, s) => {
      const saleProfit = s.items.reduce((itemAcc, item) => {
          const profitPerItem = (item.sell_price - item.buy_price_at_sale) * item.qty;
          return itemAcc + profitPerItem;
      }, 0);
      return acc + saleProfit - s.discount;
    }, 0);

    const totalCredit = customers.reduce((acc, c) => acc + c.outstanding, 0);
    
    const lowStockCount = products.filter(p => p.stock <= 5).length;

    const recentSales = sales
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime())
      .slice(0, 5);

    return { totalSales, totalPurchases, totalProfit, totalCredit, lowStockCount, recentSales };
  }, [sales, purchases, customers, products]);

  const summaryData = [
    { title: "Today's Sales", value: summary.totalSales.toLocaleString('en-IN'), trend: 'up', icon: TrendingUp, color: 'bg-green-500' },
    { title: "Today's Purchases", value: summary.totalPurchases.toLocaleString('en-IN'), trend: 'down', icon: ShoppingCart, color: 'bg-blue-500' },
    { title: "Pending Credit", value: summary.totalCredit.toLocaleString('en-IN'), icon: Users, color: 'bg-red-500' },
    { title: "Today's Profit", value: summary.totalProfit.toLocaleString('en-IN'), trend: 'up', icon: IndianRupee, color: 'bg-yellow-500' },
  ];
  
  const alertData = [
      { title: "Low Stock Items", value: summary.lowStockCount, icon: AlertTriangle, color: 'bg-orange-500', path: '/low-stock-products' }
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
    <PageWrapper>
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-poppins text-text-primary">Welcome, {user?.full_name.split(' ')[0]}</h1>
        <p className="text-text-secondary">{firm?.name}</p>
      </header>

      <section className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                             {item.title.includes("Profit") || item.title.includes("Sales") || item.title.includes("Credit") ? <IndianRupee size={20} className="mr-1"/> : null}
                             {item.value}
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

      <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-text-primary mb-3">Recent Sales</h2>
            <Card className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700/50">
                                <th className="p-3 text-sm font-semibold text-text-secondary">Bill No.</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Customer</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Items</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary text-right">Amount</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.recentSales.map(sale => {
                                const customer = sale.customer_id ? getCustomerById(sale.customer_id) : null;
                                return (
                                    <tr key={sale.id} className="border-b border-gray-700/50 last:border-b-0 hover:bg-accent/50">
                                        <td className="p-3 font-medium text-text-primary">{sale.bill_no}</td>
                                        <td className="p-3 text-text-secondary">{customer?.name || 'Walk-in'}</td>
                                        <td className="p-3 text-text-secondary">{sale.items.length}</td>
                                        <td className="p-3 font-medium text-text-primary text-right">₹{sale.total_amount.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => navigate(`/bill/${sale.id}`)} className="p-1 text-primary hover:text-blue-400">
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <h2 className="text-xl font-bold text-text-primary mb-3">Alerts</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {alertData.map(item => (
                  <Card key={item.title} onClick={() => navigate(item.path)} className="flex flex-col justify-between cursor-pointer hover:bg-gray-500/10 transition-colors">
                       <div className="flex items-start justify-between">
                          <p className="text-sm text-text-secondary font-medium">{item.title}</p>
                          <div className={`p-2 rounded-full ${item.color}`}>
                              <item.icon size={16} className="text-white"/>
                          </div>
                      </div>
                      <div className="flex items-baseline justify-between mt-2">
                         <p className="text-2xl font-bold text-text-primary flex items-center">
                             {item.value}
                         </p>
                      </div>
                  </Card>
              ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-text-primary mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map(action => (
            <Button key={action.label} variant="secondary" className="h-20 text-md" onClick={() => navigate(action.path)}>
              {action.label}
            </Button>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};

export default DashboardScreen;