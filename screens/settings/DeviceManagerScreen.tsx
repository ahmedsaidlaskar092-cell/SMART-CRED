
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { ArrowLeft, Smartphone } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Device } from '../../types';

const DeviceManagerScreen: React.FC = () => {
    const navigate = useNavigate();
    const { devices, currentDeviceId, removeDevice } = useAuth();
    const [deviceToRemove, setDeviceToRemove] = useState<Device | null>(null);

    const handleRemoveConfirm = () => {
        if (deviceToRemove) {
            removeDevice(deviceToRemove.id);
            setDeviceToRemove(null);
        }
    };

    return (
        <>
            <PageWrapper>
                <header className="flex items-center mb-6">
                    <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                    <h1 className="text-2xl font-bold font-poppins text-text-primary">Device Manager</h1>
                </header>
                <p className="text-text-secondary mb-6 -mt-4">
                    You can have up to 3 devices logged in. Remove a device to free up a slot.
                </p>

                <div className="flex-grow">
                    {devices.length > 0 ? (
                        <div className="space-y-3">
                            {devices.map(device => (
                                <Card key={device.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center">
                                        <Smartphone className="text-text-secondary mr-4" size={24}/>
                                        <div>
                                            <p className="font-bold text-text-primary">{device.name}</p>
                                            <p className="text-sm text-text-secondary">Last login: {new Date(device.lastLogin).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    {device.id === currentDeviceId ? (
                                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-500">CURRENT</span>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            className="w-auto px-4 py-1 text-sm border-red-500 text-red-500 hover:bg-red-500/10" 
                                            onClick={() => setDeviceToRemove(device)}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<Smartphone size={40} className="text-primary"/>}
                            title="No Devices Found"
                            message="This is the first device you've logged in with. Other devices will appear here as they log in."
                        />
                    )}
                </div>
            </PageWrapper>
            <Modal isOpen={!!deviceToRemove} onClose={() => setDeviceToRemove(null)} title="Confirm Remove Device">
                <p className="text-text-primary mb-4">Are you sure you want to remove "<span className="font-bold">{deviceToRemove?.name}</span>"? This will log out the device and free up a slot.</p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setDeviceToRemove(null)}>Cancel</Button>
                    <Button onClick={handleRemoveConfirm} className="bg-red-600 hover:bg-red-700">Remove</Button>
                </div>
            </Modal>
        </>
    );
};

export default DeviceManagerScreen;
