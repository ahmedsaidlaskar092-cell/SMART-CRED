import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { ArrowLeft, Database, Trash2, CheckCircle, XCircle, Wand2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const MockDataScreen: React.FC = () => {
  const navigate = useNavigate();
  const { loadMockData, clearAllData, generateAndAddRandomProducts } = useData();
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const [businessType, setBusinessType] = useState('Kirana Store');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLoadMockData = () => {
    loadMockData();
    setMessage({ text: 'Mock data loaded successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };
  
  const handleClearData = () => {
      clearAllData();
      setIsConfirmModalOpen(false);
      setMessage({ text: 'All app data has been cleared.', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
  };

  const handleGenerateProducts = async () => {
    if (!businessType.trim()) {
        setMessage({ text: 'Please enter a business type.', type: 'error' });
        return;
    }
    setIsGenerating(true);
    setMessage(null);
    try {
        await generateAndAddRandomProducts(businessType);
        setMessage({ text: '20 random products generated and added successfully!', type: 'success' });
    } catch (error) {
        setMessage({ text: (error as Error).message || 'An unknown error occurred.', type: 'error' });
    } finally {
        setIsGenerating(false);
        setTimeout(() => setMessage(null), 4000);
    }
  };


  return (
    <>
      <PageWrapper>
        <header className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
          <h1 className="text-2xl font-bold font-poppins text-text-primary">Mock Data</h1>
        </header>
        
        <div className="bg-card p-6 rounded-lg space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Generate Random Products with AI</h2>
              <p className="text-text-secondary mt-1 mb-4 text-sm">
                  Enter your business type (e.g., "Electronics Shop", "Cafe") and let AI generate 20 relevant product entries for you.
              </p>
              <Input 
                label="Business Type"
                id="business_type"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Grocery Store"
              />
              <Button onClick={handleGenerateProducts} disabled={isGenerating} className="w-full flex items-center justify-center mt-4">
                  {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                  ) : (
                    <>
                        <Wand2 size={20} className="mr-2" /> Generate Products
                    </>
                  )}
              </Button>
            </div>

            <hr className="border-gray-700/50" />

            <div>
              <h2 className="text-lg font-semibold text-text-primary">Load Sample Data</h2>
              <p className="text-text-secondary mt-1 mb-4 text-sm">
                  Populate the app with a pre-defined set of sample customers, products, and sales to see how everything works.
              </p>
              <Button onClick={handleLoadMockData} variant="secondary" className="w-full flex items-center justify-center">
                  <Database size={20} className="mr-2" /> Load Sample Data
              </Button>
            </div>
          
            <hr className="border-gray-700/50" />
            
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Clear All Data</h2>
              <p className="text-text-secondary mt-1 mb-4 text-sm">
                  <span className="font-bold text-red-500">Warning:</span> This will permanently delete all customers, products, sales, and other data from the app. This action cannot be undone.
              </p>
              <Button onClick={() => setIsConfirmModalOpen(true)} variant="outline" className="w-full flex items-center justify-center border-red-500 text-red-500 hover:bg-red-500/10">
                   <Trash2 size={20} className="mr-2" /> Clear All App Data
              </Button>
            </div>
        </div>
        
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center font-semibold flex items-center justify-center gap-2 transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0' } ${message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {message.type === 'success' ? <CheckCircle /> : <XCircle />}
              {message.text}
          </div>
        )}

      </PageWrapper>

      <Modal title="Confirm Data Deletion" isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
        <p className="text-text-primary mb-4">Are you absolutely sure you want to delete all app data? This includes customers, products, and sales. <br/><br/> <span className="font-bold">This cannot be undone.</span></p>
        <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>Cancel</Button>
            <Button onClick={handleClearData} className="bg-red-600 hover:bg-red-700">Yes, Delete Everything</Button>
        </div>
      </Modal>
    </>
  );
};

export default MockDataScreen;