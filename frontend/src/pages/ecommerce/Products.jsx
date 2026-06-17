import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, ChevronDown, CheckCircle2, Search } from 'lucide-react';
import { getProducts, getCategories } from '../../api/productsApi';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../contexts/ToastContext';
import CategoryBadge from '../../components/CategoryBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [sortOpen, setSortOpen] = useState(false);
  const [newArrivals, setNewArrivals] = useState(false);
  const [newProducts, setNewProducts] = useState(false);
  const [recentLaunches, setRecentLaunches] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const conditions = ['Excellent', 'Like New', 'Good'];

  const now = new Date();

  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const keyword = searchParams.get('keyword') || '';
    const cond = searchParams.get('condition') || '';
    const na = searchParams.get('newArrivals') === 'true';
    const np = searchParams.get('newProducts') === 'true';
    const rl = searchParams.get('recentLaunches') === 'true';
    const pMin = searchParams.get('priceMin') || '';
    const pMax = searchParams.get('priceMax') || '';
    setSelectedCategory(cat);
    setSearchTerm(keyword);
    setSelectedCondition(cond);
    setNewArrivals(na);
    setNewProducts(np);
    setRecentLaunches(rl);
    setPriceMin(pMin);
    setPriceMax(pMax);
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchTerm, fetchData]);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      const cat = searchParams.get('category') || selectedCategory;
      const keyword = searchParams.get('keyword') || searchTerm;
      if (cat) params.category = cat;
      if (keyword) params.keyword = keyword;
      const [productsData, categoriesData] = await Promise.all([
        getProducts(params),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchTerm) params.keyword = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedCondition) params.condition = selectedCondition;
    if (newArrivals) params.newArrivals = 'true';
    if (newProducts) params.newProducts = 'true';
    if (recentLaunches) params.recentLaunches = 'true';
    if (priceMin) params.priceMin = priceMin;
    if (priceMax) params.priceMax = priceMax;
    setSearchParams(params);
  };

  const handleCategoryClick = (catId) => {
    const newCategory = selectedCategory === catId ? '' : catId;
    const params = {};
    if (newCategory) params.category = newCategory;
    if (searchTerm) params.keyword = searchTerm;
    setSearchParams(params);
  };

  const handleClearCategory = () => {
    const params = {};
    if (searchTerm) params.keyword = searchTerm;
    setSearchParams(params);
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
    if (selectedCondition) {
      if (selectedCondition.toLowerCase() === 'refurbished') return true;
      const cond = p.condition || p.specifications?.Condition || '';
      return cond.toLowerCase() === selectedCondition.toLowerCase();
    }
    return true;
  }).filter((p) => {
    const createdAt = p.createdAt ? new Date(p.createdAt) : null;
    const daysSinceCreated = createdAt ? Math.floor((now - createdAt) / (1000 * 60 * 60 * 24)) : 999;
    if (newArrivals && daysSinceCreated > 30) return false;
    if (newProducts && daysSinceCreated > 60) return false;
    if (recentLaunches && daysSinceCreated > 90) return false;
    return true;
  }).filter((p) => {
    const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
    if (priceMin && price < Number(priceMin)) return false;
    if (priceMax && price > Number(priceMax)) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
    const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;

    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'discount-desc':
        return b.discount - a.discount;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const discountedPrice = (product) => {
    if (product.discount > 0) {
      return (product.price * (1 - product.discount / 100)).toFixed(2);
    }
    return product.price;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border sticky top-24">
            <h2 className="text-xl font-bold text-primary-950 mb-6">Filters</h2>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
            </form>

            {categories.length > 0 && (
              <>
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-4">Categories</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group" onClick={handleClearCategory}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${!selectedCategory ? 'bg-primary-600 border-primary-600' : 'border-secondary-300 group-hover:border-primary-400'}`}>
                        {!selectedCategory && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm ${!selectedCategory ? 'text-primary-900 font-medium' : 'text-secondary-600'}`}>All</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleCategoryClick(cat._id)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat._id ? 'bg-primary-600 border-primary-600' : 'border-secondary-300 group-hover:border-primary-400'}`}>
                          {selectedCategory === cat._id && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className={`text-sm ${selectedCategory === cat._id ? 'text-primary-900 font-medium' : 'text-secondary-600'}`}>{cat.categoryName}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="w-full h-px bg-border mb-8"></div>
              </>
            )}

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
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
                <span className="text-secondary-400">-</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-secondary-50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <button
                onClick={() => {
                  const params = {};
                  if (searchTerm) params.keyword = searchTerm;
                  if (selectedCategory) params.category = selectedCategory;
                  if (selectedCondition) params.condition = selectedCondition;
                  if (newArrivals) params.newArrivals = 'true';
                  if (newProducts) params.newProducts = 'true';
                  if (recentLaunches) params.recentLaunches = 'true';
                  if (priceMin) params.priceMin = priceMin;
                  if (priceMax) params.priceMax = priceMax;
                  setSearchParams(params);
                }}
                className="mt-2 w-full py-2 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
              >
                Apply Price
              </button>
            </div>

            <div className="w-full h-px bg-border mb-8"></div>

            <div className="mb-8">
              <h3 className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-4">Availability</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newArrivals}
                    onChange={() => {
                      setNewArrivals(!newArrivals);
                      const params = {};
                      if (searchTerm) params.keyword = searchTerm;
                      if (selectedCategory) params.category = selectedCategory;
                      if (selectedCondition) params.condition = selectedCondition;
                      if (priceMin) params.priceMin = priceMin;
                      if (priceMax) params.priceMax = priceMax;
                      if (!newArrivals) params.newArrivals = 'true';
                      if (newProducts) params.newProducts = 'true';
                      if (recentLaunches) params.recentLaunches = 'true';
                      setSearchParams(params);
                    }}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">Newly Arrived</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={newProducts}
                    onChange={() => {
                      setNewProducts(!newProducts);
                      const params = {};
                      if (searchTerm) params.keyword = searchTerm;
                      if (selectedCategory) params.category = selectedCategory;
                      if (selectedCondition) params.condition = selectedCondition;
                      if (priceMin) params.priceMin = priceMin;
                      if (priceMax) params.priceMax = priceMax;
                      if (newArrivals) params.newArrivals = 'true';
                      if (!newProducts) params.newProducts = 'true';
                      if (recentLaunches) params.recentLaunches = 'true';
                      setSearchParams(params);
                    }}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">New Products</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={recentLaunches}
                    onChange={() => {
                      setRecentLaunches(!recentLaunches);
                      const params = {};
                      if (searchTerm) params.keyword = searchTerm;
                      if (selectedCategory) params.category = selectedCategory;
                      if (selectedCondition) params.condition = selectedCondition;
                      if (priceMin) params.priceMin = priceMin;
                      if (priceMax) params.priceMax = priceMax;
                      if (newArrivals) params.newArrivals = 'true';
                      if (newProducts) params.newProducts = 'true';
                      if (!recentLaunches) params.recentLaunches = 'true';
                      setSearchParams(params);
                    }}
                    className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-secondary-700">Recent Launches</span>
                </label>
              </div>
            </div>

            <div className="w-full h-px bg-border mb-8"></div>

            <button
              onClick={() => { setSelectedCategory(''); setSelectedCondition(''); setSearchTerm(''); setNewArrivals(false); setNewProducts(false); setRecentLaunches(false); setPriceMin(''); setPriceMax(''); setSearchParams({}); setSortBy('recommended'); }}
              className="w-full py-2.5 text-sm font-medium text-secondary-600 hover:text-primary-600 border border-border rounded-xl hover:bg-secondary-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-950 mb-2">
                {selectedCategory ? categories.find(c => c._id === selectedCategory)?.categoryName || 'Products' : 'All Products'}
              </h1>
              <p className="text-secondary-600 text-sm">{sortedProducts.length} device(s) available.</p>
            </div>
            
            <div className="relative flex items-center gap-2 text-sm">
              <span className="text-secondary-500 font-medium">Sort by:</span>
              <button 
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 font-semibold text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm cursor-pointer select-none"
              >
                {sortBy === 'recommended' && 'Recommended'}
                {sortBy === 'price-asc' && 'Price: Low to High'}
                {sortBy === 'price-desc' && 'Price: High to Low'}
                {sortBy === 'discount-desc' && 'Highest Discount'}
                {sortBy === 'title-asc' && 'Name: A to Z'}
                <ChevronDown size={16} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-20 py-1 min-w-[170px] whitespace-nowrap">
                    {[
                      { label: 'Recommended', value: 'recommended' },
                      { label: 'Price: Low to High', value: 'price-asc' },
                      { label: 'Price: High to Low', value: 'price-desc' },
                      { label: 'Highest Discount', value: 'discount-desc' },
                      { label: 'Name: A to Z', value: 'title-asc' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary-50 transition-colors ${sortBy === option.value ? 'font-bold text-primary-600 bg-secondary-50' : 'text-secondary-700'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description={(priceMin || priceMax) ? "No products available on this budget. Try adjusting your price range." : "Try adjusting your filters or search terms."}
              action={
                <Link to="/shop" className="btn-primary text-sm" onClick={() => { setSelectedCategory(''); setSelectedCondition(''); setSearchTerm(''); setNewArrivals(false); setNewProducts(false); setRecentLaunches(false); setPriceMin(''); setPriceMax(''); setSearchParams({}); }}>
                  View All Products
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-border relative group hover:shadow-soft transition-all cursor-pointer"
                >
                  <button onClick={(e) => { e.stopPropagation(); handleLike(product); }} className={`absolute top-5 right-5 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm transition-colors ${
                    isLiked(product) ? 'text-red-500' : 'text-secondary-400 hover:text-red-500'
                  }`}>
                    <Heart size={16} fill={isLiked(product) ? 'currentColor' : 'none'} />
                  </button>

                  <div className="absolute top-5 left-5 z-10 flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                    <CheckCircle2 size={12} /> Excellent
                  </div>

                  <div className="bg-secondary-50 rounded-2xl h-60 mb-5 relative overflow-hidden flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-7xl">📱</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary-950 group-hover:text-primary-600 transition-colors">{product.title}</h3>
                      <p className="text-xs text-secondary-500 font-mono mt-1 uppercase">SKU: {product.productId}</p>
                      <div style={{ marginTop: '6px' }}>
                        <CategoryBadge category={product.category} />
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs font-bold text-secondary-600 flex-wrap">
                      {product.specifications && Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                        <span key={key} className="bg-secondary-100 px-2 py-1 rounded">{val}</span>
                      ))}
                    </div>

                    <div className="flex items-end justify-between pt-2">
                      <div>
                        {product.discount > 0 && (
                          <div className="text-sm text-secondary-400 line-through decoration-secondary-300 font-medium">₹{product.price}</div>
                        )}
                        <div className="text-3xl font-bold text-primary-950">₹{product.discount > 0 ? discountedPrice(product) : product.price}</div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                      >
                        Add to Cart <ShoppingCart size={16} />
                      </button>
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

export default Products;
