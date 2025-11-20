
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Customer, Product, Sale, Purchase, SaleItem, PaymentReceived, BusinessInsight } from '../types';
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
  paymentsReceived: PaymentReceived[];
  businessInsight: BusinessInsight | null;
  getCustomerById: (id: number) => Customer | undefined;
  getProductById: (id: number) => Product | undefined;
  getSaleById: (id: number) => Sale | undefined;
  getSalesByCustomerId: (customerId: number) => Sale[];
  getPaymentsByCustomerId: (customerId: number) => PaymentReceived[];
  addCustomer: (customer: Omit<Customer, 'id' | 'firm_id' | 'outstanding' | 'totalPaid'>) => Customer;
  addProduct: (product: Omit<Product, 'id' | 'firm_id'>) => void;
  updateProduct: (updatedProduct: Product) => void;
  addBulkProducts: (products: Omit<Product, 'id' | 'firm_id'>[]) => void;
  addSale: (sale: Omit<Sale, 'id' | 'firm_id' | 'date_time' | 'total_amount' | 'bill_no'>) => number;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'firm_id' | 'date_time' | 'total_amount'>) => void;
  addPaymentReceived: (payment: Omit<PaymentReceived, 'id' | 'firm_id'>) => void;
  deletePaymentReceived: (paymentId: number) => void;
  deleteSale: (saleId: number) => void;
  restoreData: (data: any) => boolean;
  loadMockData: () => void;
  clearAllData: () => void;
  generateAndAddRandomProducts: (businessType: string) => Promise<void>;
  generateBusinessInsights: () => Promise<void>;
  isGeneratingInsight: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useStickyState<Customer[]>([], 'data_customers');
  const [products, setProducts] = useStickyState<Product[]>([], 'data_products');
  const [sales, setSales] = useStickyState<Sale[]>([], 'data_sales');
  const [purchases, setPurchases] = useStickyState<Purchase[]>([], 'data_purchases');
  const [paymentsReceived, setPaymentsReceived] = useStickyState<PaymentReceived[]>([], 'data_paymentsReceived');
  const [businessInsight, setBusinessInsight] = useStickyState<BusinessInsight | null>(null, 'data_insight');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const getCustomerById = useCallback((id: number) => customers.find(c => c.id === id), [customers]);
  const getProductById = useCallback((id: number) => products.find(p => p.id === id), [products]);
  const getSaleById = useCallback((id: number) => sales.find(s => s.id === id), [sales]);
  const getSalesByCustomerId = useCallback((customerId: number) => sales.filter(s => s.customer_id === customerId), [sales]);
  const getPaymentsByCustomerId = useCallback((customerId: number) => paymentsReceived.filter(p => p.customer_id === customerId), [paymentsReceived]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'firm_id' | 'outstanding' | 'totalPaid'>): Customer => {
    let formattedPhone = customerData.phone.trim();
    if (formattedPhone && !formattedPhone.startsWith('+91')) {
        formattedPhone = `+91${formattedPhone}`;
    }
    const newCustomer = { ...customerData, phone: formattedPhone, id: Date.now(), firm_id: 1, outstanding: 0, totalPaid: 0 };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
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

  const addSale = (saleData: Omit<Sale, 'id' | 'firm_id' | 'date_time' | 'total_amount' | 'bill_no'>): number => {
    const total_amount = saleData.items.reduce((acc, item) => {
        const itemTotal = item.sell_price * item.qty;
        const gstAmount = itemTotal * (item.sell_gst / 100);
        return acc + itemTotal + gstAmount;
    }, 0) - saleData.discount;

    const newSaleId = Date.now();
    const bill_no = `INV-${newSaleId}`;

    const newSale: Sale = {
        ...saleData,
        id: newSaleId,
        firm_id: 1,
        date_time: new Date().toISOString(),
        total_amount,
        bill_no,
    };

    setSales(prev => [...prev, newSale]);

    // Update stock for all items
    saleData.items.forEach(item => {
        setProducts(prev => prev.map(p =>
            p.id === item.product_id ? { ...p, stock: p.stock - item.qty } : p
        ));
    });

    // Handle credit and paid amounts
    if (saleData.customer_id) {
        const creditPayment = saleData.payments.find(p => p.method === 'Credit Sale');
        const creditAmount = creditPayment ? creditPayment.amount : 0;
        const paidAmount = saleData.payments.filter(p=>p.method !== 'Credit Sale').reduce((acc, p) => acc + p.amount, 0);

        setCustomers(prev => prev.map(c => 
            c.id === saleData.customer_id ? {
                ...c,
                outstanding: c.outstanding + creditAmount,
                totalPaid: c.totalPaid + paidAmount
            } : c
        ));
    }

    return newSale.id;
  };

  const addPaymentReceived = (paymentData: Omit<PaymentReceived, 'id' | 'firm_id'>) => {
    const newPayment = { ...paymentData, id: Date.now(), firm_id: 1 };
    setPaymentsReceived(prev => [...prev, newPayment]);

    setCustomers(prev => prev.map(c => 
        c.id === paymentData.customer_id ? {
            ...c,
            outstanding: c.outstanding - newPayment.amount,
            totalPaid: c.totalPaid + newPayment.amount
        } : c
    ));
  };
  
  const deletePaymentReceived = (paymentId: number) => {
    const paymentToDelete = paymentsReceived.find(p => p.id === paymentId);
    if (!paymentToDelete) return;

    setCustomers(prev => prev.map(c =>
        c.id === paymentToDelete.customer_id ? {
            ...c,
            outstanding: c.outstanding + paymentToDelete.amount,
            totalPaid: c.totalPaid - paymentToDelete.amount
        } : c
    ));
    setPaymentsReceived(prev => prev.filter(p => p.id !== paymentId));
  };
  
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'firm_id' | 'date_time' | 'total_amount'>) => {
    const product = getProductById(purchaseData.product_id);
    if (!product) return;

    const total_amount = purchaseData.buy_price * purchaseData.qty * (1 + purchaseData.buy_gst / 100);
    const newPurchase = { ...purchaseData, id: Date.now(), firm_id: 1, date_time: new Date().toISOString(), total_amount };
    setPurchases(prev => [...prev, newPurchase]);

    setProducts(prev => prev.map(p => p.id === purchaseData.product_id ? { ...p, stock: p.stock + purchaseData.qty } : p));
  };

  const deleteSale = (saleId: number) => {
    const saleToDelete = sales.find(s => s.id === saleId);
    if (!saleToDelete) return;

    // 1. Replenish product stock
    saleToDelete.items.forEach(item => {
      setProducts(prev => prev.map(p =>
          p.id === item.product_id ? { ...p, stock: p.stock + item.qty } : p
      ));
    });

    // 2. Reverse financial impact on customer
    if (saleToDelete.customer_id) {
        const creditPayment = saleToDelete.payments.find(p => p.method === 'Credit Sale');
        const creditAmount = creditPayment ? creditPayment.amount : 0;
        const paidAmount = saleToDelete.payments.filter(p => p.method !== 'Credit Sale').reduce((acc, p) => acc + p.amount, 0);

        setCustomers(prev => prev.map(c =>
            c.id === saleToDelete.customer_id ? {
                ...c,
                outstanding: c.outstanding - creditAmount,
                totalPaid: c.totalPaid - paidAmount,
            } : c
        ));
    }

    // 3. Remove the sale itself
    setSales(prev => prev.filter(s => s.id !== saleId));
  };

  const restoreData = (data: any): boolean => {
    try {
        if(data.customers && data.products && data.sales && data.purchases && data.paymentsReceived) {
            setCustomers(data.customers);
            setProducts(data.products);
            setSales(data.sales);
            setPurchases(data.purchases);
            setPaymentsReceived(data.paymentsReceived);
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
    setPaymentsReceived([]);
  };

  const clearAllData = () => {
    setCustomers([]);
    setProducts([]);
    setSales([]);
    setPurchases([]);
    setPaymentsReceived([]);
    setBusinessInsight(null);
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

  const generateBusinessInsights = async (): Promise<void> => {
      if (!process.env.API_KEY) {
          console.error("API Key is missing");
          return;
      }
      setIsGeneratingInsight(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Aggregate Data
      const totalSalesAllTime = sales.reduce((acc, s) => acc + s.total_amount, 0);
      const totalCredit = customers.reduce((acc, c) => acc + c.outstanding, 0);
      const lowStockCount = products.filter(p => p.stock <= 5).length;
      
      const today = new Date().toDateString();
      const todaysSales = sales.filter(s => new Date(s.date_time).toDateString() === today).reduce((acc, s) => acc + s.total_amount, 0);
      
      // Top Selling Product Logic
      const productSalesMap: {[key: number]: number} = {};
      sales.forEach(sale => {
          sale.items.forEach(item => {
              productSalesMap[item.product_id] = (productSalesMap[item.product_id] || 0) + item.qty;
          });
      });
      const topProductId = Object.keys(productSalesMap).reduce((a, b) => productSalesMap[parseInt(a)] > productSalesMap[parseInt(b)] ? a : b, "0");
      const topProduct = getProductById(parseInt(topProductId));

      const prompt = `
        Act as a senior business consultant for a small business owner. Analyze this data and provide a concise, 3-4 sentence strategic insight summary.
        Focus on cash flow, stock alerts, or sales opportunities. Be encouraging but professional. Use emojis.
        
        Data:
        - Total Sales (All Time): ₹${totalSalesAllTime}
        - Sales Today: ₹${todaysSales}
        - Pending Credit (To Collect): ₹${totalCredit}
        - Low Stock Items: ${lowStockCount}
        - Top Selling Product: ${topProduct?.name || 'N/A'}
      `;

      try {
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
          });
          
          const text = response.text;
          if(text) {
              setBusinessInsight({
                  text: text.trim(),
                  lastUpdated: new Date().toISOString()
              });
          }
      } catch (error) {
          console.error("Error generating insights:", error);
      } finally {
          setIsGeneratingInsight(false);
      }
  };

  const value = {
    customers, products, sales, purchases, paymentsReceived, businessInsight, isGeneratingInsight,
    getCustomerById, getProductById, getSaleById, getSalesByCustomerId, getPaymentsByCustomerId,
    addCustomer, addProduct, updateProduct, addBulkProducts, addSale, addPurchase, addPaymentReceived, deletePaymentReceived,
    deleteSale, restoreData, loadMockData, clearAllData, generateAndAddRandomProducts, generateBusinessInsights
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
