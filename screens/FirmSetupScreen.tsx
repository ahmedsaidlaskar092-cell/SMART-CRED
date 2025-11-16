import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Firm } from '../types';

const FirmSetupScreen: React.FC = () => {
  const { completeFirmSetup } = useAuth();
  const [firmDetails, setFirmDetails] = useState<Partial<Firm>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFirmDetails({ ...firmDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFirm: Firm = {
      id: 1,
      name: firmDetails.name || "My Business",
      owner_name: firmDetails.owner_name || "Owner",
      address: firmDetails.address,
      phone: firmDetails.phone,
      gstin: firmDetails.gstin,
      tagline: firmDetails.tagline,
      default_gst: firmDetails.default_gst ? Number(firmDetails.default_gst) : undefined,
    };
    completeFirmSetup(newFirm);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col justify-center items-center p-4"
    >
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold font-poppins text-text-primary mb-2 text-center">Set up your Firm</h1>
        <p className="text-text-secondary mb-8 text-center">Tell us about your business.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Firm Name" id="name" name="name" type="text" onChange={handleChange} required />
          <Input label="Owner Name" id="owner_name" name="owner_name" type="text" onChange={handleChange} required />
          <div className="w-full">
            <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">Address</label>
            <textarea
                id="address"
                name="address"
                rows={3}
                onChange={handleChange}
                className="w-full bg-card border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <Input label="Phone / WhatsApp" id="phone" name="phone" type="tel" onChange={handleChange} />
          <Input label="GSTIN" id="gstin" name="gstin" type="text" onChange={handleChange} />
          <Input label="Tagline (optional)" id="tagline" name="tagline" type="text" onChange={handleChange} />

          <div>
            <label htmlFor="default_gst" className="block text-sm font-medium text-text-secondary mb-1">Default GST Rate % (Optional)</label>
            <select
                id="default_gst"
                name="default_gst"
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

          <div className="pt-4">
            <Button type="submit">Save & Continue</Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default FirmSetupScreen;