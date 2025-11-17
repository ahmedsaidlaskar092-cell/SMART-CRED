
import { Customer, Product, Sale } from '../types';

export const mockCustomers: Customer[] = [
  { id: 1, firm_id: 1, name: 'Rohan Sharma', phone: '9876543210', address: '12B, Karol Bagh, Delhi', outstanding: 1250.50, totalPaid: 5000 },
  { id: 2, firm_id: 1, name: 'Priya Patel', phone: '8765432109', address: '45, MG Road, Mumbai', outstanding: 0, totalPaid: 8500 },
  { id: 3, firm_id: 1, name: 'Amit Singh', phone: '7654321098', address: 'A-1 Sector 18, Noida', outstanding: 350.00, totalPaid: 1200 },
];

export const mockProducts: Product[] = [
  { id: 101, firm_id: 1, name: 'Amul Gold Milk 1L', buy_price: 60, buy_gst: 0, sell_price: 65, sell_gst: 0, stock: 45, category: 'Dairy', is_active: true },
  { id: 102, firm_id: 1, name: 'Britannia Bread', buy_price: 35, buy_gst: 0, sell_price: 40, sell_gst: 0, stock: 30, category: 'Bakery', is_active: true },
  { id: 103, firm_id: 1, name: 'Parle-G Biscuit', buy_price: 8, buy_gst: 5, sell_price: 10, sell_gst: 5, stock: 150, category: 'Snacks', is_active: true },
  { id: 104, firm_id: 1, name: 'Tata Salt 1kg', buy_price: 20, buy_gst: 0, sell_price: 25, sell_gst: 0, stock: 4, category: 'Groceries', is_active: true },
  { id: 105, firm_id: 1, name: 'Maggi Noodles', buy_price: 10, buy_gst: 12, sell_price: 14, sell_gst: 12, stock: 80, category: 'Snacks', is_active: true },
  { id: 106, firm_id: 1, name: 'Sunflower Oil 1L', buy_price: 150, buy_gst: 5, sell_price: 170, sell_gst: 5, stock: 2, category: 'Groceries', is_active: true },
  { id: 107, firm_id: 1, name: 'Surf Excel 1kg', buy_price: 180, buy_gst: 18, sell_price: 210, sell_gst: 18, stock: 0, category: 'Household', is_active: false },
];

export const mockSales: Sale[] = [
  {
    id: 1001,
    firm_id: 1,
    bill_no: 'INV-1001',
    customer_id: 1,
    product_id: 101,
    qty: 2,
    sell_price: 65,
    buy_price_at_sale: 60,
    sell_gst: 0,
    discount: 0,
    total_amount: 130,
    payments: [{ method: 'UPI', amount: 130 }],
    date_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1002,
    firm_id: 1,
    bill_no: 'INV-1002',
    customer_id: 2,
    product_id: 103,
    qty: 10,
    sell_price: 10,
    buy_price_at_sale: 8,
    sell_gst: 5,
    discount: 5,
    total_amount: 100,
    payments: [{ method: 'Cash', amount: 100 }],
    date_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 1003,
    firm_id: 1,
    bill_no: 'INV-1003',
    product_id: 105,
    qty: 5,
    sell_price: 14,
    buy_price_at_sale: 10,
    sell_gst: 12,
    discount: 0,
    total_amount: 78.4,
    payments: [{ method: 'Card', amount: 78.4 }],
    date_time: new Date().toISOString(),
  },
];
