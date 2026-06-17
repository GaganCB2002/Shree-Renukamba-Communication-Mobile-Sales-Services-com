import { useState, useEffect, useCallback } from 'react';
import { X, Package, User, MapPin, IndianRupee, Clock, Tag, Printer, QrCode, CheckCircle, Phone, Mail, Hash, Download, ChevronDown, RotateCcw } from 'lucide-react';
import QRCode from 'qrcode';
import { useToast } from '../contexts/ToastContext';
import { updateOrderStatus, updatePaymentStatus } from '../api/ordersApi';

const ORDER_STATUS_FLOW = [
  'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled',
];

const SHOP_ADDRESS = {
  shopName: 'Shree Renukamba Communication',
  address: 'Guttur Colony, Near Bus Stand',
  city: 'Harihar',
  state: 'Karnataka',
  pincode: '577601',
  phone: '+91 98765 43210',
  email: 'info@shreerenukamba.com',
  gstin: '29ABCDE1234F1Z5',
};

const AdminOrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);

  useEffect(() => { setLocalOrder(order); }, [order, setLocalOrder]);

  const isCod = localOrder?.paymentInfo?.method === 'cod' || !localOrder?.paymentInfo?.method;
  const totalQty = localOrder?.products?.reduce((s, p) => s + (p.quantity || 1), 0) || 0;
  const currentIdx = ORDER_STATUS_FLOW.indexOf(localOrder?.orderStatus);
  const isCancelled = localOrder?.orderStatus === 'Cancelled';

  // Build a unique, scannable QR payload with full order details
  const buildQrPayload = useCallback(() => {
    if (!localOrder) return '';
    const products = (localOrder.products || []).map(p => ({
      n: p.name || p.title || 'Item',
      q: p.quantity || 1,
      p: Number(p.price || 0),
    }));
    const payload = {
      oid: localOrder.orderId,
      c: localOrder.customer?.userId?.fullName || 'Customer',
      cp: localOrder.shippingAddress?.phone || localOrder.customer?.userId?.phoneNumber || '',
      ca: [
        localOrder.shippingAddress?.address || '',
        localOrder.shippingAddress?.city || '',
        localOrder.shippingAddress?.state || '',
        localOrder.shippingAddress?.pincode || '',
      ].filter(Boolean).join(', '),
      sa: [SHOP_ADDRESS.address, SHOP_ADDRESS.city, SHOP_ADDRESS.state, SHOP_ADDRESS.pincode].join(', '),
      sp: SHOP_ADDRESS.phone,
      t: Number(localOrder.totalAmount || 0),
      pm: isCod ? 'COD' : 'Prepaid',
      items: products,
      d: new Date(localOrder.createdAt).toISOString().split('T')[0],
      st: localOrder.orderStatus || 'Pending',
    };
    return JSON.stringify(payload);
  }, [localOrder, isCod]);

  useEffect(() => {
    if (localOrder) {
      const payload = buildQrPayload();
      QRCode.toDataURL(payload, {
        width: 300,
        margin: 1,
        color: { dark: '#1e293b', light: '#ffffff' },
      })
        .then(url => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [localOrder, isCod, buildQrPayload]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!localOrder) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await updateOrderStatus(localOrder._id, newStatus);
      setLocalOrder(prev => ({ ...prev, orderStatus: newStatus }));
      if (onStatusUpdate) onStatusUpdate(localOrder._id, newStatus);
      showToast(`Status changed to ${newStatus}`);
      setStatusDropdown(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePaymentToggle = async () => {
    const newStatus = localOrder.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await updatePaymentStatus(localOrder._id, newStatus);
      setLocalOrder(prev => ({ ...prev, paymentStatus: newStatus }));
      showToast(`Payment status changed to ${newStatus}`);
    } catch {
      showToast('Failed to update payment status');
    }
  };

  const handlePrintReceipt = () => {
    const payload = buildQrPayload();
    QRCode.toDataURL(payload, { width: 250, margin: 1, color: { dark: '#1e293b', light: '#ffffff' } })
      .then(qrForPrint => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        const itemsHtml = (localOrder.products || []).map((p, i) => `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;">${i + 1}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;">${p.name || p.title || 'Item'}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:center;">${p.quantity || 1}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:right;">₹${Number(p.price || 0).toFixed(2)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:11px;text-align:right;">₹${(Number(p.price || 0) * (p.quantity || 1)).toFixed(2)}</td>
          </tr>
        `).join('');

        printWindow.document.write(`
          <html>
          <head>
            <title>Shipment Receipt - ${localOrder.orderId}</title>
            <style>
              @page { margin: 10mm; size: A4 portrait; }
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Courier New', monospace; color: #1e293b; font-size: 12px; line-height: 1.5; padding: 10px; }
              .receipt { max-width: 800px; margin: 0 auto; border: 2px solid #1e293b; padding: 20px; }
              .header { text-align: center; border-bottom: 2px dashed #1e293b; padding-bottom: 12px; margin-bottom: 15px; }
              .header h1 { font-size: 20px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; }
              .header .sub { font-size: 10px; color: #64748b; margin-top: 4px; }
              .order-id { text-align: center; font-size: 28px; font-weight: 900; letter-spacing: 3px; margin: 8px 0; padding: 8px; border: 2px dashed #6366f1; background: #eef2ff; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
              .address-box { border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; }
              .address-box h3 { font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 5px; }
              .address-box p { font-size: 11px; margin: 2px 0; }
              .label { font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700; }
              table { width: 100%; border-collapse: collapse; margin: 12px 0; }
              th { background: #f1f5f9; padding: 7px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; text-align: left; border-bottom: 2px solid #1e293b; }
              td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
              .total-row { font-weight: 900; font-size: 14px; text-align: right; padding: 10px 0; border-top: 2px solid #1e293b; margin-top: 8px; }
              .qr-section { text-align: center; margin: 15px 0; padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px; }
              .qr-section img { width: 150px; height: 150px; }
              .qr-section p { font-size: 9px; color: #64748b; margin-top: 5px; }
              .cod-badge { display: inline-block; background: #1e293b; color: #fff; font-weight: 900; padding: 4px 12px; font-size: 12px; letter-spacing: 1px; margin: 8px 0; }
              .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
              .collect-amount { font-size: 24px; font-weight: 900; text-align: center; padding: 10px; background: #1e293b; color: #fff; margin: 10px 0; letter-spacing: 2px; }
              .return-policy { font-size: 9px; color: #64748b; margin-top: 10px; padding: 8px; border: 1px dashed #cbd5e1; text-align: center; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .receipt { border: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <h1>${SHOP_ADDRESS.shopName}</h1>
                <div class="sub">${SHOP_ADDRESS.address} | ${SHOP_ADDRESS.city}, ${SHOP_ADDRESS.state} - ${SHOP_ADDRESS.pincode}</div>
                <div class="sub">📞 ${SHOP_ADDRESS.phone} | ✉ ${SHOP_ADDRESS.email} | GST: ${SHOP_ADDRESS.gstin}</div>
              </div>

              <div class="order-id">${localOrder.orderId}</div>
              <div style="text-align:center;font-size:10px;color:#64748b;">Order Date: ${new Date(localOrder.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} | Status: ${localOrder.orderStatus}</div>

              <div class="grid-2">
                <div class="address-box">
                  <h3><span>📍</span> Ship To</h3>
                  <p><strong>${localOrder.shippingAddress?.fullName || localOrder.customer?.userId?.fullName || 'Customer'}</strong></p>
                  <p>${localOrder.shippingAddress?.phone || localOrder.customer?.userId?.phoneNumber || 'N/A'}</p>
                  <p>${[localOrder.shippingAddress?.address, localOrder.shippingAddress?.city, localOrder.shippingAddress?.state, localOrder.shippingAddress?.pincode].filter(Boolean).join(', ')}</p>
                </div>
                <div class="address-box">
                  <h3><span>↩</span> Return To</h3>
                  <p><strong>${SHOP_ADDRESS.shopName}</strong></p>
                  <p>${SHOP_ADDRESS.phone}</p>
                  <p>${SHOP_ADDRESS.address}, ${SHOP_ADDRESS.city}, ${SHOP_ADDRESS.state} - ${SHOP_ADDRESS.pincode}</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr><th>#</th><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Price</th><th style="text-align:right;">Total</th></tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;">
                <div>
                  ${localOrder.couponCode ? `<span style="font-size:10px;color:#16a34a;">Coupon: ${localOrder.couponCode} (-₹${Number(localOrder.couponDiscount || 0).toFixed(2)})</span>` : ''}
                </div>
                <div class="label">Payment: ${isCod ? 'Cash on Delivery' : 'Prepaid'}</div>
              </div>

              <div class="total-row">Total Amount: ₹${Number(localOrder.totalAmount || 0).toFixed(2)}</div>

              ${isCod ? `<div class="collect-amount">COD Amount to Collect: ₹${Number(localOrder.totalAmount || 0).toFixed(2)}</div>` : ''}

              <div class="qr-section">
                <h3 style="font-size:11px;font-weight:900;text-transform:uppercase;margin-bottom:6px;">📷 Scan to Track Order</h3>
                <img src="${qrForPrint}" alt="Order QR Code" />
                <p>Scan this QR code with your phone to view complete order details</p>
                <p style="font-size:9px;color:#94a3b8;margin-top:3px;">Order: ${localOrder.orderId} | ${isCod ? `COD: ₹${Number(localOrder.totalAmount || 0).toFixed(2)}` : 'Prepaid'}</p>
              </div>

              <div class="return-policy">
                <strong>Return Policy:</strong> If item needs to be returned, please ship to the <strong>Return To</strong> address above. 
                Items must be returned within 7 days of delivery in original condition with all accessories.
                For any queries, call ${SHOP_ADDRESS.phone}
              </div>

              <div class="footer">
                <p>This is a computer-generated receipt. No signature required.</p>
                <p>Generated on ${new Date().toLocaleString('en-IN')} | ${SHOP_ADDRESS.shopName}</p>
              </div>
            </div>
            <script>window.onload = function() { window.print(); };</script>
          </body>
          </html>
        `);
        printWindow.document.close();
        showToast('Print receipt opened');
      })
      .catch(() => showToast('Failed to generate QR for print'));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">

        {/* Sticky Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-mono">{localOrder.orderId}</h2>
              <p className="text-xs text-slate-400">
                {new Date(localOrder.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrintReceipt} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
              <Printer size={14} /> Print Shipment Receipt
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">

          {/* Shop Info + Order Status Bar */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={24} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold text-indigo-900 text-base">{SHOP_ADDRESS.shopName}</p>
                  <p className="text-xs text-indigo-600">{SHOP_ADDRESS.address}, {SHOP_ADDRESS.city}, {SHOP_ADDRESS.state} - {SHOP_ADDRESS.pincode}</p>
                  <p className="text-xs text-indigo-500">📞 {SHOP_ADDRESS.phone} | ✉ {SHOP_ADDRESS.email} | GST: {SHOP_ADDRESS.gstin}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${
                  localOrder.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                  localOrder.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                  localOrder.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {localOrder.orderStatus || 'Pending'}
                </span>
                <p className="text-xs text-indigo-500 mt-1">{isCod ? 'Cash on Delivery' : 'Prepaid'}</p>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left - Products + Addresses */}
            <div className="lg:col-span-3 space-y-6">

              {/* Products */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Package size={16} className="text-indigo-500" /> Order Items ({totalQty})
                  </h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {(localOrder.products || []).map((product, idx) => (
                    <div key={idx} className="p-4 flex gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                        {product.image ? (
                          <img src={product.image} alt={product.name || product.title} className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style=\'font-size:28px\'>📱</span>'; }} />
                        ) : (
                          <span className="text-3xl">📱</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900">{product.name || product.title || `Product ${idx + 1}`}</h4>
                        {product.productId && <p className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {product.productId}</p>}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {Object.entries(product.specifications).slice(0, 4).map(([key, val]) => (
                              <span key={key} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{key}: {val}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-semibold text-slate-900">₹{Number(product.price || 0).toFixed(2)}</span>
                            <span className="text-slate-400">x {product.quantity || 1}</span>
                          </div>
                          <span className="font-bold text-indigo-600">₹{(Number(product.price || 0) * (product.quantity || 1)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping + Return Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200">
                    <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                      <MapPin size={16} /> Shipping Address
                    </h3>
                  </div>
                  <div className="p-5 space-y-1.5">
                    <p className="font-bold text-slate-900">{localOrder.shippingAddress?.fullName || localOrder.customer?.userId?.fullName || 'Customer'}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      {localOrder.shippingAddress?.phone || localOrder.customer?.userId?.phoneNumber || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {localOrder.shippingAddress?.address && <>{localOrder.shippingAddress.address}<br /></>}
                      {[localOrder.shippingAddress?.city, localOrder.shippingAddress?.state, localOrder.shippingAddress?.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-red-50 border-b border-red-200">
                    <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
                      <RotateCcw size={16} /> Return Address
                    </h3>
                  </div>
                  <div className="p-5 space-y-1.5">
                    <p className="font-bold text-slate-900">{SHOP_ADDRESS.shopName}</p>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400" />
                      {SHOP_ADDRESS.phone}
                    </p>
                    <p className="text-sm text-slate-600">
                      {SHOP_ADDRESS.address}<br />
                      {SHOP_ADDRESS.city}, {SHOP_ADDRESS.state} - {SHOP_ADDRESS.pincode}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 italic">Return items to this address within 7 days</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User size={16} className="text-indigo-500" /> Customer
                  </h3>
                </div>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {localOrder.customer?.userId?.fullName?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{localOrder.customer?.userId?.fullName || 'Walk-in Customer'}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Mail size={12} /> {localOrder.customer?.userId?.email || 'N/A'}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {localOrder.customer?.userId?.phoneNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Status, Payment, QR */}
            <div className="lg:col-span-2 space-y-6">

              {/* Status Update */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" /> Order Status
                  </h3>
                </div>
                <div className="p-5">
                  <div className="relative">
                    <button
                      onClick={() => setStatusDropdown(!statusDropdown)}
                      disabled={statusUpdating}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        localOrder.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        localOrder.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        localOrder.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {statusUpdating ? <span className="animate-pulse">Updating...</span> : <>{localOrder.orderStatus || 'Pending'} <ChevronDown size={16} /></>}
                    </button>
                    {statusDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setStatusDropdown(false)} />
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 w-full">
                          {ORDER_STATUS_FLOW.map((status, idx) => {
                            const isCurrent = status === localOrder.orderStatus;
                            const isBefore = idx < currentIdx && status !== 'Cancelled';
                            return (
                              <button key={status}
                                onClick={() => !isCurrent && !isBefore && handleStatusChange(status)}
                                disabled={isCurrent || isBefore}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                                  isCurrent ? 'font-bold text-indigo-600 bg-indigo-50' :
                                  isBefore ? 'text-slate-300 cursor-not-allowed' :
                                  'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${status === 'Cancelled' ? 'bg-red-400' : status === 'Delivered' ? 'bg-green-400' : 'bg-blue-400'}`} />
                                {status}{isCurrent && ' (current)'}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="mt-4">
                    {ORDER_STATUS_FLOW.filter(s => s !== 'Cancelled').map((status, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      if (isCancelled && idx > currentIdx) return null;
                      return (
                        <div key={status} className="flex items-start gap-2.5">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
                              {isCompleted ? <CheckCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                            </div>
                            {idx < ORDER_STATUS_FLOW.length - 2 && <div className={`w-0.5 h-5 ${isCompleted && idx < currentIdx ? 'bg-indigo-400' : 'bg-slate-200'}`} />}
                          </div>
                          <span className={`text-xs py-0.5 ${isCurrent ? 'font-bold text-indigo-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                            {status}{isCurrent && !isCancelled && <span className="ml-1.5 text-[10px] text-indigo-500">(Current)</span>}
                          </span>
                        </div>
                      );
                    })}
                    {isCancelled && (
                      <div className="flex items-start gap-2.5 mt-1">
                        <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0"><X size={12} /></div>
                        <span className="text-xs font-bold text-red-600">Cancelled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <IndianRupee size={16} className="text-indigo-500" /> Payment
                  </h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{Number(localOrder.subtotal || localOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                  {localOrder.couponCode && (
                    <div className="flex justify-between text-sm text-slate-600">
                      <span className="flex items-center gap-1"><Tag size={12} className="text-green-500" /> {localOrder.couponCode}</span>
                      <span className="font-semibold text-green-600">-₹{Number(localOrder.couponDiscount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-indigo-600">₹{Number(localOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>

                  <button onClick={handlePaymentToggle}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      localOrder.paymentStatus === 'Paid'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span>Payment</span>
                    <span>{localOrder.paymentStatus || 'Pending'}</span>
                  </button>

                  {isCod && localOrder.orderStatus !== 'Delivered' && localOrder.orderStatus !== 'Cancelled' && (
                    <div className="bg-slate-900 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">COD Collection</p>
                      <p className="text-2xl font-black text-white mt-1">₹{Number(localOrder.totalAmount || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Collect at delivery</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <QrCode size={16} className="text-indigo-500" /> Unique Order QR
                  </h3>
                </div>
                <div className="p-5 flex flex-col items-center">
                  {qrDataUrl ? (
                    <>
                      <img src={qrDataUrl} alt="Order QR Code" className="w-40 h-40 rounded-xl border border-slate-200 p-1" />
                      <p className="text-[10px] text-slate-400 mt-2 text-center leading-relaxed">
                        Scan for full order details<br />
                        <span className="font-mono font-bold text-slate-600">{localOrder.orderId}</span>
                        {isCod && <><br /><span className="text-amber-600 font-bold">COD: ₹{Number(localOrder.totalAmount || 0).toFixed(2)}</span></>}
                      </p>
                      <button onClick={() => {
                        const a = document.createElement('a');
                        a.href = qrDataUrl;
                        a.download = `order-${localOrder.orderId}-qr.png`;
                        a.click();
                        showToast('QR code downloaded');
                      }} className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        <Download size={12} /> Download QR
                      </button>
                    </>
                  ) : (
                    <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center">
                      <QrCode size={40} className="text-slate-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Order Meta */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Hash size={16} className="text-indigo-500" /> Order Info
                  </h3>
                </div>
                <div className="p-5 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Payment Method</span>
                    <span className="font-semibold text-slate-900 capitalize">{localOrder.paymentInfo?.method || 'COD'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Items</span>
                    <span className="font-semibold text-slate-900">{localOrder.products?.length || 0} ({totalQty} qty)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Order Date</span>
                    <span className="font-semibold text-slate-900">{new Date(localOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Last Updated</span>
                    <span className="font-semibold text-slate-900">{localOrder.updatedAt ? new Date(localOrder.updatedAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between rounded-b-3xl">
          <p className="text-xs text-slate-400">
            <span className="font-mono font-bold text-slate-600">{localOrder.orderId}</span> • {localOrder.customer?.userId?.fullName || 'Customer'} • {isCod ? 'COD' : 'Prepaid'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handlePrintReceipt} className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
              <Printer size={14} /> Print Shipment Receipt
            </button>
            <button onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminOrderDetailModal;
