import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Customer, Product, Sale, Purchase, CreditEntry } from '../types';
import { mockCustomers, mockProducts, mockSales } from '../utils/mockData';
import { GoogleGenAI } from "@google/genai";

// A helper hook to persist state to localStorage
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (e) {
            console.warn(`Error reading localStorage key “${key}”:`, e);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Error setting localStorage key “${key}”:`, e);
        }
    }, [key, value]);

    return [value, setValue];
};


interface DataContextType {
  customers: Customer[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  creditEntries: CreditEntry[];
  getCustomerById: (id: number) => Customer | undefined;
  getProductById: (id: number) => Product | undefined;
  getSaleById: (id: number) => Sale | undefined;
  getCreditEntriesByCustomerId: (customerId: number) => CreditEntry[];
  addCustomer: (customer: Omit<Customer, 'id' | 'firm_id' | 'outstanding' | 'totalPaid'>) => void;
  addProduct: (product: Omit<Product, 'id' | 'firm_id'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  addBulkProducts: (products: Omit<Product, 'id' | 'firm_id'>[]) => void;
  addSale: (sale: Omit<Sale, 'id' | 'firm_id' | 'date_time' | 'total_amount' | 'bill_no' | 'buy_price_at_sale'>) => number;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'firm_id' | 'date_time' | 'total_amount'>) => void;
  addCreditEntry: (entry: Omit<CreditEntry, 'id' | 'firm_id' | 'date_time' | 'status'>) => void;
  markCreditAsPaid: (entryId: number) => void;
  deleteSale: (saleId: number) => void;
  restoreData: (data: any) => boolean;
  loadMockData: () => void;
  clearAllData: () => void;
  generateAndAddRandomProducts: (businessType: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useStickyState<Customer[]>([], 'data_customers');
  const [products, setProducts] = useStickyState<Product[]>([], 'data_products');
  const [sales, setSales] = useStickyState<Sale[]>([], 'data_sales');
  const [purchases, setPurchases] = useStickyState<Purchase[]>([], 'data_purchases');
  const [creditEntries, setCreditEntries] = useStickyState<CreditEntry[]>([], 'data_creditEntries');

  const getCustomerById = useCallback((id: number) => customers.find(c => c.id === id), [customers]);
  const getProductById = useCallback((id: number) => products.find(p => p.id === id), [products]);
  const getSaleById = useCallback((id: number) => sales.find(s => s.id === id), [sales]);
  const getCreditEntriesByCustomerId = useCallback((customerId: number) => creditEntries.filter(c => c.customer_id === customerId).sort((a,b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()), [creditEntries]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'firm_id' | 'outstanding' | 'totalPaid'>) => {
    setCustomers(prev => [...prev, { ...customerData, id: Date.now(), firm_id: 1, outstanding: 0, totalPaid: 0 }]);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'firm_id'>) => {
    setProducts(prev => [...prev, { ...productData, id: Date.now(), firm_id: 1 }]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const addBulkProducts = (productsData: Omit<Product, 'id' | 'firm_id'>[]) => {
    const newProducts = productsData.map(p => ({...p, id: Date.now() + Math.random(), firm_id: 1}))
    setProducts(prev => [...prev, ...newProducts]);
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'firm_id' | 'date_time' | 'total_amount' | 'bill_no' | 'buy_price_at_sale'>): number => {
    const product = getProductById(saleData.product_id);
    if (!product) return 0;

    const priceBeforeGst = saleData.sell_price * saleData.qty;
    const gstAmount = priceBeforeGst * (saleData.sell_gst / 100);
    const grossTotal = priceBeforeGst + gstAmount;
    const total_amount = grossTotal - saleData.discount;
    
    const newSaleId = Date.now();
    const bill_no = `INV-${newSaleId}`;

    const newSale: Sale = { 
        ...saleData, 
        id: newSaleId, 
        firm_id: 1, 
        date_time: new Date().toISOString(), 
        total_amount,
        bill_no,
        buy_price_at_sale: product.buy_price,
    };
    
    setSales(prev => [...prev, newSale]);
    
    setProducts(prev => prev.map(p => p.id === saleData.product_id ? { ...p, stock: p.stock - saleData.qty } : p));
    
    const creditPayment = saleData.payments.find(p => p.method === 'Credit Sale');
    if (creditPayment && saleData.customer_id) {
        addCreditEntry({
            customer_id: saleData.customer_id,
            sale_id: newSale.id,
            productName: `${product.name} (Bill: ${bill_no})`,
            amount: creditPayment.amount,
            gst: 0,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
    }

    return newSale.id;
  };
  
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'firm_id' | 'date_time' | 'total_amount'>) => {
    const product = getProductById(purchaseData.product_id);
    if (!product) return;

    const total_amount = purchaseData.buy_price * purchaseData.qty * (1 + purchaseData.buy_gst / 100);
    const newPurchase = { ...purchaseData, id: Date.now(), firm_id: 1, date_time: new Date().toISOString(), total_amount };
    setPurchases(prev => [...prev, newPurchase]);

    setProducts(prev => prev.map(p => p.id === purchaseData.product_id ? { ...p, stock: p.stock + purchaseData.qty } : p));
  };

  const addCreditEntry = (entryData: Omit<CreditEntry, 'id' | 'firm_id' | 'date_time' | 'status'>) => {
    const total_amount = entryData.amount * (1 + entryData.gst / 100);
    const newEntry = { ...entryData, id: Date.now(), firm_id: 1, date_time: new Date().toISOString(), status: 'PENDING' as const };
    setCreditEntries(prev => [...prev, newEntry]);

    setCustomers(prev => prev.map(c => c.id === entryData.customer_id ? { ...c, outstanding: c.outstanding + total_amount } : c));
  };
  
  const markCreditAsPaid = (entryId: number) => {
      const entry = creditEntries.find(e => e.id === entryId);
      if(!entry) return;

      const total_amount = entry.amount * (1 + entry.gst / 100);
      setCreditEntries(prev => prev.map(e => e.id === entryId ? {...e, status: 'PAID'} : e));
      setCustomers(prev => prev.map(c => c.id === entry.customer_id ? { ...c, outstanding: c.outstanding - total_amount, totalPaid: c.totalPaid + total_amount } : c));
  };

  const deleteSale = (saleId: number) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // 1. Replenish product stock
    setProducts(prev => prev.map(p =>
        p.id === saleToDelete.product_id ? { ...p, stock: p.stock + saleToDelete.qty } : p
    ));

    // 2. Find and reverse any associated credit entry
    const creditEntryToDelete = creditEntries.find(ce => ce.sale_id === saleId);
    if (creditEntryToDelete && saleToDelete.customer_id) {
        const customerId = saleToDelete.customer_id;
        // Reverse the outstanding amount on the customer
        const creditAmount = creditEntryToDelete.amount;
        setCustomers(prev => prev.map(c =>
            c.id === customerId ? { ...c, outstanding: c.outstanding - creditAmount } : c
        ));
        // Remove the credit entry
        setCreditEntries(prev => prev.filter(ce => ce.id !== creditEntryToDelete.id));
    }

    // 3. Remove the sale itself
    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  const restoreData = (data: any): boolean => {
    try {
        if(data.customers && data.products && data.sales && data.purchases && data.creditEntries) {
            setCustomers(data.customers);
            setProducts(data.products);
            setSales(data.sales);
            setPurchases(data.purchases);
            setCreditEntries(data.creditEntries);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to restore data", e);
        return false;
    }
  };

  const loadMockData = () => {
    setCustomers(mockCustomers);
    setProducts(mockProducts);
    setSales(mockSales);
    setPurchases([]);
    setCreditEntries([]);
  };

  const clearAllData = () => {
    setCustomers([]);
    setProducts([]);
    setSales([]);
    setPurchases([]);
    setCreditEntries([]);
  };
  
  const generateAndAddRandomProducts = async (businessType: string): Promise<void> => {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Generate a JSON array of 20 realistic product names for a "${businessType}". The JSON output must be an array of objects, where each object has a single key "name". For example: [{"name": "Product Name 1"}, {"name": "Product Name 2"}]. Do not include any other text or formatting in your response.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      const resultText = response.text.trim();
      const generatedNames: { name: string }[] = JSON.parse(resultText);

      const gstRates = [0, 5, 12, 18, 28];
      const newProducts = generatedNames.map(item => {
        const buy_price = Math.floor(Math.random() * (5000 - 10 + 1)) + 10;
        const sell_price = parseFloat((buy_price * (1 + (Math.random() * (0.3 - 0.1) + 0.1))).toFixed(2));
        const gst = gstRates[Math.floor(Math.random() * gstRates.length)];
        
        return {
          name: item.name,
          buy_price,
          buy_gst: gst,
          sell_price,
          sell_gst: gst,
          stock: Math.floor(Math.random() * 101),
          category: businessType,
          is_active: true
        };
      });
      
      addBulkProducts(newProducts);

    } catch (error) {
        console.error("Error generating products with Gemini:", error);
        throw new Error("Failed to generate products. Please check the console for details.");
    }
  };

  const value = {
    customers, products, sales, purchases, creditEntries,
    getCustomerById, getProductById, getSaleById, getCreditEntriesByCustomerId,
    addCustomer, addProduct, updateProduct, addBulkProducts, addSale, addPurchase, addCreditEntry, markCreditAsPaid,
    deleteSale, restoreData, loadMockData, clearAllData, generateAndAddRandomProducts,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};