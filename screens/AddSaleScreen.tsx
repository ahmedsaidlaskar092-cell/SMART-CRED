import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft, Plus, Trash2, UserPlus, X } from 'lucide-react';
import Input from '../components/ui/Input';
import { useData } from '../contexts/DataContext';
import { Product, Customer, Payment, SaleItem } from '../types';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';

interface CartItem extends SaleItem {
    productName: string;
}

const AddSaleScreen: React.FC = () => {
    const navigate = useNavigate();
    const { products, customers, addSale, addCustomer, getProductById } = useData();
    
    // Cart and selections
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    
    // Product Search
    const [productSearch, setProductSearch] = useState('');
    const [isProductListOpen, setIsProductListOpen] = useState(false);
    const filteredProducts = useMemo(() => 
        products.filter(p => p.is_active && p.name.toLowerCase().includes(productSearch.toLowerCase())),
    [products, productSearch]);
    
    // Add customer modal
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    // Payment and discount
    const [discount, setDiscount] = useState(0);
    const [payments, setPayments] = useState<{id: number, method: 'Cash' | 'UPI' | 'Card', amount: number}[]>([{ id: Date.now(), method: 'Cash', amount: 0}]);
    
    const filteredCustomers = useMemo(() => 
        customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())), 
    [customers, customerSearch]);

    // Calculations
    const totalAmount = useMemo(() => cart.reduce((acc, item) => {
        const itemTotal = item.sell_price * item.qty;
        const gstAmount = itemTotal * (item.sell_gst / 100);
        return acc + itemTotal + gstAmount;
    }, 0), [cart]);

    const finalPayable = totalAmount - discount;
    const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + Number(p.amount || 0), 0), [payments]);
    const balanceDue = useMemo(() => finalPayable - totalPaid, [finalPayable, totalPaid]);
    
    // Auto-fill payment on final amount change
    useEffect(() => {
        if (payments.length === 1 && finalPayable >= 0) {
            setPayments([{ ...payments[0], amount: finalPayable }]);
        }
    }, [finalPayable]);

    // Cart Management
    const addProductToCart = (product: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product_id === product.id);
            if (existingItem) {
                return prevCart.map(item => item.product_id === product.id ? {...item, qty: item.qty + 1} : item);
            } else {
                return [...prevCart, {
                    product_id: product.id,
                    productName: product.name,
                    qty: 1,
                    sell_price: product.sell_price,
                    sell_gst: product.sell_gst,
                    buy_price_at_sale: product.buy_price,
                }];
            }
        });
        setProductSearch('');
    };

    const updateCartQty = (productId: number, qty: number) => {
        const product = getProductById(productId);
        if (qty > (product?.stock || 0)) {
            alert(`Not enough stock. Only ${product?.stock} available.`);
            return;
        }
        if (qty > 0) {
            setCart(cart.map(item => item.product_id === productId ? { ...item, qty } : item));
        } else {
            setCart(cart.filter(item => item.product_id !== productId));
        }
    };
    
    // Payment Management
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
    
    // Add new customer handler
    const handleAddNewCustomer = () => {
        if(!newCustomerName || !newCustomerPhone) {
            alert("Name and phone are required.");
            return;
        }
        const newCustomer = addCustomer({name: newCustomerName, phone: newCustomerPhone});
        setSelectedCustomer(newCustomer);
        setCustomerSearch(newCustomer.name);
        setIsAddCustomerModalOpen(false);
        setNewCustomerName('');
        setNewCustomerPhone('');
    };

    // Final Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Please add at least one product to the cart.');
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
        
        const saleItems: SaleItem[] = cart.map(({ productName, ...item }) => item);

        const newSaleId = addSale({
            items: saleItems,
            customer_id: selectedCustomer?.id,
            discount: discount,
            payments: finalPayments,
        });
        
        if(newSaleId) {
            navigate(`/bill/${newSaleId}`);
        } else {
            alert("Failed to create sale.");
        }
    };

    return (
        <>
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
                            <label className="block text-sm font-medium text-text-secondary mb-1">Customer (optional)</label>
                            <div className="flex gap-2">
                                <input id="customer" type="text" placeholder="Search or select a customer..." 
                                    className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={selectedCustomer ? selectedCustomer.name : customerSearch}
                                    onChange={e => { setSelectedCustomer(null); setCustomerSearch(e.target.value); }}
                                    onFocus={() => setIsCustomerListOpen(true)}
                                    onBlur={() => setTimeout(() => setIsCustomerListOpen(false), 200)}
                                />
                                <button type="button" onClick={() => setIsAddCustomerModalOpen(true)} className="p-3 bg-card rounded-lg text-primary hover:bg-accent">
                                    <UserPlus size={20}/>
                                </button>
                            </div>
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
                        
                        {/* Cart Items */}
                        <Card>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Cart Items</h3>
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <div key={item.product_id} className="flex items-center gap-2 bg-background p-2 rounded-lg">
                                        <div className="flex-grow">
                                            <p className="font-semibold text-text-primary">{item.productName}</p>
                                            <p className="text-sm text-text-secondary">₹{item.sell_price} + {item.sell_gst}% GST</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={() => updateCartQty(item.product_id, item.qty - 1)} className="p-1.5 h-7 w-7 flex items-center justify-center rounded-full bg-card text-text-secondary hover:bg-accent">-</button>
                                            <span className="w-8 text-center font-semibold">{item.qty}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => updateCartQty(item.product_id, item.qty + 1)} 
                                                className="p-1.5 h-7 w-7 flex items-center justify-center rounded-full bg-card text-text-secondary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={item.qty >= (getProductById(item.product_id)?.stock || 0)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => updateCartQty(item.product_id, 0)} className="p-2 text-red-500"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                            </div>
                            <div className="relative mt-3">
                                <Input label="Add Product" id="product" type="text" placeholder="Search product to add..." 
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    onFocus={() => setIsProductListOpen(true)}
                                    onBlur={() => setTimeout(() => setIsProductListOpen(false), 200)}
                                />
                                {isProductListOpen && filteredProducts.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-card border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredProducts.map(p => (
                                            <div key={p.id} className="p-3 hover:bg-accent cursor-pointer" onClick={() => { addProductToCart(p); setIsProductListOpen(false); }}>
                                                {p.name} <span className="text-sm text-text-secondary">(Stock: {p.stock})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                        
                        <Card>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Payment Details</h3>
                             <Input label="Discount (₹)" id="discount" type="number" min="0" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} />
                            <div className="space-y-2 mt-4">
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
                            <Button type="button" variant="secondary" onClick={addPaymentRow} className="w-auto px-4 py-2 mt-2 text-sm flex items-center"><Plus size={16} className="mr-1"/> Add Payment Method</Button>
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-1 mt-4 md:mt-0">
                         <div className="md:sticky md:top-20">
                             <Card className="space-y-2">
                                <h3 className="text-lg font-bold text-text-primary mb-2">Summary</h3>
                                <div className="flex justify-between text-sm"><span className="text-text-secondary">Subtotal</span> <span>₹{totalAmount.toFixed(2)}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-text-secondary">Discount</span> <span className="text-red-500">- ₹{discount.toFixed(2)}</span></div>
                                <hr className="border-gray-600/50 !my-3" />
                                <div className="flex justify-between font-bold text-lg"><span className="text-text-primary">Total Payable</span> <span className="text-primary">₹{finalPayable.toFixed(2)}</span></div>
                                 <hr className="border-gray-600/50 !my-3" />
                                <div className="flex justify-between font-semibold text-md"><span className="text-text-secondary">Total Paid:</span> <span className="text-green-500">₹{totalPaid.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-md"><span className="text-text-secondary">Balance Due:</span> <span className="text-red-500">₹{balanceDue.toFixed(2)}</span></div>
                            </Card>
                         </div>
                    </div>
                </div>
                
                <div className="mt-auto pt-6">
                    <Button type="submit" disabled={cart.length === 0 || finalPayable < 0}>SAVE & GENERATE BILL</Button>
                </div>
            </form>
        </PageWrapper>

        <Modal title="Add New Customer" isOpen={isAddCustomerModalOpen} onClose={() => setIsAddCustomerModalOpen(false)}>
            <div className="space-y-4">
                <Input label="Customer Name" id="new_customer_name" type="text" value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} required />
                <Input 
                  label="Customer Phone" 
                  id="new_customer_phone" 
                  type="tel" 
                  prefix="+91"
                  maxLength={10}
                  value={newCustomerPhone} 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                        setNewCustomerPhone(value);
                    }
                  }} 
                  required 
                />
                <Button onClick={handleAddNewCustomer}>Save Customer</Button>
            </div>
        </Modal>
        </>
    );
};

export default AddSaleScreen;