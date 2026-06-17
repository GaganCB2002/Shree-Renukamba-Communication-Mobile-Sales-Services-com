import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, Banknote, QrCode, ArrowLeft, Loader2, RefreshCw, CheckCircle2, Tag, Check, Clock } from 'lucide-react';
import { clearCart } from '../../redux/slices/cartSlice';
import { getProducts } from '../../api/productsApi';
import { createOrder } from '../../api/ordersApi';
import { useToast } from '../../contexts/ToastContext';
import { getCoupons, validateCoupon } from '../../api/couponsApi';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const { userInfo } = useSelector((state) => state.auth);
  const [liveProducts, setLiveProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setPlacing] = useState(false);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(600);
  const [paymentDone, setPaymentDone] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: userInfo?.fullName || '',
    phone: userInfo?.phoneNumber || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);

  useEffect(() => {
    fetchLivePrices();
    fetchAvailableCoupons();
  }, []);

  async function fetchAvailableCoupons() {
    try {
      const data = await getCoupons();
      setAvailableCoupons(Array.isArray(data) ? data : []);
    } catch {
      // no coupons available
    }
  };

  useEffect(() => {
    let timer;
    if (showPaymentScreen && countdown > 0 && !paymentDone) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPaymentDone(true);
            setTimeout(() => {
              setShowPaymentScreen(false);
              setSuccessMessage('Payment received successfully!');
              setShowSuccess(true);
              setTimeout(() => {
                navigate('/dashboard/orders', { state: { orderSuccess: true, message: 'Payment received successfully!' } });
              }, 3000);
            }, 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPaymentScreen, paymentDone, navigate, countdown]);

  async function fetchLivePrices() {
    try {
      const data = await getProducts();
      setLiveProducts(Array.isArray(data) ? data : []);
    } catch {
      // use stale prices
    }
  }

  const liveProductMap = useMemo(() => {
    const map = {};
    liveProducts.forEach(p => { map[p._id || p.id] = p; });
    return map;
  }, [liveProducts]);

  const cartWithLivePrices = useMemo(() => {
    return cartItems.map(item => {
      const id = item._id || item.id;
      const live = liveProductMap[id];
      if (live) {
        return { ...live, quantity: item.quantity };
      }
      return item;
    });
  }, [cartItems, liveProductMap]);

  // Defensive calculations to prevent NaN
  const subtotal = useMemo(() => {
    return cartWithLivePrices.reduce((acc, item) => {
      const rawPrice = Number(item?.price) || 0;
      const rawDiscount = Number(item?.discount) || 0;
      const price = rawDiscount > 0 ? (rawPrice * (1 - rawDiscount / 100)) : rawPrice;
      const qty = Number(item?.quantity) || 1;
      return acc + price * qty;
    }, 0);
  }, [cartWithLivePrices]);

  const finalTotal = useMemo(() => {
    if (appliedCoupon && appliedCoupon.valid) {
      return Number(appliedCoupon.finalTotal) || 0;
    }
    return subtotal;
  }, [appliedCoupon, subtotal]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const data = await validateCoupon(couponCode, subtotal);
      if (data.valid) {
        setAppliedCoupon(data);
        showToast('Coupon applied successfully!');
      } else {
        setCouponError(data.message || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const showPaymentTimer = () => {
    setShowPaymentScreen(true);
    setPaymentDone(false);
    setCountdown(600);
  };

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      showToast('Please select a payment method');
      return;
    }
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      showToast('Please fill in shipping address');
      return;
    }
    if (cartWithLivePrices.length === 0) {
      showToast('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      setPlacing(true);

      const products = cartWithLivePrices.map((item) => {
        const rawPrice = Number(item?.price) || 0;
        const rawDiscount = Number(item?.discount) || 0;
        const finalPrice = rawDiscount > 0 ? (rawPrice * (1 - rawDiscount / 100)) : rawPrice;
        return {
          product: item._id || item.id,
          name: item.title || item.name,
          image: item.images?.[0] || '',
          quantity: Number(item.quantity) || 1,
          price: finalPrice,
        };
      });

      const order = await createOrder({
        products,
        totalAmount: finalTotal,
        subtotal,
        shippingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.coupon?.code || '',
        couponDiscount: appliedCoupon?.discountAmount || 0,
      });

      if (!order || !order.orderId) {
        throw new Error('Invalid response from server - no order ID received');
      }

      const orderId = order.orderId;
      dispatch(clearCart());
      setPlacing(false);
      setLoading(false);

      const redirectToOrders = () => {
        navigate('/dashboard/orders', { state: { orderSuccess: true, orderId, message: paymentMethod === 'cod' ? 'Your order was placed successfully!' : 'Payment received successfully!' } });
      };

      if (paymentMethod === 'cod') {
        setSuccessMessage('Your order was placed successfully!');
        setShowSuccess(true);
        setTimeout(() => redirectToOrders(), 3000);
      } else {
        showPaymentTimer();
      }
    } catch (err) {
      setPlacing(false);
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Failed to place order';
      showToast(errMsg);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600">
        <div className="text-center animate-bounce-in">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center animate-scale-check shadow-lg backdrop-blur-sm">
            <Check size={64} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">{successMessage}</h2>
          <p className="text-emerald-100 font-medium">Redirecting to your orders...</p>
        </div>
        <style>{`
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.1); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes scale-check {
            0% { transform: scale(0) rotate(-45deg); opacity: 0; }
            60% { transform: scale(1.2) rotate(5deg); opacity: 1; }
            100% { transform: scale(1) rotate(0deg); opacity: 1; }
          }
          .animate-bounce-in { animation: bounce-in 0.8s ease-out forwards; }
          .animate-scale-check { animation: scale-check 0.6s ease-out 0.3s both; }
        `}</style>
      </div>
    );
  }

  if (showPaymentScreen) {
    const isUpi = paymentMethod === 'upi';
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          {paymentDone ? (
            <div className="py-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={44} className="text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
              <p className="text-secondary-500">Processing your order...</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                {isUpi ? <CreditCard size={40} className="text-indigo-600" /> : <QrCode size={40} className="text-indigo-600" />}
              </div>
              <h3 className="text-xl font-bold text-primary-950 mb-2">
                {isUpi ? 'Complete your UPI Payment' : 'Scan QR to Pay'}
              </h3>
              <p className="text-secondary-500 text-sm mb-6">
                {isUpi ? 'Send payment to UPI ID: renukamba@upi' : 'Scan the QR code with any UPI app'}
              </p>

              {!isUpi && (
                <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-2xl border-2 border-dashed border-secondary-300 flex items-center justify-center">
                  <QrCode size={120} className="text-primary-600" />
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock size={20} className="text-indigo-500" />
                <span className={`text-3xl font-mono font-bold ${countdown <= 60 ? 'text-red-600 animate-pulse' : 'text-indigo-600'}`}>
                  {formatTime(countdown)}
                </span>
              </div>

              <div className="w-full bg-secondary-200 rounded-full h-2 mb-6">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((600 - countdown) / 600) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-secondary-500 mb-4">
                <Loader2 size={16} className="animate-spin" />
                <span>Waiting for payment confirmation...</span>
              </div>

              <p className="text-xs text-secondary-400">Do not close this page while processing payment</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (cartWithLivePrices.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border text-center max-w-lg mx-auto">
          <ShoppingBag size={48} className="mx-auto text-secondary-300 mb-4" />
          <h2 className="text-xl font-bold text-primary-950 mb-2">Your cart is empty</h2>
          <p className="text-secondary-600 mb-6">Add some products before checking out.</p>
          <Link to="/shop" className="btn-primary text-sm">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-secondary-600 hover:text-primary-600 font-medium mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold text-primary-950 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
              <h2 className="text-lg font-bold text-primary-950 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="col-span-full px-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  maxLength={10}
                  value={shippingAddress.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setShippingAddress({ ...shippingAddress, phone: digits });
                  }}
                  className="col-span-full px-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
                <textarea
                  placeholder="Address"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                  className="col-span-full px-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="px-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="px-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  className="px-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
              <h2 className="text-lg font-bold text-primary-950 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-200'}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-500'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-primary-950">UPI</p>
                    <p className="text-xs text-secondary-500">Pay via UPI ID: renukamba@upi</p>
                  </div>
                  {paymentMethod === 'upi' && <CheckCircle2 size={20} className="text-primary-600" />}
                </label>

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-200'}`}
                  onClick={() => setPaymentMethod('qr')}
                >
                  <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'qr' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-500'}`}>
                    <QrCode size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-primary-950">Scan QR</p>
                    <p className="text-xs text-secondary-500">Scan the QR code to pay via any UPI app</p>
                  </div>
                  {paymentMethod === 'qr' && <CheckCircle2 size={20} className="text-primary-600" />}
                </label>

                {paymentMethod === 'qr' && (
                  <div className="p-4 bg-secondary-50 rounded-xl text-center">
                    <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-dashed border-secondary-300 flex items-center justify-center mb-2">
                      <QrCode size={96} className="text-primary-600" />
                    </div>
                    <p className="text-xs text-secondary-500">Scan with any UPI app (GPay, PhonePe, Paytm)</p>
                  </div>
                )}

                <label
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-border hover:border-primary-200'}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="hidden" />
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-500'}`}>
                    <Banknote size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-primary-950">Cash on Delivery</p>
                    <p className="text-xs text-secondary-500">Pay when you receive the product</p>
                  </div>
                  {paymentMethod === 'cod' && <CheckCircle2 size={20} className="text-primary-600" />}
                </label>

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    Our team will contact you. You have to pay 50% of the product cost.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-28">
              <h2 className="text-lg font-bold text-primary-950 mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                <div className="flex items-center justify-end mb-2">
                  <button onClick={fetchLivePrices} className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>
                {cartWithLivePrices.map((item) => {
                  const price = item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price;
                  return (
                    <div key={item._id || item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '📱'; }} />
                        ) : '📱'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary-950 truncate">{item.title || item.name}</p>
                        <p className="text-xs text-secondary-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-primary-950">₹{(price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
              {/* Coupon Code Section */}
              <div className="border-t border-border pt-4 pb-2">
                <label className="text-xs font-bold text-secondary-500 uppercase tracking-wider block mb-2">Apply Coupon</label>
                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-800 font-mono tracking-wider">{appliedCoupon.coupon.code}</p>
                        <p className="text-[10px] text-green-600">
                          {appliedCoupon.coupon.discountType === 'percentage'
                            ? `${appliedCoupon.coupon.discountValue}% Off applied`
                            : `₹${appliedCoupon.coupon.discountValue} Flat Discount applied`}
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors">
                      Remove
                    </button>
                  </div>
                  ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400 font-mono tracking-wider"
                      />
                      <button
                        id="apply-coupon-btn"
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2 bg-secondary-900 hover:bg-secondary-800 disabled:bg-secondary-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                    {availableCoupons.length > 0 && !appliedCoupon && (
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider mb-1.5">Available Coupons</p>
                        <div className="flex flex-wrap gap-1.5">
                          {availableCoupons.map((c) => (
                            <button
                              key={c._id}
                              type="button"
                              onClick={() => {
                                setCouponCode(c.code);
                                setTimeout(() => document.getElementById('apply-coupon-btn')?.click(), 50);
                              }}
                              className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-dashed border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                            >
                              {c.code} {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-primary-950">₹{subtotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <>
                    <div className="flex justify-between text-secondary-600">
                      <span>Coupon Discount ({appliedCoupon.coupon.code})</span>
                      <span className="font-medium text-red-600">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                    
                    {/* Deep Explanation Breakdown for Coupon Application */}
                    <div className="text-[11px] text-secondary-600 bg-secondary-50 border border-secondary-200 p-3 rounded-xl leading-relaxed space-y-1">
                      <p className="font-bold text-primary-900 mb-1">Coupon breakdown detail:</p>
                      <div className="flex justify-between">
                        <span>Original Price:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount Type:</span>
                        <span>{appliedCoupon.coupon.discountType === 'percentage' ? 'Percentage Based' : 'Flat Discount'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deduction Rate:</span>
                        <span>{appliedCoupon.coupon.discountType === 'percentage' ? `${appliedCoupon.coupon.discountValue}%` : `₹${appliedCoupon.coupon.discountValue}`}</span>
                      </div>
                      {appliedCoupon.coupon.maxDiscount > 0 && (
                        <div className="flex justify-between">
                          <span>Max Discount Cap:</span>
                          <span>₹{appliedCoupon.coupon.maxDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-secondary-200 pt-1 mt-1 font-semibold text-primary-950">
                        <span>Net Savings:</span>
                        <span>₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
              
              <div className="flex justify-between text-lg font-bold text-primary-950 border-t border-border pt-4 mt-4">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(2)}</span>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !paymentMethod}
                className="w-full mt-6 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Placing Order...
                  </>
                ) : (
                  `Place Order - ₹${finalTotal.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
