import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, ChevronDown, CheckCircle2, Sparkles, Search, Loader2 } from 'lucide-react';
import { getProducts, getCategories } from '../../api/productsApi';
import { addToCart } from '../../redux/slices/cartSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Products = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState('');

  const conditions = ['Excellent', 'Like New', 'Good'];

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
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
    setSearchParams(params);
    fetchData();
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCondition) {
      return p.condition === selectedCondition;
    }
    return true;
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
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${!selectedCategory ? 'bg-primary-600 border-primary-600' : 'border-secondary-300 group-hover:border-primary-400'}`}>
                        {!selectedCategory && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className={`text-sm ${!selectedCategory ? 'text-primary-900 font-medium' : 'text-secondary-600'}`}>All</span>
                    </label>
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedCategory(selectedCategory === cat._id ? '' : cat._id)}>
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

            <button
              onClick={() => { setSelectedCategory(''); setSelectedCondition(''); setSearchTerm(''); setSearchParams({}); }}
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
              <p className="text-secondary-600 text-sm">{filteredProducts.length} device(s) available.</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-secondary-500 font-medium">Sort by:</span>
              <button className="flex items-center gap-1 font-semibold text-primary-700 bg-white px-3 py-1.5 rounded-lg border border-border shadow-sm">
                Recommended <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
              action={
                <Link to="/shop" className="btn-primary text-sm" onClick={() => { setSelectedCategory(''); setSelectedCondition(''); setSearchTerm(''); }}>
                  View All Products
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-3xl p-5 shadow-sm border border-border relative group hover:shadow-soft transition-all">
                  <button className="absolute top-5 right-5 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-secondary-400 hover:text-red-500 shadow-sm transition-colors">
                    <Heart size={16} />
                  </button>

                  <div className="absolute top-5 left-5 z-10 flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                    <CheckCircle2 size={12} /> Excellent
                  </div>

                  <Link to={`/products/${product._id}`}>
                    <div className="bg-secondary-50 rounded-2xl h-60 mb-5 relative overflow-hidden flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-7xl">📱</span>
                      )}
                    </div>
                  </Link>

                  <div className="space-y-4">
                    <div>
                      <Link to={`/products/${product._id}`}>
                        <h3 className="text-xl font-bold text-primary-950 hover:text-primary-600 transition-colors">{product.title}</h3>
                      </Link>
                      <p className="text-xs text-secondary-500 font-mono mt-1 uppercase">SKU: {product.productId}</p>
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
                        onClick={() => handleAddToCart(product)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                      >
                        Add <ShoppingCart size={16} />
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
