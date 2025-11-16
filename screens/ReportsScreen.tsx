
import React, { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import BottomNav from '../components/layout/BottomNav';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Bot, SearchCheck } from 'lucide-react';

const tabs = ['Sales', 'Purchases', 'Credit', 'GST', 'P&L'];

type GeminiMode = 'search' | 'think';

const ReportsScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Sales');
    const [geminiMode, setGeminiMode] = useState<GeminiMode>('search');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setResult('');
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            let response;
            if (geminiMode === 'search') {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                    },
                });
            } else {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: `Based on a small business's data, answer this: ${prompt}`,
                    config: {
                        thinkingConfig: { thinkingBudget: 32768 }
                    },
                });
            }
            setResult(response.text);
        } catch (e) {
            console.error(e);
            setError('Failed to get response from Gemini. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <PageWrapper>
                <h1 className="text-3xl font-bold font-poppins text-text-primary mb-6">Reports</h1>

                <div className="flex border-b border-card mb-4">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-text-secondary'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                {/* Placeholder for report content */}
                <div className="bg-card p-8 rounded-lg text-center text-text-secondary mb-8">
                    <p>{activeTab} report data will be displayed here.</p>
                </div>

                {/* Gemini Business Assistant */}
                <div className="bg-card p-4 rounded-lg">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-primary"/> Gemini Business Assistant</h2>
                    <p className="text-sm text-text-secondary mt-1 mb-4">Get up-to-date info or deep analysis.</p>

                    <div className="flex gap-2 mb-4 rounded-lg bg-background p-1">
                        <button onClick={() => setGeminiMode('search')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${geminiMode === 'search' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
                           <SearchCheck size={16}/> Quick Answer
                        </button>
                        <button onClick={() => setGeminiMode('think')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${geminiMode === 'think' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
                           <Bot size={16}/> Deep Analysis
                        </button>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={geminiMode === 'search' ? 'e.g., Latest GST updates for retailers' : 'e.g., Analyze my sales and suggest growth strategies'}
                        className="w-full bg-background border-none rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-sm"
                        rows={3}
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg mt-2 disabled:bg-gray-500">
                        {isLoading ? 'Generating...' : 'Ask Gemini'}
                    </button>
                    
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                    
                    {result && (
                        <div className="mt-4 p-3 bg-background rounded-lg text-sm prose prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans">{result}</pre>
                        </div>
                    )}
                </div>

            </PageWrapper>
            <BottomNav />
        </>
    );
};

export default ReportsScreen;
