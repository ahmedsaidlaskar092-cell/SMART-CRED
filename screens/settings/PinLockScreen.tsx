
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '../../contexts/PinContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

type Stage = 'idle' | 'setCurrent' | 'setNew' | 'confirmNew' | 'remove';

const PinLockScreen: React.FC = () => {
    const navigate = useNavigate();
    const { isPinSet, setPin, verifyPin } = usePin();
    const [stage, setStage] = useState<Stage>('idle');
    const [pin, setPinInput] = useState('');
    const [newPin, setNewPin] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleKeyPress = (key: string) => {
        if (pin.length < 4) {
            setPinInput(pin + key);
        }
    };

    const handleDelete = () => setPinInput(pin.slice(0, -1));

    const reset = () => {
        setPinInput('');
        setNewPin('');
        setStage('idle');
        setMessage(null);
    };

    const handlePinAction = () => {
        if (pin.length !== 4) return;

        switch (stage) {
            case 'setNew':
                setNewPin(pin);
                setPinInput('');
                setStage('confirmNew');
                break;
            case 'confirmNew':
                if (pin === newPin) {
                    setPin(pin);
                    setMessage({ text: 'PIN set successfully!', type: 'success' });
                    setTimeout(reset, 1500);
                } else {
                    setMessage({ text: 'PINs do not match. Try again.', type: 'error' });
                    setTimeout(() => {
                        setPinInput('');
                        setNewPin('');
                        setStage('setNew');
                        setMessage(null);
                    }, 1500);
                }
                break;
            case 'remove':
                if (verifyPin(pin)) {
                    setPin(null);
                    setMessage({ text: 'PIN removed successfully!', type: 'success' });
                    setTimeout(reset, 1500);
                } else {
                    setMessage({ text: 'Incorrect PIN.', type: 'error' });
                    setTimeout(() => {
                        setPinInput('');
                        setMessage(null);
                    }, 1500);
                }
                break;
        }
    };
    
    React.useEffect(() => {
        if (pin.length === 4) handlePinAction();
    }, [pin]);

    const getStageInfo = () => {
        switch (stage) {
            case 'setNew': return 'Enter a new 4-digit PIN';
            case 'confirmNew': return 'Confirm your new PIN';
            case 'remove': return 'Enter current PIN to remove';
            default: return isPinSet ? 'PIN is enabled' : 'PIN is disabled';
        }
    };

    const pinDots = Array(4).fill(0).map((_, i) => (
      <div key={i} className={`w-4 h-4 rounded-full border-2 ${i < pin.length ? 'bg-primary border-primary' : 'border-text-secondary'}`} />
    ));

    return (
        <PageWrapper>
            <header className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">App PIN Lock</h1>
            </header>
            
            <div className="flex-grow flex flex-col items-center justify-center text-center">
                {stage === 'idle' ? (
                    <div className="w-full max-w-sm space-y-4">
                        <p className="text-lg text-text-secondary">{getStageInfo()}</p>
                        <Button onClick={() => setStage('setNew')}>{isPinSet ? 'Change PIN' : 'Set PIN'}</Button>
                        {isPinSet && <Button variant="outline" onClick={() => setStage('remove')}>Remove PIN</Button>}
                    </div>
                ) : (
                    <div className="w-full max-w-xs">
                        <p className="text-lg text-text-secondary mb-4">{getStageInfo()}</p>
                        <div className="flex justify-center gap-4 mb-8">{pinDots}</div>
                        {message && (
                            <div className={`flex items-center justify-center gap-2 mb-4 font-semibold ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                {message.text}
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-4">
                            {[...Array(9).keys()].map(i => i + 1).map(key => (
                                <button key={key} onClick={() => handleKeyPress(key.toString())} className="h-16 text-2xl font-bold bg-card rounded-full transition-transform transform active:scale-95">{key}</button>
                            ))}
                            <div/>
                            <button onClick={() => handleKeyPress('0')} className="h-16 text-2xl font-bold bg-card rounded-full transition-transform transform active:scale-95">0</button>
                            <button onClick={handleDelete} className="h-16 text-2xl font-bold bg-card rounded-full flex items-center justify-center transition-transform transform active:scale-95 text-text-secondary">{'<'}</button>
                        </div>
                        <Button variant="ghost" onClick={reset} className="mt-6">Cancel</Button>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default PinLockScreen;
