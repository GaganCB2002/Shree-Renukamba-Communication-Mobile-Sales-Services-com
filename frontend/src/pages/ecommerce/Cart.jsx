import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart } from '../../redux/slices/cartSlice';
import { getProducts } from '../../api/productsApi';
import EmptyState from '../../components/EmptyState';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const [liveProducts, setLiveProducts] = useState([]);

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
      if (live) {
        return { ...live, quantity: item.quantity };
      }
      return item;
    });
  }, [cartItems, liveProductMap]);

  const subtotal = useMemo(() => {
    return cartWithLivePrices.reduce((acc, item) => {
      const rawPrice = Number(item?.price) || 0;
      const rawDiscount = Number(item?.discount) || 0;
      const price = rawDiscount > 0 ? (rawPrice * (1 - rawDiscount / 100)) : rawPrice;
      const qty = Number(item?.quantity) || 1;
      return acc + price * qty;
    }, 0);
  }, [cartWithLivePrices]);

  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      dispatch(removeFromCart(item._id || item.id));
    } else {
      dispatch(updateQuantity({ id: item._id || item.id, quantity: newQty }));
    }
  };

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          description="Browse our refurbished devices and accessories."
          action={
            <Link to="/shop" className="btn-primary flex items-center gap-2">
              <ShoppingBag size={18} /> Browse Products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-primary-950">Shopping Cart</h1>
        <div className="flex gap-2">
          <button onClick={fetchLivePrices} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1" title="Refresh prices">
            <RefreshCw size={14} /> Refresh Prices
          </button>
          <button onClick={() => dispatch(clearCart())} className="text-sm text-red-500 hover:text-red-700 font-medium">
            Clear Cart
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow space-y-4">
          {cartWithLivePrices.map((item) => {
            const price = item.discount > 0 ? (item.price * (1 - item.discount / 100)) : item.price;
            return (
              <div key={item._id || item.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-border">
                <div className="w-20 h-20 bg-secondary-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    '📱'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item._id}`} className="font-bold text-primary-950 hover:text-primary-600 transition-colors truncate block">
                    {item.title || item.name}
                  </Link>
                  <p className="text-sm text-secondary-500">₹{price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button onClick={() => handleQuantity(item, -1)} className="px-3 py-1.5 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-bold text-sm transition-colors">-</button>
                    <span className="px-4 py-1.5 text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => handleQuantity(item, 1)} className="px-3 py-1.5 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 font-bold text-sm transition-colors">+</button>
                  </div>
                  <div className="text-right min-w-[5rem]">
                    <div className="font-bold text-primary-950">₹{(price * item.quantity).toFixed(2)}</div>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item._id || item.id))} className="p-2 text-secondary-400 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full lg:w-96">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-28">
            <h2 className="text-xl font-bold text-primary-950 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 border-b border-border pb-4 text-sm">
              <div className="flex justify-between text-secondary-600">
                <span>Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
                <span className="font-medium text-primary-950">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>Tax</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary-950 mb-6">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-sm">
              Proceed to Checkout
            </button>
            <p className="text-xs text-center text-secondary-500 mt-4">Pay via UPI, QR, or Cash on Delivery</p>
            <Link to="/shop" className="flex items-center justify-center gap-2 mt-4 text-sm text-secondary-600 hover:text-primary-600 font-medium transition-colors">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
