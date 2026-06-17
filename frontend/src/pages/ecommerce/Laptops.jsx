import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Search, ChevronDown, Laptop, Eye, CheckCircle, Package, Heart } from 'lucide-react';
import { getProducts } from '../../api/productsApi';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import CategoryBadge from '../../components/CategoryBadge';

const laptopImages = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&q=80&w=600',
];

const Laptops = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  const conditions = ['Excellent', 'Like New', 'Good'];
  const priceRanges = [
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,000 - ₹2,000', value: '1000-2000' },
    { label: '₹2,000 - ₹3,000', value: '2000-3000' },
    { label: 'Above ₹3,000', value: '3000+' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ categoryName: 'Laptops' });
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    showToast('Item added to cart successfully!');
  };

  const isLiked = (product) => wishlistItems.some((x) => x._id === product._id || x.id === product.id);

  const handleLike = (product) => {
    dispatch(toggleWishlist(product));
    showToast(isLiked(product) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const filteredProducts = products.filter((p) => {
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedCondition) {
      const cond = p.specifications?.Condition || '';
      if (cond !== selectedCondition) return false;
    }
    if (priceRange) {
      const price = p.discount > 0 ? (p.price * (1 - p.discount / 100)) : p.price;
      if (priceRange === '0-1000' && (price < 0 || price > 1000)) return false;
      if (priceRange === '1000-2000' && (price < 1000 || price > 2000)) return false;
      if (priceRange === '2000-3000' && (price < 2000 || price > 3000)) return false;
      if (priceRange === '3000+' && price <= 3000) return false;
    }
    return true;
  });

  const discountedPrice = (product) => {
    if (product.discount > 0) {
      return (product.price * (1 - product.discount / 100)).toFixed(2);
    }
    return Number(product.price).toFixed(2);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-green-500/20">
              <CheckCircle size={13} /> 6 Months Warranty
            </span>
            <span className="inline-flex items-center gap-1.5 bg-purple-500/15 text-purple-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-purple-500/20">
              <Package size={13} /> Certified Refurbished
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Laptop size={40} className="text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Laptops</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            High-performance MacBooks and Windows laptops for work, study, and play. Certified and warranty included.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-28">
            <h2 className="text-xl font-bold text-primary-950 mb-6">Filters</h2>

            <div className="mb-6">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search laptops..."
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>

            <div className="w-full h-px bg-border mb-6"></div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-4">Condition</h3>
              <div className="flex flex-wrap gap-2">
                {conditions.map((cond) => (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(selectedCondition === cond ? '' : cond)}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                      selectedCondition === cond
                        ? 'bg-primary-100 text-primary-700 border-primary-200'
                        : 'bg-secondary-100 text-secondary-700 border-transparent hover:bg-secondary-200'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-border mb-8"></div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-4">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setPriceRange(priceRange === range.value ? '' : range.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                      priceRange === range.value
                        ? 'bg-primary-100 text-primary-700 border-primary-200'
                        : 'bg-secondary-50 text-secondary-700 border-border hover:bg-secondary-100'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-border mb-6"></div>

            <button
              onClick={() => { setSearchTerm(''); setPriceRange(''); setSelectedCondition(''); }}
              className="w-full py-2.5 text-sm font-medium text-secondary-600 hover:text-primary-600 border border-border rounded-xl hover:bg-secondary-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary-950 mb-1">All Laptops</h2>
              <p className="text-secondary-600 text-sm">{filteredProducts.length} device(s) available</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">
              Sort: Recommended <ChevronDown size={16} />
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Laptop size={48} className="mx-auto text-secondary-300 mb-4" />
              <h3 className="text-xl font-bold text-primary-950 mb-2">No laptops found</h3>
              <p className="text-secondary-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <div key={product._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border group hover:shadow-soft transition-all">
                  <Link to={`/products/${product._id}`}>
                    <div className="h-56 bg-secondary-100 relative overflow-hidden">
                      <img
                        src={(product.images && product.images[0]) || laptopImages[idx % laptopImages.length]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discount > 0 && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                          -{product.discount}%
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="bg-white/90 text-primary-950 text-xs font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 shadow-lg">
                          <Eye size={14} /> View Details
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CategoryBadge category={product.category} />
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                          {product.productId}
                        </span>
                      </div>
                      {product.stock > 5 ? (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} /> In Stock
                        </span>
                      ) : product.stock > 0 ? (
                        <span className="text-xs text-orange-600 font-medium">Only {product.stock} left</span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                      )}
                    </div>
                    <Link to={`/products/${product._id}`}>
                      <h3 className="text-lg font-bold text-primary-950 hover:text-primary-600 transition-colors mb-1">{product.title}</h3>
                    </Link>
                    <p className="text-xs text-secondary-500 mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} size={14} fill={s < 4 ? '#D4A574' : '#E2E8F0'} color={s < 4 ? '#D4A574' : '#E2E8F0'} />
                      ))}
                      <span className="text-xs text-secondary-500 ml-1">(4.0)</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.specifications && Object.entries(product.specifications).slice(0, 4).map(([key, val]) => (
                        <span key={key} className="text-xs bg-secondary-100 text-secondary-600 px-2.5 py-1 rounded-full font-medium">{key}: {val}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div>
                        {product.discount > 0 && (
                          <div className="text-xs text-secondary-400 line-through">₹{product.price}</div>
                        )}
                        <div className="text-xl font-bold text-primary-950">₹{discountedPrice(product)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleLike(product)}
                          className={`p-2.5 rounded-xl transition-colors ${
                            isLiked(product)
                              ? 'bg-red-50 text-red-500'
                              : 'bg-secondary-100 hover:bg-secondary-200 text-secondary-700'
                          }`}>
                          <Heart size={18} fill={isLiked(product) ? 'currentColor' : 'none'} />
                        </button>
                        <Link
                          to={`/products/${product._id}`}
                          className="bg-secondary-100 hover:bg-secondary-200 text-secondary-700 p-2.5 rounded-xl transition-colors"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock < 1}
                          className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Laptops;
