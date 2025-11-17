
import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { Customer, Firm } from '../types';
import Button from './ui/Button';
import { Copy, Send } from 'lucide-react';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
    firm: Firm;
    dueAmount: number;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, customer, firm, dueAmount }) => {
    const [message, setMessage] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (customer && firm && dueAmount > 0) {
            const defaultMessage = `
Dear ${customer.name},

This is a friendly reminder from ${firm.name} regarding your outstanding payment.

Amount Due: ₹${dueAmount.toLocaleString('en-IN')}

We would appreciate it if you could settle the payment at your earliest convenience.

Thank you,
${firm.name}
${firm.phone || ''}
            `.trim();
            setMessage(defaultMessage);
        }
    }, [customer, firm, dueAmount]);

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleWhatsAppSend = () => {
        const encodedText = encodeURIComponent(message);
        const phone = customer.phone.replace('+', '');
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`, '_blank');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Remind ${customer.name}`}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="reminder_message" className="block text-sm font-medium text-text-secondary mb-1">
                        Reminder Message
                    </label>
                    <textarea
                        id="reminder_message"
                        rows={8}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-background border border-gray-600 text-text-primary rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="secondary" className="flex-1 flex items-center justify-center">
                        <Copy size={16} className="mr-2" /> {isCopied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button onClick={handleWhatsAppSend} className="flex-1 flex items-center justify-center">
                        <Send size={16} className="mr-2" /> Send via WhatsApp
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReminderModal;
