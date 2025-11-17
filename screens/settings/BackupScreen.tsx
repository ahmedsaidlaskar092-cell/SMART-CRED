
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { ArrowLeft, Download, Upload } from 'lucide-react';

const BackupScreen: React.FC = () => {
  const navigate = useNavigate();
  // FIX: Replaced `creditEntries` with `paymentsReceived` to match the DataContext.
  const { customers, products, sales, purchases, paymentsReceived, restoreData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const dataToExport = {
      customers,
      products,
      sales,
      purchases,
      paymentsReceived,
      exportDate: new Date().toISOString(),
    };
    
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    
    const link = document.createElement("a");
    link.href = jsonString;
    const date = new Date().toISOString().split('T')[0];
    link.download = `gst-tracker-backup-${date}.json`;
    link.click();
    
    setMessage({ text: 'Data exported successfully!', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const data = JSON.parse(text);
          const success = restoreData(data);
          if (success) {
            setMessage({ text: 'Data imported successfully! The app will now reload.', type: 'success' });
            setTimeout(() => window.location.reload(), 2000);
          } else {
            throw new Error('Invalid backup file structure.');
          }
        }
      } catch (error) {
        setMessage({ text: 'Error importing file. Please check the file format.', type: 'error' });
        console.error("Import error:", error);
      } finally {
         setTimeout(() => setMessage(null), 3000);
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <PageWrapper>
      <header className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
        <h1 className="text-2xl font-bold font-poppins text-text-primary">Export / Backup</h1>
      </header>

      <div className="bg-card p-6 rounded-lg space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Export Data</h2>
            <p className="text-text-secondary mt-1 mb-4 text-sm">
                Download a JSON file containing all your app data (customers, products, sales, etc.). Keep this file in a safe place.
            </p>
            <Button onClick={handleExport} className="w-full flex items-center justify-center">
                <Download size={20} className="mr-2" /> Export Data
            </Button>
          </div>
        
          <hr className="border-gray-700/50" />
          
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Import Data</h2>
            <p className="text-text-secondary mt-1 mb-4 text-sm">
                Restore your data from a previously exported JSON file. <span className="font-bold text-red-500">Warning: This will overwrite all current data in the app.</span>
            </p>
            <Button onClick={handleImportClick} variant="outline" className="w-full flex items-center justify-center">
                 <Upload size={20} className="mr-2" /> Import from File
            </Button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
            />
          </div>
      </div>
      
      {message && (
        <div className={`mt-6 p-4 rounded-lg text-center font-semibold ${message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {message.text}
        </div>
      )}

    </PageWrapper>
  );
};

export default BackupScreen;
