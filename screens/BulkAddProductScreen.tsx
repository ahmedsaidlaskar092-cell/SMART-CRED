
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface ProductRow {
  id: number;
  name: string;
  buyPrice: string;
  buyGst: string;
  sellPrice: string;
  sellGst: string;
  stock: string;
}

const BulkAddProductScreen: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ProductRow[]>([{ id: 1, name: '', buyPrice: '', buyGst: '', sellPrice: '', sellGst: '', stock: '' }]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), name: '', buyPrice: '', buyGst: '', sellPrice: '', sellGst: '', stock: '' }]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };
  
  const handleInputChange = (id: number, field: keyof Omit<ProductRow, 'id'>, value: string) => {
      setRows(rows.map(row => row.id === id ? {...row, [field]: value} : row));
  };

  return (
    <PageWrapper>
      <header className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold font-poppins text-text-primary">Bulk Add Products</h1>
      </header>
      
      <div className="overflow-x-auto -mx-4 flex-grow">
          <div className="min-w-[700px] px-4">
            <div className="grid grid-cols-7 gap-2 font-bold text-sm text-text-secondary pb-2 border-b border-card">
              <div className="col-span-2">Product Name</div>
              <div>Buy Price</div>
              <div>Buy GST%</div>
              <div>Sell Price</div>
              <div>Sell GST%</div>
              <div>Stock</div>
            </div>
            <div className="space-y-2 mt-2">
                {rows.map(row => (
                    <div key={row.id} className="grid grid-cols-7 gap-2 items-center">
                        <input className="bg-card rounded p-2 col-span-2" placeholder="Name" value={row.name} onChange={e => handleInputChange(row.id, 'name', e.target.value)} />
                        <input className="bg-card rounded p-2" placeholder="Buy Price" value={row.buyPrice} onChange={e => handleInputChange(row.id, 'buyPrice', e.target.value)} type="number" />
                        <input className="bg-card rounded p-2" placeholder="GST" value={row.buyGst} onChange={e => handleInputChange(row.id, 'buyGst', e.target.value)} type="number" />
                        <input className="bg-card rounded p-2" placeholder="Sell Price" value={row.sellPrice} onChange={e => handleInputChange(row.id, 'sellPrice', e.target.value)} type="number" />
                        <input className="bg-card rounded p-2" placeholder="GST" value={row.sellGst} onChange={e => handleInputChange(row.id, 'sellGst', e.target.value)} type="number" />
                        <div className="flex items-center gap-2">
                             <input className="bg-card rounded p-2 w-full" placeholder="Stock" value={row.stock} onChange={e => handleInputChange(row.id, 'stock', e.target.value)} type="number" />
                             <button onClick={() => removeRow(row.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </div>

      <div className="mt-4 pt-4 border-t border-card flex flex-col sm:flex-row gap-2">
        <Button onClick={addRow} variant="secondary" className="flex-1 flex items-center justify-center">
            <Plus size={20} className="mr-2"/> Add Row
        </Button>
        <Button className="flex-1">Save All Products</Button>
      </div>
    </PageWrapper>
  );
};

export default BulkAddProductScreen;
