
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, Filter, Plus, FileSpreadsheet } from 'lucide-react';
import { Product } from '../types';

const mockProducts: Product[] = [
  { id: 1, firm_id: 1, name: 'Product A', buy_price: 100, buy_gst: 18, sell_price: 150, sell_gst: 18, stock: 50, is_active: true },
  { id: 2, firm_id: 1, name: 'Product B', buy_price: 200, buy_gst: 12, sell_price: 280, sell_gst: 12, stock: 4, is_active: true },
  { id: 3, firm_id: 1, name: 'Product C (Old)', buy_price: 50, buy_gst: 5, sell_price: 70, sell_gst: 5, stock: 0, is_active: false },
];

const ProductsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <PageWrapper>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Products</h1>
          <div className="flex gap-2">
            <Button className="w-auto px-4 py-2" onClick={() => navigate('/add-product')}>
              <Plus size={20} className="mr-2"/> Add
            </Button>
             <Button variant="secondary" className="w-auto px-4 py-2" onClick={() => navigate('/bulk-add-products')}>
              <FileSpreadsheet size={20} className="mr-2"/> Bulk Add
            </Button>
          </div>
        </header>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
            <input type="text" placeholder="Search product" className="w-full bg-card border-none rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <button className="p-3 bg-card rounded-lg">
            <Filter className="text-text-primary" size={20}/>
          </button>
        </div>

        <div className="space-y-3">
          {mockProducts.map(product => {
            const finalSell = product.sell_price * (1 + product.sell_gst / 100);
            return (
              <Card key={product.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-text-primary">{product.name}</p>
                    <p className={`text-sm ${product.stock <= 5 ? 'text-red-500' : 'text-text-secondary'}`}>
                      Stock: {product.stock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">₹{finalSell.toFixed(2)}</p>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </PageWrapper>
      <BottomNav />
    </>
  );
};

export default ProductsScreen;
