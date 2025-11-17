
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Input from '../components/ui/Input';
import { useData } from '../contexts/DataContext';
import { Product, Customer, Payment } from '../types';
import Card from '../components/ui/Card';

const AddSaleScreen: React.FC = () => {
    const navigate = useNavigate();
    const { products, customers, addSale } = useData();

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [productSearch, setProductSearch] = useState('');
    const [isProductListOpen, setIsProductListOpen] = useState(false);
    
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);

    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(0);

    const [payments, setPayments] = useState<{id: number, method: 'Cash' | 'UPI' | 'Card', amount: number}[]>([{ id: Date.now(), method: 'Cash', amount: 0}]);
    
    const filteredProducts = useMemo(() => 
        products.filter(p => p.is_active && p.name.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch]);
    
    const filteredCustomers = useMemo(() => 
        customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())), 
    [customers, customerSearch]);

    const unitPrice = selectedProduct?.sell_price || 0;
    const gstPercent = selectedProduct?.sell_gst || 0;
    const priceBeforeGst = unitPrice * quantity;
    const gstAmount = priceBeforeGst * (gstPercent / 100);
    const totalAmount = priceBeforeGst + gstAmount;
    const finalPayable = totalAmount - discount;
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + Number(p.amount || 0), 0), [payments]);
    const balanceDue = useMemo(() => finalPayable - totalPaid, [finalPayable, totalPaid]);

    useEffect(() => {
        if (payments.length === 1 && finalPayable >= 0) {
            setPayments([{ ...payments[0], amount: finalPayable }]);
        }
    }, [finalPayable]);

    const handlePaymentChange = (id: number, field: 'method' | 'amount', value: any) => {
        setPayments(prev => prev.map(p => p.id === id ? {...p, [field]: value} : p));
    };

    const addPaymentRow = () => {
        setPayments(prev => [...prev, {id: Date.now(), method: 'Cash', amount: 0}]);
    };

    const removePaymentRow = (id: number) => {
        if(payments.length > 1) {
            setPayments(prev => prev.filter(p => p.id !== id));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) {
            alert('Please select a product.');
            return;
        }
        if (quantity > selectedProduct.stock) {
            alert(`Not enough stock. Only ${selectedProduct.stock} available.`);
            return;
        }
        if (balanceDue > 0 && !selectedCustomer) {
            alert('Please select a customer to create a credit sale for the balance amount.');
            return;
        }
        
        let finalPayments: Payment[] = payments.filter(p => p.amount > 0).map(p => ({method: p.method, amount: Number(p.amount || 0)}));
        if(balanceDue > 0 && selectedCustomer) {
            finalPayments.push({ method: 'Credit Sale', amount: balanceDue });
        }

        const newSaleId = addSale({
            product_id: selectedProduct.id,
            customer_id: selectedCustomer?.id,
            qty: quantity,
            sell_price: selectedProduct.sell_price,
            sell_gst: selectedProduct.sell_gst,
            discount: discount,
            payments: finalPayments,
        });
        
        if(newSaleId) {
            navigate(`/bill/${newSaleId}`);
        } else {
            alert("Failed to create sale.");
        }
    };

    const SummaryCard = () => (
        <Card className="space-y-2">
            <h3 className="text-lg font-bold text-text-primary mb-2">Summary</h3>
            <div className="flex justify-between text-sm"><span className="text-text-secondary">Amount (excl. GST)</span> <span>₹{priceBeforeGst.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-secondary">GST ({gstPercent}%)</span> <span>₹{gstAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-text-secondary">Discount</span> <span className="text-red-500">- ₹{discount.toFixed(2)}</span></div>
            <hr className="border-gray-600/50 !my-3" />
            <div className="flex justify-between font-bold text-lg"><span className="text-text-primary">Total Payable</span> <span className="text-primary">₹{finalPayable.toFixed(2)}</span></div>
             <hr className="border-gray-600/50 !my-3" />
            <div className="flex justify-between font-semibold text-md"><span className="text-text-secondary">Total Paid:</span> <span className="text-green-500">₹{totalPaid.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-md"><span className="text-text-secondary">Balance Due:</span> <span className="text-red-500">₹{balanceDue.toFixed(2)}</span></div>
        </Card>
    )

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">New Sale</h1>
            </header>
            
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                <div className="flex-grow md:grid md:grid-cols-3 md:gap-8 items-start">
                    {/* Form Fields */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="relative">
                            <Input label="Customer (optional for cash sale)" id="customer" type="text" placeholder="Search customer..." 
                                value={selectedCustomer ? selectedCustomer.name : customerSearch}
                                onChange={e => { setSelectedCustomer(null); setCustomerSearch(e.target.value); }}
                                onFocus={() => setIsCustomerListOpen(true)}
                                onBlur={() => setTimeout(() => setIsCustomerListOpen(false), 200)}
                            />
                            {isCustomerListOpen && filteredCustomers.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-card border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredCustomers.map(c => (
                                        <div key={c.id} className="p-3 hover:bg-accent cursor-pointer" onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setIsCustomerListOpen(false); }}>
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <Input label="Product" id="product" type="text" placeholder="Search product..." 
                                value={selectedProduct ? selectedProduct.name : productSearch}
                                onChange={e => { setSelectedProduct(null); setProductSearch(e.target.value); }}
                                onFocus={() => setIsProductListOpen(true)}
                                onBlur={() => setTimeout(() => setIsProductListOpen(false), 200)}
                                required
                            />
                            {isProductListOpen && filteredProducts.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} className="p-3 hover:bg-accent cursor-pointer" onClick={() => { setSelectedProduct(p); setProductSearch(p.name); setIsProductListOpen(false); }}>
                                            {p.name} <span className="text-sm text-text-secondary">(Stock: {p.stock})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Quantity" id="quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                            <Input label="Discount (₹)" id="discount" type="number" min="0" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                        </div>
                        
                        <Card>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Payment Details</h3>
                            <div className="space-y-2">
                                {payments.map(p => (
                                    <div key={p.id} className="flex gap-2 items-center">
                                        <select value={p.method} onChange={e => handlePaymentChange(p.id, 'method', e.target.value)} className="flex-1 bg-background border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                                            <option>Cash</option>
                                            <option>UPI</option>
                                            <option>Card</option>
                                        </select>
                                        <input type="number" step="0.01" value={p.amount} onChange={e => handlePaymentChange(p.id, 'amount', parseFloat(e.target.value))} className="flex-1 w-24 bg-background border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="Amount"/>
                                        <button type="button" onClick={() => removePaymentRow(p.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={20}/></button>
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="secondary" onClick={addPaymentRow} className="w-auto px-4 py-2 mt-2 text-sm flex items-center"><Plus size={16} className="mr-1"/> Add Payment</Button>
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-1 mt-4 md:mt-0">
                         <div className="md:sticky md:top-20">
                            <SummaryCard />
                         </div>
                    </div>
                </div>
                
                <div className="mt-auto pt-6">
                    <Button type="submit" disabled={!selectedProduct || quantity <= 0 || finalPayable < 0}>SAVE & GENERATE BILL</Button>
                </div>
            </form>
        </PageWrapper>
    );
};

export default AddSaleScreen;
