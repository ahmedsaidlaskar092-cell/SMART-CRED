import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Sale, Customer, Product, Firm } from '../types';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft, Printer, Share2, Download } from 'lucide-react';

declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

const BillPreviewScreen: React.FC = () => {
    const { saleId } = useParams();
    const navigate = useNavigate();
    const { getSaleById, getCustomerById, getProductById } = useData();
    const { firm } = useAuth();
    
    const [sale, setSale] = useState<Sale | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const id = parseInt(saleId || '0');
        const saleData = getSaleById(id);
        if (saleData) {
            setSale(saleData);
            if (saleData.customer_id) {
                setCustomer(getCustomerById(saleData.customer_id) || null);
            }
            setProduct(getProductById(saleData.product_id) || null);
        }
    }, [saleId, getSaleById, getCustomerById, getProductById]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        const billElement = document.querySelector('.printable-content');
        if (billElement && window.html2canvas && window.jspdf) {
            window.html2canvas(billElement as HTMLElement).then((canvas: any) => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`bill-${sale?.bill_no}.pdf`);
            });
        } else {
            alert("Could not generate PDF. Please try printing to PDF instead.");
        }
    };

    const handleWhatsAppShare = () => {
        if (!sale || !product || !firm) return;
        const netAmount = sale.sell_price * sale.qty;
        const gstAmount = netAmount * (sale.sell_gst / 100);
        const paidAmount = sale.payments.filter(p => p.method !== 'Credit Sale').reduce((acc, p) => acc + p.amount, 0);
        const balanceDue = sale.total_amount - paidAmount;

        const text = `
*⭐ ${firm.name} ⭐*
-----------------------------------
*🧾 INVOICE / BILL DETAILS*
Bill No.: ${sale.bill_no}
Date: ${new Date(sale.date_time).toLocaleDateString()}
Time: ${new Date(sale.date_time).toLocaleTimeString()}

${customer ? `
*👤 CUSTOMER*
Name: ${customer.name}
Phone: ${customer.phone}
` : ''}
-----------------------------------
*📦 ITEM DETAILS*
• *${product.name}*
  Qty: ${sale.qty}
  Rate (ex GST): ₹${sale.sell_price.toFixed(2)}
  GST ${sale.sell_gst}%: ₹${gstAmount.toFixed(2)}
  Subtotal: ₹${(netAmount + gstAmount).toFixed(2)}
-----------------------------------
*💰 PAYMENT SUMMARY*
Net Amount (ex GST): ₹${netAmount.toFixed(2)}
Total GST: ₹${gstAmount.toFixed(2)}
*Gross Amount: ₹${(netAmount + gstAmount).toFixed(2)}*
Discount: - ₹${sale.discount.toFixed(2)}
Paid Amount: ₹${paidAmount.toFixed(2)}
*Balance Due: ₹${balanceDue.toFixed(2)}*

Payment(s): ${sale.payments.map(p => `${p.method}: ₹${p.amount.toFixed(2)}`).join(', ')}
-----------------------------------
*Final Payable: ₹${sale.total_amount.toFixed(2)}*
-----------------------------------
*🙏 THANK YOU FOR YOUR BUSINESS 🙏*
        `;

        const encodedText = encodeURIComponent(text.trim());
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    };

    if (!sale || !product || !firm) {
        return <PageWrapper><div className="text-center mt-10">Loading Bill...</div></PageWrapper>;
    }
    
    const netAmount = sale.sell_price * sale.qty;
    const gstAmount = netAmount * (sale.sell_gst / 100);
    const paidAmount = sale.payments.filter(p => p.method !== 'Credit Sale').reduce((acc, p) => acc + p.amount, 0);
    const balanceDue = sale.total_amount - paidAmount;

    return (
        <PageWrapper>
             <header className="flex items-center mb-6 no-print">
                <button onClick={() => navigate('/')} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Bill Preview</h1>
            </header>

            <div className="font-roboto-mono text-sm bg-card text-text-primary p-4 rounded-lg printable-content" id="bill-content">
                <div className="text-center border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                    <h2 className="font-bold text-lg">⭐ {firm.name} ⭐</h2>
                    {firm.tagline && <p>{firm.tagline}</p>}
                </div>
                <div className="text-center border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                    {firm.address && <p>Address: {firm.address}</p>}
                    {firm.phone && <p>Phone: {firm.phone}</p>}
                    {firm.gstin && <p>GSTIN: {firm.gstin}</p>}
                </div>

                <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                    <h3 className="font-bold text-center mb-1">INVOICE / BILL DETAILS</h3>
                    <div className="flex justify-between"><span>Bill No.:</span> <span>{sale.bill_no}</span></div>
                    <div className="flex justify-between"><span>Bill Type:</span> <span>Sale</span></div>
                    <div className="flex justify-between"><span>Date:</span> <span>{new Date(sale.date_time).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span>Time:</span> <span>{new Date(sale.date_time).toLocaleTimeString()}</span></div>
                </div>

                {customer && (
                    <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        <h3 className="font-bold text-center mb-1">CUSTOMER</h3>
                        <div className="flex justify-between"><span>Name:</span> <span>{customer.name}</span></div>
                        <div className="flex justify-between"><span>Phone:</span> <span>{customer.phone}</span></div>
                    </div>
                )}
                
                <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                    <h3 className="font-bold text-center mb-1">ITEM DETAILS</h3>
                    <p className="font-bold">• {product.name}</p>
                    <div className="pl-4">
                        <div className="flex justify-between"><span>Qty:</span> <span>{sale.qty}</span></div>
                        <div className="flex justify-between"><span>Rate (ex GST):</span> <span>₹{sale.sell_price.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>GST {sale.sell_gst}%:</span> <span>₹{gstAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold"><span>Subtotal:</span> <span>₹{(netAmount + gstAmount).toFixed(2)}</span></div>
                    </div>
                </div>
                
                <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                    <h3 className="font-bold text-center mb-1">PAYMENT SUMMARY</h3>
                    <div className="flex justify-between"><span>Net Amount (ex GST):</span> <span>₹{netAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Total GST:</span> <span>₹{gstAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>Gross Amount:</span> <span>₹{(netAmount + gstAmount).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span>- ₹{sale.discount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Paid Amount:</span> <span>₹{paidAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold"><span>Balance Due:</span> <span>₹{balanceDue.toFixed(2)}</span></div>
                     <div className="mt-1">
                        <span>Payment Mode(s):</span>
                        <div className="pl-4">
                            {sale.payments.map((p, i) => <div key={i}>{p.method}: ₹{p.amount.toFixed(2)}</div>)}
                        </div>
                    </div>
                </div>

                <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                    <h3 className="font-bold text-center mb-1">BILL SUMMARY</h3>
                    <div className="flex justify-between"><span>Total Items:</span> <span>1</span></div>
                    <div className="flex justify-between"><span>Total Tax:</span> <span>₹{gstAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg"><span>Final Payable:</span> <span>₹{sale.total_amount.toFixed(2)}</span></div>
                </div>
                
                <div className="text-center mt-4">
                    <p className="font-bold">🙏 THANK YOU FOR YOUR BUSINESS 🙏</p>
                    <p>Processed by: {firm.owner_name}, {firm.name}</p>
                    <p className="text-xs mt-2">"This Bill Is Computer Generated. No Signature Required."</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 no-print">
                <Button onClick={handlePrint} variant='secondary' className="flex items-center justify-center text-sm py-2">
                    <Printer size={16} className="mr-2" /> PRINT
                </Button>
                <Button onClick={handleWhatsAppShare} variant='secondary' className="flex items-center justify-center text-sm py-2">
                    <Share2 size={16} className="mr-2" /> SHARE
                </Button>
                 <Button onClick={handleDownloadPdf} className="flex items-center justify-center text-sm py-2">
                    <Download size={16} className="mr-2" /> DOWNLOAD
                </Button>
            </div>
        </PageWrapper>
    );
};

export default BillPreviewScreen;