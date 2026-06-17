import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../contexts/ToastContext';
import CategoryBadge from '../../components/CategoryBadge';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);

  const handleRemove = (product) => {
    dispatch(toggleWishlist(product));
    showToast('Removed from wishlist');
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    showToast('Item added to cart successfully!');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart size={64} className="text-secondary-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary-950 mb-2">Your Wishlist is Empty</h1>
          <p className="text-secondary-600 mb-8">Save items you love by tapping the heart icon on any product.</p>
          <Link to="/shop" className="btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-600 mb-2 transition-colors">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
            <h1 className="text-3xl font-bold text-primary-950">Your Wishlist ({wishlistItems.length})</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => {
            const discountedPrice = product.discount > 0
              ? (product.price * (1 - product.discount / 100)).toFixed(2)
              : product.price;
            const imgSrc = product.images && product.images[0]
              ? product.images[0]
              : 'https://images.unsplash.com/photo-1550009158-9efff6c0e561?auto=format&fit=crop&q=80&w=600';

            return (
              <div key={product._id || product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border group hover:shadow-soft transition-all">
                <Link to={`/products/${product._id || product.id}`}>
                  <div className="h-48 bg-secondary-100 overflow-hidden relative">
                    <img src={imgSrc} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class=\"text-5xl\">📱</span>'; }} />
                    {product.discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/products/${product._id || product.id}`}>
                    <h3 className="font-bold text-primary-950 text-sm mb-1 group-hover:text-primary-600 transition-colors">{product.title}</h3>
                  </Link>
                  <p className="text-xs text-secondary-500 font-mono mb-3">SKU: {product.productId}</p>
                  <div style={{ marginBottom: '8px' }}><CategoryBadge category={product.category} /></div>
                  <div className="flex items-center gap-2 mb-4">
                    {product.discount > 0 && <span className="text-xs text-secondary-400 line-through">₹{product.price}</span>}
                    <span className="text-lg font-bold text-primary-950">₹{discountedPrice}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                    <button onClick={() => handleRemove(product)}
                      className="p-2.5 bg-secondary-100 hover:bg-red-50 text-secondary-500 hover:text-red-500 rounded-xl transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
