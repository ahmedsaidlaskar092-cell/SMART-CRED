import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Sale, Customer, Product, SaleItem } from '../types';
import PageWrapper from '../components/layout/PageWrapper';
import Button from '../components/ui/Button';
import { ArrowLeft, Printer, Share2, Download, Building, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';


declare global {
    interface Window {
        html2canvas: any;
        jspdf: any;
    }
}

const BillPreviewScreen: React.FC = () => {
    const { saleId } = useParams();
    const navigate = useNavigate();
    const { getSaleById, getCustomerById, getProductById, deleteSale } = useData();
    const { firm } = useAuth();
    
    const [sale, setSale] = useState<Sale | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [billType, setBillType] = useState<'with-gst' | 'without-gst'>('with-gst');


    useEffect(() => {
        const id = parseInt(saleId || '0');
        const saleData = getSaleById(id);
        if (saleData) {
            setSale(saleData);
            if (saleData.customer_id) {
                setCustomer(getCustomerById(saleData.customer_id) || null);
            }
        }
    }, [saleId, getSaleById, getCustomerById]);

    const handleDelete = () => {
        if (sale) {
            deleteSale(sale.id);
            navigate('/sales');
        }
    }

    const handlePrint = () => window.print();

    const handleDownloadPdf = () => {
        const billElement = document.querySelector('.printable-content');
        if (billElement && window.html2canvas && window.jspdf) {
            window.html2canvas(billElement as HTMLElement, { scale: 2 }).then((canvas: any) => {
                const imgData = canvas.toDataURL('image/png');
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'px',
                    format: [canvas.width, canvas.height]
                });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`bill-${sale?.bill_no}-${billType}.pdf`);
            });
        } else {
            alert("Could not generate PDF. Please try printing to PDF instead.");
        }
    };

    const handleWhatsAppShare = () => {
        if (!sale || !firm) return;
        
        const paidAmount = sale.payments.filter(p => p.method !== 'Credit Sale').reduce((acc, p) => acc + p.amount, 0);
        let text = '';
        const isGstBill = billType === 'with-gst';

        const itemsText = sale.items.map(item => {
            const product = getProductById(item.product_id);
            const netAmount = item.sell_price * item.qty;
            if (isGstBill) {
                 const gstAmount = netAmount * (item.sell_gst / 100);
                 return `• *${product?.name || 'Product'}*
  Qty: ${item.qty} @ ₹${item.sell_price.toFixed(2)}
  Net: ₹${netAmount.toFixed(2)}
  GST ${item.sell_gst}%: ₹${gstAmount.toFixed(2)}`;
            } else {
                return `• *${product?.name || 'Product'}*
  Qty: ${item.qty}
  Rate: ₹${item.sell_price.toFixed(2)}
  Amount: ₹${netAmount.toFixed(2)}`;
            }
        }).join('\n');
        
        const totalAmountWithoutGst = sale.items.reduce((acc, item) => acc + (item.sell_price * item.qty), 0);

        text = `
*⭐ ${firm.name} ⭐*
-----------------------------------
*🧾 ${isGstBill ? 'TAX INVOICE' : 'CASH MEMO / ESTIMATE'}*
Bill No: *${sale.bill_no}*
Date: ${new Date(sale.date_time).toLocaleDateString()}
${customer ? `
*👤 CUSTOMER*
Name: ${customer.name}
Phone: ${customer.phone}
` : ''}-----------------------------------
*📦 ITEM DETAILS*
${itemsText}
-----------------------------------
*💰 PAYMENT SUMMARY*
Subtotal: ₹${(isGstBill ? sale.total_amount + sale.discount : totalAmountWithoutGst).toFixed(2)}
Discount: - ₹${sale.discount.toFixed(2)}
*Final Payable: ₹${(isGstBill ? sale.total_amount : totalAmountWithoutGst - sale.discount).toFixed(2)}*
Paid: ₹${paidAmount.toFixed(2)}
Due: ₹${((isGstBill ? sale.total_amount : totalAmountWithoutGst - sale.discount) - paidAmount).toFixed(2)}
-----------------------------------
*🙏 THANK YOU 🙏*
            `;

        const encodedText = encodeURIComponent(text.trim());
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
    };

    if (!firm) {
        return (
            <PageWrapper>
                <div className="text-center mt-20 flex flex-col items-center">
                    <Building size={48} className="text-primary mb-4" />
                    <h1 className="text-2xl font-bold font-poppins mb-2">Firm Details Not Set Up</h1>
                    <p className="text-text-secondary mb-6 max-w-sm">
                        Please provide your firm's details in the settings to generate and view bills.
                    </p>
                    <Button onClick={() => navigate('/settings/firm')} className="w-auto px-6">
                        Go to Firm Settings
                    </Button>
                </div>
            </PageWrapper>
        );
    }

    if (!sale) {
        return <PageWrapper><div className="text-center mt-10">Loading Bill...</div></PageWrapper>;
    }
    
    const isGstBill = billType === 'with-gst';
    
    // Calculations
    const paidAmount = sale.payments.filter(p => p.method !== 'Credit Sale').reduce((acc, p) => acc + p.amount, 0);
    const totalAmountWithoutGst = sale.items.reduce((acc, item) => acc + (item.sell_price * item.qty), 0);
    const finalPayableWithoutGst = totalAmountWithoutGst - sale.discount;

    const balanceDueWithGst = sale.total_amount - paidAmount;
    const balanceDueWithoutGst = finalPayableWithoutGst - paidAmount;

    return (
        <>
        <PageWrapper>
             <header className="flex items-center mb-6 no-print">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-card"><ArrowLeft /></button>
                <h1 className="text-2xl font-bold font-poppins text-text-primary">Bill Preview</h1>
            </header>

            <div className="lg:grid lg:grid-cols-3 lg:gap-8 items-start">
                <div className="lg:col-span-2 font-roboto-mono text-sm bg-card text-text-primary p-4 rounded-lg printable-content" id="bill-content">
                    <div className="text-center border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        <h2 className="font-bold text-lg">⭐ {firm.name} ⭐</h2>
                        {firm.tagline && <p>{firm.tagline}</p>}
                    </div>
                    <div className="text-center border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        {firm.address && <p>Address: {firm.address}</p>}
                        {firm.phone && <p>Phone: {firm.phone}</p>}
                        {isGstBill && firm.gstin && <p>GSTIN: {firm.gstin}</p>}
                    </div>

                    <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        <h3 className="font-bold text-center mb-1">{isGstBill ? 'TAX INVOICE' : 'CASH MEMO / ESTIMATE'}</h3>
                        <div className="flex justify-between"><span>Bill No.:</span> <span>{sale.bill_no}</span></div>
                        <div className="flex justify-between"><span>Date:</span> <span>{new Date(sale.date_time).toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span>Time:</span> <span>{new Date(sale.date_time).toLocaleTimeString()}</span></div>
                    </div>

                    {customer && (
                        <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                            <h3 className="font-bold text-center mb-1">CUSTOMER DETAILS</h3>
                            <div className="flex justify-between"><span>Name:</span> <span>{customer.name}</span></div>
                            <div className="flex justify-between"><span>Phone:</span> <span>{customer.phone}</span></div>
                        </div>
                    )}
                    
                    <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        <h3 className="font-bold text-center mb-1">ITEM DETAILS</h3>
                         <div className="space-y-2">
                            {sale.items.map(item => {
                                const product = getProductById(item.product_id);
                                const netAmount = item.sell_price * item.qty;
                                const gstAmount = netAmount * (item.sell_gst / 100);
                                return (
                                    <div key={item.product_id} className="pt-1">
                                        <p className="font-bold">• {product?.name || 'Product'}</p>
                                        <div className="pl-4">
                                            <div className="flex justify-between"><span>Qty:</span> <span>{item.qty}</span></div>
                                            <div className="flex justify-between"><span>Rate {isGstBill ? '(ex GST)' : ''}:</span> <span>₹{item.sell_price.toFixed(2)}</span></div>
                                            {isGstBill && (
                                                <div className="flex justify-between"><span>GST {item.sell_gst}%:</span> <span>₹{gstAmount.toFixed(2)}</span></div>
                                            )}
                                            <div className="flex justify-between font-bold"><span>Amount:</span> <span>₹{(isGstBill ? netAmount + gstAmount : netAmount).toFixed(2)}</span></div>
                                        </div>
                                    </div>
                                )
                            })}
                         </div>
                    </div>
                    
                    <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        <h3 className="font-bold text-center mb-1">PAYMENT SUMMARY</h3>
                         <div className="flex justify-between"><span>Subtotal:</span> <span>₹{(isGstBill ? sale.total_amount + sale.discount : totalAmountWithoutGst).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Discount:</span> <span>- ₹{sale.discount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Paid Amount:</span> <span>₹{paidAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold"><span>Balance Due:</span> <span>₹{(isGstBill ? balanceDueWithGst : balanceDueWithoutGst).toFixed(2)}</span></div>
                    </div>

                    <div className="border-b-2 border-dashed border-gray-500 pb-2 mb-2">
                        <h3 className="font-bold text-center mb-1">BILL SUMMARY</h3>
                        <div className="flex justify-between font-bold text-lg"><span>Final Payable:</span> <span>₹{(isGstBill ? sale.total_amount : finalPayableWithoutGst).toFixed(2)}</span></div>
                    </div>
                    
                    <div className="text-center mt-4">
                        <p className="font-bold">🙏 THANK YOU FOR YOUR BUSINESS 🙏</p>
                    </div>
                </div>

                <div className="mt-6 lg:mt-0 no-print lg:col-span-1">
                    <Card className="space-y-3">
                        <h3 className="text-lg font-bold text-text-primary">Bill Format</h3>
                        <div className="flex bg-background p-1 rounded-lg">
                            <button 
                                onClick={() => setBillType('with-gst')}
                                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${billType === 'with-gst' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                            >
                                With GST
                            </button>
                            <button 
                                onClick={() => setBillType('without-gst')}
                                className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${billType === 'without-gst' ? 'bg-primary text-white' : 'text-text-secondary'}`}
                            >
                                Without GST
                            </button>
                        </div>
                        <hr className="border-gray-700/50 !my-4"/>
                        <h3 className="text-lg font-bold text-text-primary">Actions</h3>
                        <Button onClick={handlePrint} variant='secondary' className="flex items-center justify-center">
                            <Printer size={16} className="mr-2" /> PRINT BILL
                        </Button>
                        <Button onClick={handleWhatsAppShare} variant='secondary' className="flex items-center justify-center">
                            <Share2 size={16} className="mr-2" /> SHARE ON WHATSAPP
                        </Button>
                        <Button onClick={handleDownloadPdf} className="flex items-center justify-center">
                            <Download size={16} className="mr-2" /> DOWNLOAD PDF
                        </Button>
                        <hr className="border-gray-700/50 !my-4"/>
                        <Button onClick={() => setIsDeleteModalOpen(true)} variant="outline" className="flex items-center justify-center w-full text-red-500 border-red-500 hover:bg-red-500/10">
                            <Trash2 size={16} className="mr-2"/> DELETE BILL
                        </Button>
                    </Card>
                </div>
            </div>
        </PageWrapper>
        <Modal title="Confirm Deletion" isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
            <p className="text-text-primary mb-4">Are you sure you want to delete bill <span className="font-bold">{sale?.bill_no}</span>? This will restore the product stock and reverse any credit entry. This action cannot be undone.</p>
            <div className="flex gap-4">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
        </Modal>
        </>
    );
};

export default BillPreviewScreen;