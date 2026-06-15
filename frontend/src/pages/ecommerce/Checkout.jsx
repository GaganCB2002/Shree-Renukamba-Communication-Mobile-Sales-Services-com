import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, CreditCard, Banknote, QrCode, ArrowLeft, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { clearCart } from '../../redux/slices/cartSlice';
import { getProducts } from '../../api/productsApi';
import { createOrder } from '../../api/ordersApi';
import { useToast } from '../../contexts/ToastContext';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [liveProducts, setLiveProducts] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: userInfo?.fullName || '',
    phone: userInfo?.phoneNumber || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    fetchLivePrices();
  }, []);

  const fetchLivePrices = async () => {
    try {
      const data = await getProducts();
      setLiveProducts(Array.isArray(data) ? data : []);
    } catch {
      // use stale prices
    }
  };

  const liveProductMap = useMemo(() => {
    const map = {};
    liveProducts.forEach(p => { map[p._id || p.id] = p; });
    return map;
  }, [liveProducts]);

  const cartWithLivePrices = useMemo(() => {
    return cartItems.map(item => {
      const id = item._id || item.id;
      const live = liveProductMap[id];
      return live || item;
    });
  }, [cartItems, liveProductMap]);

  const subtotal = cartWithLivePrices.reduce((acc, item) => {
    const price = item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price;
    return acc + price * item.quantity;
  }, 0);

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
      const products = cartWithLivePrices.map((item) => ({
        product: item._id || item.id,
        name: item.title || item.name,
        image: item.images?.[0] || '',
        quantity: item.quantity,
        price: item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price,
      }));

      const order = await createOrder({
        products,
        totalAmount: subtotal,
        shippingAddress,
        paymentMethod,
      });

      setOrderId(order.orderId);
      setOrderPlaced(true);
      dispatch(clearCart());
      showToast('Order placed successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
            <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold text-primary-950 mb-2">Order Placed!</h1>
            <p className="text-secondary-600 mb-4">Your order has been placed successfully.</p>
            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-secondary-500 mb-1">Order ID</p>
              <p className="text-xl font-bold text-primary-700 font-mono tracking-wider">{orderId}</p>
            </div>
            {paymentMethod === 'cod' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                Our team will contact you. You have to pay 50% of the product cost at the time of delivery.
              </div>
            )}
            {paymentMethod === 'upi' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
                Complete your payment via UPI. Use Order ID as reference.
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link to="/shop" className="btn-primary text-sm">Continue Shopping</Link>
              <Link to="/dashboard/live-tracking" className="text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-200 rounded-xl px-4 py-2.5">
                Track Order
              </Link>
            </div>
          </div>
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
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
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
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-secondary-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-primary-950">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary-600">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary-950 border-t border-border pt-4 mt-4">
                <span>Total</span>
                <span>₹{subtotal.toFixed(2)}</span>
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
                  `Place Order - ₹${subtotal.toFixed(2)}`
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
