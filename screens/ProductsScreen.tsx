
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Search, Filter, Plus, FileSpreadsheet, Archive, LayoutGrid, List, ChevronsUpDown, ChevronDown, ChevronUp, FileUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import EmptyState from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import Modal from '../components/ui/Modal';
import { Product } from '../types';
import { exportToCsv } from '../utils/export';

type SortKey = 'name' | 'stock' | 'sell_price';
type SortDirection = 'ascending' | 'descending';

const ProductsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'ascending' });
  
  const [filterOptions, setFilterOptions] = useState({
      status: 'all', // 'all', 'active', 'inactive', 'low_stock'
  });

  const sortedProducts = useMemo(() => {
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

    if (searchTerm) {
        productsToFilter = productsToFilter.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    productsToFilter.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'sell_price') {
            aValue = a.sell_price * (1 + a.sell_gst/100);
            bValue = b.sell_price * (1 + b.sell_gst/100);
        } else {
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return productsToFilter;
  }, [products, searchTerm, filterOptions, sortConfig]);

  const requestSort = (key: SortKey) => {
      let direction: SortDirection = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };
    
  const getSortIcon = (key: SortKey) => {
      if (sortConfig.key !== key) {
          return <ChevronsUpDown size={16} className="ml-2 text-text-secondary" />;
      }
      if (sortConfig.direction === 'ascending') {
          return <ChevronUp size={16} className="ml-2" />;
      }
      return <ChevronDown size={16} className="ml-2" />;
  };

  const handleExportFiltered = () => {
    const dataToExport = sortedProducts.map(p => {
        const finalSell = p.sell_price * (1 + p.sell_gst / 100);
        return {
            ID: p.id,
            Name: p.name,
            Stock: p.stock,
            Category: p.category || 'N/A',
            'Buy Price (ex GST)': p.buy_price,
            'Buy GST %': p.buy_gst,
            'Sell Price (ex GST)': p.sell_price,
            'Sell GST %': p.sell_gst,
            'Final Sell Price': finalSell.toFixed(2),
            Status: p.is_active ? 'Active' : 'Inactive',
        };
    });
    exportToCsv(`products_filtered_${new Date().toISOString().split('T')[0]}.csv`, dataToExport);
  };

  const renderTableView = () => (
      <Card className="p-0 overflow-x-auto">
          <table className="w-full text-left">
              <thead>
                  <tr className="border-b border-gray-700/50">
                      <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer" onClick={() => requestSort('name')}>
                          <div className="flex items-center">Name {getSortIcon('name')}</div>
                      </th>
                      <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer text-right" onClick={() => requestSort('stock')}>
                          <div className="flex items-center justify-end">Stock {getSortIcon('stock')}</div>
                      </th>
                      <th className="p-3 text-sm font-semibold text-text-secondary cursor-pointer text-right" onClick={() => requestSort('sell_price')}>
                          <div className="flex items-center justify-end">Sell Price {getSortIcon('sell_price')}</div>
                      </th>
                      <th className="p-3 text-sm font-semibold text-text-secondary text-center">Status</th>
                      <th className="p-3 text-sm font-semibold text-text-secondary text-center">Actions</th>
                  </tr>
              </thead>
              <tbody>
                  {sortedProducts.map(product => {
                      const finalSell = product.sell_price * (1 + product.sell_gst / 100);
                      return (
                          <tr key={product.id} className="border-b border-gray-700/50 last:border-b-0 hover:bg-accent/50">
                              <td className="p-3 font-medium text-text-primary">{product.name}</td>
                              <td className={`p-3 font-medium text-right ${product.stock <= 5 ? 'text-red-500' : 'text-text-primary'}`}>{product.stock}</td>
                              <td className="p-3 font-medium text-text-primary text-right">₹{finalSell.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                      {product.is_active ? 'Active' : 'Inactive'}
                                  </span>
                              </td>
                              <td className="p-3 text-center">
                                <Button
                                  variant="ghost"
                                  className="w-auto h-auto px-3 py-1 text-sm"
                                  onClick={() => navigate(`/product/edit/${product.id}`)}
                                >
                                  Edit
                                </Button>
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
      </Card>
  );

  const renderCardView = () => (
      <motion.div 
          className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-4 md:space-y-0"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
          {sortedProducts.map(product => {
              const finalSell = product.sell_price * (1 + product.sell_gst / 100);
              return (
                  <motion.div
                      key={product.id}
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  >
                      <Card onClick={() => navigate(`/product/edit/${product.id}`)} className="h-full cursor-pointer transition-transform transform hover:scale-105">
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
              );
          })}
      </motion.div>
  );

  return (
    <>
      <PageWrapper>
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold font-poppins text-text-primary">Products</h1>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-card rounded-lg p-1">
              <button onClick={() => setViewMode('card')} className={`p-2 rounded ${viewMode === 'card' ? 'bg-primary text-white' : 'text-text-secondary'}`}><LayoutGrid size={20}/></button>
              <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary'}`}><List size={20}/></button>
            </div>
             <Button variant="secondary" className="w-auto px-4 py-2 flex items-center" onClick={handleExportFiltered}>
              <FileUp size={20} className="mr-2"/> Export
            </Button>
            <Button className="w-auto px-4 py-2 flex items-center" onClick={() => navigate('/add-product')}>
              <Plus size={20} className="mr-2"/> Add
            </Button>
             <Button variant="secondary" className="w-auto px-4 py-2 flex items-center" onClick={() => navigate('/bulk-add-products')}>
              <FileSpreadsheet size={20} className="mr-2"/> Bulk
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

        {sortedProducts.length > 0 ? (
          <>
            <div className="hidden md:block">
              {viewMode === 'table' ? renderTableView() : renderCardView()}
            </div>
            <div className="md:hidden">
              {renderCardView()}
            </div>
          </>
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
       <Modal title="Filter Products" isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
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
            <Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
        </div>
    </Modal>
    </>
  );
};

export default ProductsScreen;
