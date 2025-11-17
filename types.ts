
export type Theme = 'blue' | 'green' | 'purple' | 'dark';

export interface Firm {
  id: number;
  name: string;
  owner_name: string;
  address?: string;
  phone?: string;
  gstin?: string;
  tagline?: string;
  default_gst?: number;
}

export interface User {
  id: number;
  firm_id: number;
  full_name: string;
  email: string;
  role: 'owner' | 'admin';
}

export interface Customer {
  id: number;
  firm_id: number;
  name: string;
  phone: string;
  address?: string;
  outstanding: number;
  totalPaid: number;
}

export interface Product {
  id: number;
  firm_id: number;
  name: string;
  buy_price: number;
  buy_gst: number;
  sell_price: number;
  sell_gst: number;
  stock: number;
  category?: string;
  is_active: boolean;
}

export interface Payment {
    method: 'Cash' | 'UPI' | 'Card' | 'Credit Sale';
    amount: number;
}

export interface SaleItem {
  product_id: number;
  qty: number;
  sell_price: number;
  buy_price_at_sale: number;
  sell_gst: number;
}

export interface Sale {
    id: number;
    firm_id: number;
    bill_no: string;
    customer_id?: number;
    items: SaleItem[];
    discount: number;
    total_amount: number;
    payments: Payment[];
    date_time: string;
}

export interface Purchase {
    id: number;
    firm_id: number;
    product_id: number;
    qty: number;
    buy_price: number;
    buy_gst: number;
    total_amount: number;
    payment_type: 'Cash Purchase' | 'Credit Purchase';
    date_time: string;
}

export interface PaymentReceived {
    id: number;
    firm_id: number;
    customer_id: number;
    amount: number;
    method: 'Cash' | 'UPI' | 'Card';
    date_time: string;
    notes?: string;
}


export interface Device {
  id: string;
  name: string;
  lastLogin: string;
}

// For UI Rendering of Customer Ledger
export interface LedgerEntry {
    id: string;
    date: Date;
    type: 'sale' | 'payment';
    description: string;
    debit: number;
    credit: number;
    balance: number;
    originalEntry: Sale | PaymentReceived;
}
