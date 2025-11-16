import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, Filter, Plus, FileSpreadsheet, Archive } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';

const ProductsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
      status: 'all', // 'all', 'active', 'inactive', 'low_stock'
      sortBy: 'name_asc' // 'name_asc', 'name_desc', 'stock_desc', 'stock_asc', 'price_desc', 'price_asc'
  });

  const filteredProducts = useMemo(() => {
    let productsToFilter = [...products];

    // Filter
    switch(filterOptions.status) {
        case 'active':
            productsToFilter = productsToFilter.filter(p => p.is_active);
            break;
        case 'inactive':
            productsToFilter = productsToFilter.filter(p => !p.is_active);
            break;
        case 'low_stock':
            productsToFilter = productsToFilter.filter(p => p.stock <= 5);
            break;
    }

    // Search
    if (searchTerm) {
        productsToFilter = productsToFilter.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Sort
    switch(filterOptions.sortBy) {
        case 'name_desc':
            productsToFilter.sort((a,b) => b.name.localeCompare(a.name));
            break;
        case 'stock_desc':
            productsToFilter.sort((a,b) => b.stock - a.stock);
            break;
        case 'stock_asc':
            productsToFilter.sort((a,b) => a.stock - b.stock);
            break;
        case 'price_desc':
            productsToFilter.sort((a,b) => (b.sell_price * (1 + b.sell_gst/100)) - (a.sell_price * (1 + a.sell_gst/100)));
            break;
        case 'price_asc':
            productsToFilter.sort((a,b) => (a.sell_price * (1 + a.sell_gst/100)) - (b.sell_price * (1 + b.sell_gst/100)));
            break;
        case 'name_asc':
        default:
            productsToFilter.sort((a,b) => Number(b.is_active) - Number(a.is_active) || a.name.localeCompare(b.name));
            break;
    }

    return productsToFilter;
  }, [products, searchTerm, filterOptions]);

  return (
    <>
      <PageWrapper>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Products</h1>
          <div className="flex gap-2">
            <Button className="w-auto px-4 py-2 flex items-center" onClick={() => navigate('/add-product')}>
              <Plus size={20} className="mr-2"/> Add
            </Button>
             <Button variant="secondary" className="w-auto px-4 py-2 flex items-center" onClick={() => navigate('/bulk-add-products')}>
              <FileSpreadsheet size={20} className="mr-2"/> Bulk Add
            </Button>
          </div>
        </header>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20}/>
            <input 
                type="text" 
                placeholder="Search product" 
                className="w-full bg-card border-none rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary outline-none" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsFilterOpen(true)} className="p-3 bg-card rounded-lg">
            <Filter className="text-text-primary" size={20}/>
          </button>
        </div>

        {filteredProducts.length > 0 ? (
          <motion.div 
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {filteredProducts.map(product => {
              const finalSell = product.sell_price * (1 + product.sell_gst / 100);
              return (
                <motion.div
                    key={product.id}
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                    }}
                >
                    <Card key={product.id}>
                        <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-text-primary">{product.name}</p>
                            <p className={`text-sm font-semibold ${product.stock <= 5 ? 'text-red-500' : 'text-text-secondary'}`}>
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
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
            <EmptyState 
                icon={<Archive size={40} className="text-primary"/>}
                title="No Products Found"
                message="Add your products to manage stock and create sales entries easily."
                actionText="Add Product"
                onAction={() => navigate('/add-product')}
            />
        )}
      </PageWrapper>
       <Modal title="Filter & Sort Products" isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <div className="space-y-4">
            <div>
                <label htmlFor="filter_status" className="text-sm font-medium text-text-secondary">Filter by Status</label>
                <select 
                    id="filter_status" 
                    className="w-full mt-2 bg-background border-none text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={filterOptions.status}
                    onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value})}
                >
                    <option value="all">All Products</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="low_stock">Low Stock (≤5)</option>
                </select>
            </div>
             <div>
                <label htmlFor="sort" className="text-sm font-medium text-text-secondary">Sort By</label>
                <select 
                    id="sort" 
                    className="w-full mt-2 bg-background border-none text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none"
                    value={filterOptions.sortBy}
                    onChange={(e) => setFilterOptions({...filterOptions, sortBy: e.target.value})}
                >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="stock_desc">Stock (High to Low)</option>
                    <option value="stock_asc">Stock (Low to High)</option>
                    <option value="price_desc">Sell Price (High to Low)</option>
                    <option value="price_asc">Sell Price (Low to High)</option>
                </select>
            </div>
            <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
        </div>
    </Modal>
      <BottomNav />
    </>
  );
};

export default ProductsScreen;