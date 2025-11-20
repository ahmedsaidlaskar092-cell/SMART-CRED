
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowUpRight, ArrowDownRight, IndianRupee, ShoppingCart, TrendingUp, Users, AlertTriangle, FileText, Sparkles, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardScreen: React.FC = () => {
  const { user, firm } = useAuth();
  const { sales, purchases, customers, products, getCustomerById, businessInsight, generateBusinessInsights, isGeneratingInsight } = useData();
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
    { label: 'Give Credit', path: '/credit' },
    { label: 'Add Product', path: '/add-product' },
    { label: 'Add Customer', path: '/add-customer' },
    { label: 'View Reports', path: '/reports' },
  ];

  return (
    <PageWrapper>
      <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold font-poppins text-text-primary">Welcome, {user?.full_name.split(' ')[0]}</h1>
            <p className="text-text-secondary">{firm?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 hidden md:block">
             <p className="text-sm text-text-secondary text-right">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* AI Insights Section */}
      <section className="mb-8">
        <div className="rounded-xl bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 p-1">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-indigo-500" size={20} />
                        <h2 className="text-lg font-bold text-text-primary bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                            AI Business Insights
                        </h2>
                    </div>
                    <button 
                        onClick={generateBusinessInsights} 
                        disabled={isGeneratingInsight}
                        className={`p-2 rounded-full hover:bg-indigo-500/10 transition-all text-indigo-500 ${isGeneratingInsight ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw size={18} />
                    </button>
                </div>
                
                <AnimatePresence mode="wait">
                    {isGeneratingInsight ? (
                         <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="py-4 flex items-center justify-center text-indigo-500 font-medium"
                         >
                            <Sparkles className="mr-2 animate-pulse" size={16}/> Analyzing your business data...
                        </motion.div>
                    ) : businessInsight ? (
                        <motion.div
                             key="content"
                             initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-text-primary leading-relaxed">{businessInsight.text}</p>
                            <p className="text-xs text-text-secondary mt-3">
                                Last updated: {new Date(businessInsight.lastUpdated).toLocaleTimeString()}
                            </p>
                        </motion.div>
                    ) : (
                         <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-2 text-center"
                        >
                            <p className="text-text-secondary mb-3">Get daily strategic insights powered by Gemini AI.</p>
                            <Button onClick={generateBusinessInsights} className="w-auto px-6 bg-indigo-600 hover:bg-indigo-700">Generate Insight</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </section>

      <section className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryData.map(item => (
                  <Card key={item.title} className="flex flex-col justify-between transition-transform hover:scale-105 cursor-default">
                       <div className="flex items-start justify-between">
                          <p className="text-sm text-text-secondary font-medium">{item.title}</p>
                          <div className={`p-2 rounded-full ${item.color} bg-opacity-90`}>
                              <item.icon size={16} className="text-white"/>
                          </div>
                      </div>
                      <div className="flex items-baseline justify-between mt-4">
                         <p className="text-2xl font-bold text-text-primary flex items-center">
                             {item.title.includes("Profit") || item.title.includes("Sales") || item.title.includes("Credit") ? <IndianRupee size={20} className="mr-1 text-text-secondary"/> : null}
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
          <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-text-primary">Recent Sales</h2>
              <button onClick={() => navigate('/sales')} className="text-sm text-primary hover:underline">View All</button>
          </div>
            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700/50 bg-accent/30">
                                <th className="p-3 text-sm font-semibold text-text-secondary">Bill No.</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Customer</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Items</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary text-right">Amount</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.recentSales.length > 0 ? summary.recentSales.map(sale => {
                                const customer = sale.customer_id ? getCustomerById(sale.customer_id) : null;
                                return (
                                    <tr key={sale.id} className="border-b border-gray-700/50 last:border-b-0 hover:bg-accent/50 transition-colors">
                                        <td className="p-3 font-medium text-text-primary">{sale.bill_no}</td>
                                        <td className="p-3 text-text-secondary truncate max-w-[150px]">{customer?.name || 'Walk-in'}</td>
                                        <td className="p-3 text-text-secondary text-center">{sale.items.length}</td>
                                        <td className="p-3 font-medium text-text-primary text-right">₹{sale.total_amount.toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => navigate(`/bill/${sale.id}`)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-text-secondary">No sales recorded today.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <h2 className="text-xl font-bold text-text-primary mb-3">Alerts</h2>
             <div className="flex flex-col gap-4">
              {alertData.map(item => (
                  <Card key={item.title} onClick={() => navigate(item.path)} className="flex flex-col justify-between cursor-pointer hover:bg-gray-500/10 transition-colors border-l-4 border-orange-500">
                       <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-text-secondary font-medium">{item.title}</p>
                            <p className="text-2xl font-bold text-text-primary mt-1">{item.value}</p>
                          </div>
                          <div className={`p-2 rounded-full ${item.color}`}>
                              <item.icon size={18} className="text-white"/>
                          </div>
                      </div>
                      {item.value > 0 && <p className="text-xs text-orange-500 mt-2 font-medium">Action Required</p>}
                  </Card>
              ))}
              <Card className="bg-accent/30">
                  <h3 className="font-bold text-text-primary text-sm mb-2">Pro Tip</h3>
                  <p className="text-xs text-text-secondary">Regularly updating your stock ensures accurate profit calculations and prevents stockouts.</p>
              </Card>
          </div>
        </div>
      </section>

      <section className="pb-6">
        <h2 className="text-xl font-bold text-text-primary mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map(action => (
            <Button key={action.label} variant="secondary" className="h-20 text-sm md:text-md flex flex-col items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all" onClick={() => navigate(action.path)}>
              {action.label}
            </Button>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};

export default DashboardScreen;
