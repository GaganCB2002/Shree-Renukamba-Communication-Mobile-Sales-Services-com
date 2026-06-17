import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Package, CheckCircle, AlertCircle, MapPin, ArrowLeft, Calendar, Wrench, Image as ImageIcon, Smartphone, DollarSign, Download, Tag, IndianRupee, Truck, ShieldCheck, Sparkles, Gift, BadgeCheck } from 'lucide-react';
import { trackOrder } from '../../api/ordersApi';
import { getInvoiceByOrder } from '../../api/invoicesApi';

const ORDER_STATUS_FLOW = [
  'Pending',
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

const getStatusStyle = (status) => {
  const map = {
    'Delivered': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Repair Completed': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'Shipped': 'bg-blue-100 text-blue-700 border-blue-300',
    'Out for Delivery': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Processing': 'bg-blue-100 text-blue-700 border-blue-300',
    'Pending': 'bg-amber-100 text-amber-700 border-amber-300',
    'Under Review': 'bg-sky-100 text-sky-700 border-sky-300',
    'Awaiting Approval': 'bg-amber-100 text-amber-700 border-amber-300',
    'Approved': 'bg-indigo-100 text-indigo-700 border-indigo-300',
    'Repair Started': 'bg-purple-100 text-purple-700 border-purple-300',
    'Parts Ordered': 'bg-orange-100 text-orange-700 border-orange-300',
    'Ready For Pickup': 'bg-green-100 text-green-700 border-green-300',
    'Cancelled': 'bg-red-100 text-red-700 border-red-300',
  };
  return map[status] || 'bg-slate-100 text-slate-700 border-slate-300';
};

const OrderTimeline = ({ currentStatus, isRepair }) => {
  const flow = isRepair
    ? ['Received', 'Under Review', 'Diagnosis Complete', 'Awaiting Approval', 'Approved', 'Repair Started', 'Parts Ordered', 'Repair Completed', 'Ready For Pickup', 'Delivered']
    : ORDER_STATUS_FLOW;

  const currentIdx = flow.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  if (isCancelled) {
    return (
      <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle size={20} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-800">Order Cancelled</p>
          <p className="text-xs text-red-600">This order has been cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-indigo-300 via-purple-300 to-slate-200 rounded-full" />
      <div className="space-y-0">
        {flow.map((status, idx) => {
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const animDelay = `${idx * 0.1}s`;
          return (
            <div key={status}
              className="relative flex items-start gap-4 pb-6 last:pb-0 animate-slide-up group"
              style={{ animationDelay: animDelay }}>
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border-2 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 shadow-lg shadow-indigo-500/30 scale-110'
                    : isCurrent
                      ? 'bg-white border-indigo-400 shadow-lg shadow-indigo-200 animate-ping-slow'
                      : 'bg-slate-100 border-slate-300'
                }`}>
                  {isCompleted ? (
                    <BadgeCheck size={18} className="text-white animate-scale-in" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  )}
                </div>
              </div>
              <div className={`flex-1 pt-2 ${isCurrent ? 'translate-x-1' : ''} transition-all duration-300`}>
                <p className={`text-sm font-bold tracking-wide ${
                  isCurrent
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-lg'
                    : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                }`}>
                  {status}
                </p>
                {isCurrent && (
                  <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 animate-fade-in">
                    <Sparkles size={10} />
                    Current Stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 group cursor-default hover:shadow-md hover:shadow-indigo-100 transition-all duration-300">
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon size={13} className="text-indigo-600" />
      </div>
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-800 pl-9">{value}</p>
  </div>
);

const SectionCard = ({ children, delay = 0, className = '' }) => (
  <div className={`animate-slide-up opacity-0 ${className}`} style={{ animationDelay: `${delay}s`, animationFillMode: 'forwards' }}>
    <div className="bg-white rounded-2xl border border-indigo-100/80 overflow-hidden shadow-sm hover:shadow-md hover:shadow-indigo-100/50 transition-shadow duration-500">
      {children}
    </div>
  </div>
);

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [imageLoaded, setImageLoaded] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await trackOrder(orderId);
        setOrder(data);
        if (!data.isRepair) {
          try {
            const inv = await getInvoiceByOrder(orderId);
            setInvoice(inv);
          } catch {}
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-200 animate-pulse-slow">
            <Package size={30} className="text-white" />
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-slate-500 mt-4 font-medium tracking-wide">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 border border-red-200 text-center max-w-md w-full shadow-lg animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center border border-red-200">
            <AlertCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
          <p className="text-sm text-slate-500 mb-8">{error}</p>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-200 transition-all duration-300 hover:scale-105">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[150px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <button type="button" onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-8 transition-all duration-300 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-white border border-indigo-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all duration-300">
            <ArrowLeft size={14} className="text-slate-500 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition-all" />
          </div>
          <span className="font-medium">Back</span>
        </button>

        <SectionCard delay={0.1}>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 via-purple-100/30 to-transparent" />
            <div className="relative p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 animate-float-subtle">
                    {order.isRepair ? <Wrench size={24} className="text-white" /> : <Package size={24} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">
                      {order.isRepair ? 'Repair Ticket' : 'Order'}
                    </span>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 mt-0.5 font-mono tracking-wide">{order.orderId}</h1>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-4 py-2 rounded-full border inline-flex items-center gap-1.5 shadow-sm ${getStatusStyle(order.orderStatus)}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="flex gap-2 mt-6 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          {[
            { id: 'details', label: 'Details', icon: Package },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'invoice', label: 'Invoice', icon: Download },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-200 scale-105'
                  : 'bg-white text-slate-500 border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
              }`}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="space-y-5 mt-6">
            <SectionCard delay={0.3}>
              <div className="p-6">
                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                  <Sparkles size={12} />
                  Order Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoTile icon={Clock} label="Ordered On" value={new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />
                  {!order.isRepair && <InfoTile icon={Package} label="Items" value={`${order.products?.length || 0} item(s)`} />}
                  {order.isRepair && order.expectedDeliveryDate && <InfoTile icon={Calendar} label="Est. Delivery" value={new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />}
                  <InfoTile icon={IndianRupee} label="Total Amount" value={`₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`} />
                  <InfoTile icon={ShieldCheck} label="Payment" value={order.paymentStatus || 'Pending'} />
                  {order.isRepair && <InfoTile icon={Calendar} label="Requested On" value={new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} />}
                </div>
              </div>
            </SectionCard>

            {!order.isRepair && Array.isArray(order.products) && order.products.length > 0 && (
              <SectionCard delay={0.4}>
                <div className="p-6">
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                    <Gift size={12} />
                    Purchased Items
                  </h3>
                  <div className="space-y-3">
                    {order.products.map((p, i) => (
                      <div key={i}
                        className="group flex items-center justify-between p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 hover:bg-indigo-100/50 hover:border-indigo-200 transition-all duration-300 cursor-default"
                        style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-indigo-100 bg-white shrink-0 relative group-hover:scale-105 transition-transform duration-300 shadow-sm">
                            {p.image ? (
                              <img src={p.image} alt={p.name || p.title || 'Product'}
                                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded[`p-${i}`] ? 'opacity-100' : 'opacity-0'}`}
                                onLoad={() => setImageLoaded(prev => ({ ...prev, [`p-${i}`]: true }))}
                                onError={e => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-slate-400" />
                              </div>
                            )}
                            {!imageLoaded[`p-${i}`] && p.image && (
                              <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-xl" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{p.name || p.title || `Product ${i + 1}`}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Qty: {p.quantity || 1}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">₹{Number(p.price || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {order.isRepair && (
              <>
                {order.deviceImages?.length > 0 && (
                  <SectionCard delay={0.35}>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Smartphone size={12} /> Device Images
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {order.deviceImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Device ${idx + 1}`}
                            className="w-24 h-24 rounded-xl object-cover border border-indigo-100 shrink-0 hover:scale-105 transition-transform duration-300 shadow-sm"
                            onError={e => { e.target.style.display = 'none'; }} />
                        ))}
                      </div>
                    </div>
                  </SectionCard>
                )}

                {order.issueDescription && (
                  <SectionCard delay={0.4}>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Wrench size={12} /> Issue Reported
                      </h3>
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-sm text-amber-800">{order.issueDescription}</p>
                      </div>
                    </div>
                  </SectionCard>
                )}

                {order.diagnosisDetails && (
                  <SectionCard delay={0.45}>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Wrench size={12} /> Diagnosis
                      </h3>
                      <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                        <p className="text-sm text-sky-800">{order.diagnosisDetails}</p>
                      </div>
                    </div>
                  </SectionCard>
                )}

                {(order.estimatedCost || order.finalCost) && (
                  <SectionCard delay={0.5}>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <DollarSign size={12} /> Cost Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.estimatedCost && (
                          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                            <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Estimated</span>
                            <p className="text-lg font-bold text-indigo-800 mt-1">₹{Number(order.estimatedCost).toLocaleString('en-IN')}</p>
                          </div>
                        )}
                        {order.finalCost && (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Final</span>
                            <p className="text-lg font-bold text-emerald-700 mt-1">₹{Number(order.finalCost).toLocaleString('en-IN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </SectionCard>
                )}

                {order.repairImages?.length > 0 && (
                  <SectionCard delay={0.55}>
                    <div className="p-6">
                      <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ImageIcon size={12} /> Repair Photos
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {order.repairImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Repair ${idx + 1}`}
                            className="w-32 h-32 rounded-xl object-cover border border-indigo-100 shrink-0 hover:scale-105 transition-transform duration-300 shadow-sm"
                            onError={e => { e.target.style.display = 'none'; }} />
                        ))}
                      </div>
                    </div>
                  </SectionCard>
                )}

                <SectionCard delay={0.6}>
                  <div className="p-6">
                    <Link to="/dashboard/live-tracking"
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      <Truck size={18} className="group-hover:translate-x-1 transition-transform" />
                      View Live Tracking
                      <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </SectionCard>
              </>
            )}

            {order.couponCode && (
              <SectionCard delay={0.45}>
                <div className="p-6">
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Tag size={12} /> Coupon Applied
                  </h3>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500">Code</span>
                      <span className="text-sm font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">{order.couponCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Discount</span>
                      <span className="text-sm font-bold text-emerald-600">-₹{Number(order.couponDiscount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {order.shippingAddress && (
              <SectionCard delay={0.5}>
                <div className="p-6">
                  <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MapPin size={12} /> Shipping Address
                  </h3>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {order.shippingAddress.fullName && <><strong className="text-indigo-800">{order.shippingAddress.fullName}</strong><br /></>}
                      {order.shippingAddress.phone && <span className="text-slate-500">{order.shippingAddress.phone}</span>}<br />
                      {order.shippingAddress.address && <>{order.shippingAddress.address}, </>}
                      {order.shippingAddress.city && <>{order.shippingAddress.city}, </>}
                      {order.shippingAddress.state && <>{order.shippingAddress.state} - </>}
                      <span className="font-mono text-indigo-600 font-semibold">{order.shippingAddress.pincode}</span>
                    </p>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard delay={0.55}>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Subtotal</span>
                    <span className="text-sm font-bold text-slate-700">₹{Number(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {order.couponCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Discount</span>
                      <span className="text-sm font-bold text-emerald-600">-₹{Number(order.couponDiscount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-slate-800">Total</span>
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                      ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === 'timeline' && (
          <SectionCard delay={0.3}>
            <div className="p-6">
              <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Clock size={12} /> {order.isRepair ? 'Repair Progress' : 'Order Progress'}
              </h3>
              <OrderTimeline currentStatus={order.orderStatus} isRepair={order.isRepair} />
            </div>
          </SectionCard>
        )}

        {activeTab === 'invoice' && (
          <SectionCard delay={0.3}>
            <div className="p-6 text-center">
              {invoice ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-green-50 border border-emerald-200 flex items-center justify-center">
                    <Download size={36} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Invoice Available</h3>
                    <p className="text-sm text-slate-500">Download your invoice for this order</p>
                  </div>
                  <a href={`/api/invoices/${invoice._id}/pdf`} target="_blank" rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all duration-300 hover:scale-105">
                    <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                    Download Invoice
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50 border border-amber-200 flex items-center justify-center">
                    <Clock size={36} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No Invoice Yet</h3>
                    <p className="text-sm text-slate-500">The invoice will be available once your order is processed</p>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-subtle { animation: float-subtle 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out both; }
        .animate-slide-up { animation: slide-up 0.5s ease-out both; }
        .animate-scale-in { animation: scale-in 0.4s ease-out both; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default OrderDetail;