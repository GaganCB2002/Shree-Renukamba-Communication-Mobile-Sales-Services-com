import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Search, ChevronDown, Package, Eye, CheckCircle, Heart, Smartphone, Laptop, Tablet, Headphones } from 'lucide-react';
import { getProducts, getCategories } from '../../api/productsApi';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import CategoryBadge from '../../components/CategoryBadge';

const accessoryImages = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&q=80&w=600',
];

const catIcons = {
  Phones: Smartphone,
  Laptops: Laptop,
  Tablets: Tablet,
  Accessories: Headphones,
};

const catColors = {
  Phones: 'from-blue-500 to-indigo-600',
  Laptops: 'from-purple-500 to-indigo-600',
  Tablets: 'from-green-500 to-teal-600',
  Accessories: 'from-orange-500 to-red-500',
};

const Accessories = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Accessories');
  const [priceRange, setPriceRange] = useState('');

  const priceRanges = [
    { label: 'Under ₹50', value: '0-50' },
    { label: '₹50 - ₹100', value: '50-100' },
    { label: '₹100 - ₹200', value: '100-200' },
    { label: 'Above ₹200', value: '200+' },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ categoryName: selectedCategory }),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
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
    if (priceRange) {
      const price = p.discount > 0 ? (p.price * (1 - p.discount / 100)) : p.price;
      if (priceRange === '0-50' && (price < 0 || price > 50)) return false;
      if (priceRange === '50-100' && (price < 50 || price > 100)) return false;
      if (priceRange === '100-200' && (price < 100 || price > 200)) return false;
      if (priceRange === '200+' && price <= 200) return false;
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
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-block bg-white/10 backdrop-blur-sm text-orange-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-white/10">
              All types of mobile accessories available
            </span>
            <span className="inline-flex items-center gap-1.5 bg-green-500/15 text-green-300 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-green-500/20">
              <CheckCircle size={13} /> 6 Months Warranty
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Headphones size={40} className="text-orange-400" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Accessories</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Premium chargers, cases, headphones, screen protectors, and more. Complete your setup.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-28">
            <h2 className="text-xl font-bold text-primary-950 mb-6">Categories</h2>

            <div className="space-y-3 mb-8">
              {categories.map((cat) => {
                const Icon = catIcons[cat.categoryName] || Headphones;
                const isActive = selectedCategory === cat.categoryName;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.categoryName)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                        : 'bg-secondary-50 text-secondary-700 border-border hover:bg-secondary-100 hover:border-primary-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-white/20' : 'bg-white shadow-sm'
                    }`}>
                      <Icon size={20} className={isActive ? 'text-white' : 'text-primary-600'} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm">{cat.categoryName}</div>
                      <div className={`text-xs ${isActive ? 'text-white/70' : 'text-secondary-500'}`}>
                        Browse {cat.categoryName.toLowerCase()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="w-full h-px bg-border mb-6"></div>

            <div className="mb-6">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>

            <div className="w-full h-px bg-border mb-6"></div>

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

            <button
              onClick={() => { setSelectedCategory('Accessories'); setSearchTerm(''); setPriceRange(''); }}
              className="w-full py-2.5 text-sm font-medium text-secondary-600 hover:text-primary-600 border border-border rounded-xl hover:bg-secondary-50 transition-colors"
            >
              Reset All
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-primary-950">{selectedCategory}</h2>
              </div>
              <p className="text-secondary-600 text-sm">{filteredProducts.length} product(s) available</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-semibold text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">
              Sort: Recommended <ChevronDown size={16} />
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Headphones size={48} className="mx-auto text-secondary-300 mb-4" />
              <h3 className="text-xl font-bold text-primary-950 mb-2">No products found</h3>
              <p className="text-secondary-500">Try a different category or adjust filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <div key={product._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-border group hover:shadow-soft transition-all">
                  <Link to={`/products/${product._id}`}>
                    <div className="h-56 bg-secondary-100 relative overflow-hidden">
                      <img
                        src={(product.images && product.images[0]) || accessoryImages[idx % accessoryImages.length]}
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

export default Accessories;
