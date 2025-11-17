
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import PageWrapper from '../components/layout/PageWrapper';
import { ArrowLeft } from 'lucide-react';
import { Firm } from '../types';

const FirmSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { firm, updateFirm } = useAuth();
  const [firmDetails, setFirmDetails] = useState<Partial<Firm>>(firm || {});
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFirmDetails({ ...firmDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firmDetails.name || !firmDetails.owner_name) {
        alert("Firm Name and Owner Name are required.");
        return;
    }

    const detailsToSave = {
        ...firmDetails,
        default_gst: firmDetails.default_gst ? Number(firmDetails.default_gst) : undefined,
    };

    updateFirm(detailsToSave);
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <PageWrapper>
      <header className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
          <h1 className="text-2xl font-bold font-poppins text-text-primary">Firm Settings</h1>
      </header>
      <p className="text-text-secondary mb-6 -mt-4">
        Edit your business details.
      </p>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="md:grid md:grid-cols-2 md:gap-x-8">
            <div className="space-y-4">
              <Input label="Firm Name" id="name" name="name" type="text" value={firmDetails.name || ''} onChange={handleChange} required />
              <Input label="Owner Name" id="owner_name" name="owner_name" type="text" value={firmDetails.owner_name || ''} onChange={handleChange} required />
              <div className="w-full">
                <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">Address</label>
                <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={firmDetails.address || ''}
                    onChange={handleChange}
                    className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <Input label="Phone / WhatsApp" id="phone" name="phone" type="tel" value={firmDetails.phone || ''} onChange={handleChange} />
            </div>
            <div className="space-y-4 mt-4 md:mt-0">
              <Input label="GSTIN" id="gstin" name="gstin" type="text" value={firmDetails.gstin || ''} onChange={handleChange} />
              <Input label="Tagline (optional)" id="tagline" name="tagline" type="text" value={firmDetails.tagline || ''} onChange={handleChange} />
              <div>
                <label htmlFor="default_gst" className="block text-sm font-medium text-text-secondary mb-1">Default GST Rate %</label>
                <select
                    id="default_gst"
                    name="default_gst"
                    value={firmDetails.default_gst || ''}
                    onChange={handleChange}
                    className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                    <option value="">Not Set</option>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Button type="submit">
            {isSaved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </PageWrapper>
  );
};

export default FirmSettingsScreen;
