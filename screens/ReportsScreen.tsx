import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { useData } from '../contexts/DataContext';
import { exportToCsv } from '../utils/export';
import { ChevronRight, FileOutput, FileArchive, UsersRound } from 'lucide-react';

const ReportsScreen: React.FC = () => {
    const navigate = useNavigate();
    const { sales, purchases, customers, products, getProductById, getCustomerById } = useData();

    // FIX: Updated handleExportSales to correctly process sales with multiple items.
    // A sale can contain multiple products, so we use flatMap to create a CSV row for each item sold.
    const handleExportSales = () => {
        const dataToExport = sales.flatMap(s => {
            const customer = s.customer_id ? getCustomerById(s.customer_id) : null;
            return s.items.map(item => {
                const product = getProductById(item.product_id);
                return {
                    bill_no: s.bill_no,
                    date: new Date(s.date_time).toLocaleDateString(),
                    customer_name: customer ? customer.name : 'N/A',
                    product_name: product ? product.name : 'N/A',
                    quantity: item.qty,
                    price_ex_gst: item.sell_price,
                    gst_percent: item.sell_gst,
                    discount: s.discount,
                    total_amount: s.total_amount,
                    payment_methods: s.payments.map(p => `${p.method}: ${p.amount}`).join(' | ')
                };
            });
        });
        exportToCsv('sales_export.csv', dataToExport);
    };

    const handleExportPurchases = () => {
        const dataToExport = purchases.map(p => {
            const product = getProductById(p.product_id);
            return {
                date: new Date(p.date_time).toLocaleDateString(),
                product_name: product ? product.name : 'N/A',
                quantity: p.qty,
                price_ex_gst: p.buy_price,
                gst_percent: p.buy_gst,
                total_amount: p.total_amount,
                payment_type: p.payment_type
            };
        });
        exportToCsv('purchases_export.csv', dataToExport);
    };

    const handleExportCustomers = () => {
        exportToCsv('customers_export.csv', customers);
    };

    const handleExportProducts = () => {
        const dataToExport = products.map(p => {
            const finalSell = p.sell_price * (1 + p.sell_gst / 100);
            return {
                ID: p.id,
                Name: p.name,
                Stock: p.stock,
                Category: p.category || 'N/A',
                'Buy Price (excl. GST)': p.buy_price,
                'Buy GST %': p.buy_gst,
                'Sell Price (excl. GST)': p.sell_price,
                'Sell GST %': p.sell_gst,
                'Final Sell Price': finalSell.toFixed(2),
                Status: p.is_active ? 'Active' : 'Inactive',
            };
        });
        exportToCsv('products_export.csv', dataToExport);
    };

    return (
        <PageWrapper>
            <h1 className="text-3xl font-bold font-poppins text-text-primary mb-6">Reports</h1>
            
            <div className="mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-3">Data Management</h2>
                <div className="space-y-2">
                    <button
                        onClick={() => navigate('/sales')}
                        className="w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors hover:bg-gray-500/10"
                    >
                        <div className="flex items-center">
                            <FileArchive className="mr-4 text-primary" size={24} />
                            <span className="font-semibold text-text-primary">View All Sales</span>
                        </div>
                        <ChevronRight className="text-text-secondary" />
                    </button>
                </div>
            </div>
            
            <div>
                <h2 className="text-xl font-bold text-text-primary mb-3">Data Export</h2>
                <div className="space-y-2">
                     <button
                        onClick={handleExportSales}
                        className="w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors hover:bg-gray-500/10"
                    >
                        <div className="flex items-center">
                            <FileOutput className="mr-4 text-primary" size={24} />
                            <span className="font-semibold text-text-primary">Export Sales to CSV</span>
                        </div>
                    </button>
                     <button
                        onClick={handleExportPurchases}
                        className="w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors hover:bg-gray-500/10"
                    >
                        <div className="flex items-center">
                            <FileOutput className="mr-4 text-primary" size={24} />
                            <span className="font-semibold text-text-primary">Export Purchases to CSV</span>
                        </div>
                    </button>
                     <button
                        onClick={handleExportProducts}
                        className="w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors hover:bg-gray-500/10"
                    >
                        <div className="flex items-center">
                            <FileArchive className="mr-4 text-primary" size={24} />
                            <span className="font-semibold text-text-primary">Export Products to CSV</span>
                        </div>
                    </button>
                     <button
                        onClick={handleExportCustomers}
                        className="w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors hover:bg-gray-500/10"
                    >
                        <div className="flex items-center">
                            <UsersRound className="mr-4 text-primary" size={24} />
                            <span className="font-semibold text-text-primary">Export Customers to CSV</span>
                        </div>
                    </button>
                </div>
            </div>

        </PageWrapper>
    );
};

export default ReportsScreen;