import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ArrowLeft, Save, MessageSquare, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Customer, Product } from '../types';

const AddCreditScreen: React.FC = () => {
    const navigate = useNavigate();
    const { customers, products, addCreditEntry } = useData();
    
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [isProductListOpen, setIsProductListOpen] = useState(false);

    const [amount, setAmount] = useState('');
    const [gst, setGst] = useState('0');
    const [dueDate, setDueDate] = useState('');

    const filteredCustomers = useMemo(() => 
        customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())), 
    [customers, customerSearch]);

    const filteredProducts = useMemo(() => 
        products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())), 
    [products, productSearch]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer || !amount || !dueDate) {
            alert("Please select a customer, enter an amount, and set a due date.");
            return;
        }
        addCreditEntry({
            customer_id: selectedCustomer.id,
            product_id: selectedProduct?.id,
            productName: selectedProduct?.name,
            amount: parseFloat(amount),
            gst: parseFloat(gst),
            due_date: dueDate,
        });
        navigate(`/customer/${selectedCustomer.id}`);
    };

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Give Credit</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col">
                {/* Customer Searchable Input */}
                <div className="relative">
                    <Input label="Customer" id="customer" type="text" placeholder="Search customer..." 
                        value={selectedCustomer ? selectedCustomer.name : customerSearch}
                        onChange={e => { setSelectedCustomer(null); setCustomerSearch(e.target.value); }}
                        onFocus={() => setIsCustomerListOpen(true)}
                        onBlur={() => setTimeout(() => setIsCustomerListOpen(false), 150)}
                        required
                    />
                    {isCustomerListOpen && filteredCustomers.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredCustomers.map(c => (
                                <div key={c.id} className="p-3 hover:bg-accent cursor-pointer" onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setIsCustomerListOpen(false); }}>
                                    {c.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                 {/* Product Searchable Input */}
                <div className="relative">
                    <Input label="Product (optional)" id="product" type="text" placeholder="Search product..." 
                        value={selectedProduct ? selectedProduct.name : productSearch}
                        onChange={e => { setSelectedProduct(null); setProductSearch(e.target.value); }}
                        onFocus={() => setIsProductListOpen(true)}
                        onBlur={() => setTimeout(() => setIsProductListOpen(false), 150)}
                    />
                    {selectedProduct && <button type="button" onClick={() => setSelectedProduct(null)} className="absolute right-3 top-9 text-text-secondary"><X size={18}/></button>}
                    {isProductListOpen && filteredProducts.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-card border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="p-3 hover:bg-accent cursor-pointer" onClick={() => { setSelectedProduct(p); setProductSearch(p.name); setAmount(p.sell_price.toString()); setGst(p.sell_gst.toString()); setIsProductListOpen(false); }}>
                                    {p.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <Input label="Amount (excl. GST)" id="amount" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required/>
                <div>
                    <label htmlFor="gst" className="block text-sm font-medium text-text-secondary mb-1">GST %</label>
                    <select id="gst" value={gst} onChange={e => setGst(e.target.value)} className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                    </select>
                </div>
                <Input label="Due Date" id="due_date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required/>
                
                <div className="mt-auto pt-4 space-y-3">
                     <Button type="submit" className="flex items-center justify-center">
                        <Save size={20} className="mr-2"/> SAVE
                     </Button>
                     <Button type="button" variant="outline" className="flex items-center justify-center">
                        <MessageSquare size={20} className="mr-2"/> SAVE & SEND WHATSAPP
                     </Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddCreditScreen;
