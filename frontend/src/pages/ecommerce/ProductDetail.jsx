import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Star, Shield, Truck, RotateCcw, CheckCircle, Package, ChevronLeft, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { getProductById, getProducts } from '../../api/productsApi';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist } from '../../redux/slices/wishlistSlice';
import { useToast } from '../../contexts/ToastContext';
import CategoryBadge from '../../components/CategoryBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import Product3DViewer from '../../components/Product3DViewer';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [viewMode, setViewMode] = useState('2d');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(id);
      setProduct(data);

      const related = await getProducts({ categoryName: data.category?.categoryName });
      setRelatedProducts(related.filter((p) => p._id !== data._id).slice(0, 4));
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(product));
    }
    setAddedToCart(true);
    showToast('Item added to cart successfully!');
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isLiked = product ? wishlistItems.some((x) => x._id === product._id || x.id === product.id) : false;

  const handleLike = () => {
    if (!product) return;
    dispatch(toggleWishlist(product));
    showToast(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.title || 'Check this product', url });
      } catch { /* share may fail */ }
    } else {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    }
  };

  const discountedPrice = (p) => {
    if (p.discount > 0) return (p.price * (1 - p.discount / 100)).toFixed(2);
    return p.price;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProduct} />;
  if (!product) return <ErrorMessage message="Product not found" />;

  const allImages = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1550009158-9efff6c0e561?auto=format&fit=crop&q=80&w=800'];

  const specs = product.specifications ? Object.entries(product.specifications) : [];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={`/${product.category?.categoryName?.toLowerCase() || 'shop'}`} className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 text-sm font-medium mb-8 transition-colors">
          <ChevronLeft size={16} /> Back to {product.category?.categoryName || 'Products'}
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 bg-secondary-50">
              <div className="relative">
                {/* 2D/3D Toggle Tabs */}
                <div className="flex gap-2 mb-4 justify-start">
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      viewMode === '2d'
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-secondary-600 border-border hover:bg-secondary-50'
                    }`}
                  >
                    2D Images
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      viewMode === '3d'
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-secondary-600 border-border hover:bg-secondary-50'
                    }`}
                  >
                    Interactive 3D View
                  </button>
                </div>

                <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm mb-4 relative flex items-center justify-center">
                  {viewMode === '3d' ? (
                    <Product3DViewer product={product} />
                  ) : (
                    <img
                      src={allImages[selectedImage]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {product.discount > 0 && viewMode === '2d' && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                      -{product.discount}% OFF
                    </span>
                  )}
                </div>

                {viewMode === '2d' && (
                  <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          selectedImage === i ? 'border-primary-600 shadow-md' : 'border-border hover:border-primary-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CategoryBadge category={product.category} size="md" />
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-wider">
                      {product.category?.categoryName || 'Uncategorized'}
                    </span>
                    {product.stock > 10 ? (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> In Stock
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="text-xs font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                        Only {product.stock} left
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary-950 mb-2">{product.title}</h1>
                  <p className="text-sm text-secondary-500 font-mono">SKU: {product.productId}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleLike} className={`p-2.5 rounded-xl border transition-all ${
                    isLiked
                      ? 'border-red-200 text-red-500 bg-red-50'
                      : 'border-border text-secondary-400 hover:text-red-500 hover:border-red-200'
                  }`}>
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button onClick={handleShare} className="p-2.5 rounded-xl border border-border text-secondary-400 hover:text-primary-600 hover:border-primary-200 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} size={18} fill={s < 4 ? '#D4A574' : '#E2E8F0'} color={s < 4 ? '#D4A574' : '#E2E8F0'} />
                ))}
                <span className="text-sm text-secondary-500 ml-2">4.0 (128 reviews)</span>
              </div>

              <div className="flex items-end gap-3 mb-8 pb-8 border-b border-border">
                <div className="text-4xl font-bold text-primary-950">₹{discountedPrice(product)}</div>
                {product.discount > 0 && (
                  <>
                    <div className="text-lg text-secondary-400 line-through mb-1">₹{product.price}</div>
                    <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full mb-1">
                      Save ₹{(product.price - discountedPrice(product)).toFixed(2)}
                    </div>
                  </>
                )}
              </div>

              <p className="text-secondary-600 leading-relaxed mb-8">{product.description}</p>

              {specs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-primary-950 uppercase tracking-wider mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {specs.map(([key, val]) => (
                      <div key={key} className="bg-secondary-50 rounded-xl px-4 py-3">
                        <div className="text-xs text-secondary-500 mb-0.5">{key}</div>
                        <div className="text-sm font-semibold text-primary-950">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-bold text-primary-950 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-3 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock < 1}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {addedToCart ? (
                    <><CheckCircle size={18} /> Added to Cart</>
                  ) : (
                    <><ShoppingCart size={18} /> Add to Cart - ₹{(discountedPrice(product) * quantity).toFixed(2)}</>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                {[
                  { icon: Shield, label: 'Certified Quality', desc: '45-point inspection' },
                  { icon: Truck, label: 'Free Shipping', desc: 'On all orders' },
                  { icon: RotateCcw, label: '30-Day Returns', desc: 'No questions asked' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <item.icon size={18} className="text-primary-600" />
                    </div>
                    <div className="text-xs font-bold text-primary-950">{item.label}</div>
                    <div className="text-xs text-secondary-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-primary-950 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp, idx) => {
                const imgSrc = rp.images && rp.images[0]
                  ? rp.images[0]
                  : 'https://images.unsplash.com/photo-1550009158-9efff6c0e561?auto=format&fit=crop&q=80&w=600';

                return (
                  <Link key={rp._id} to={`/products/${rp._id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border group hover:shadow-soft transition-all">
                    <div className="h-48 bg-secondary-100 overflow-hidden">
                      <img src={imgSrc} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-primary-950 text-sm mb-1 group-hover:text-primary-600 transition-colors">{rp.title}</h3>
                      <div className="flex items-center gap-2">
                        {rp.discount > 0 && <span className="text-xs text-secondary-400 line-through">₹{rp.price}</span>}
                        <span className="text-lg font-bold text-primary-950">₹{discountedPrice(rp)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── FULL PRODUCT SPECIFICATIONS (Flipkart/Amazon style) ── */}
        <section className="mt-16 mb-8">
          <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
            <div className="px-8 py-5 border-b border-border bg-secondary-50/30">
              <h2 className="text-xl font-bold text-primary-950 flex items-center gap-2">
                <span style={{ width: 4, height: 24, background: '#6366f1', borderRadius: 2, display: 'inline-block' }}></span>
                Product Specifications
              </h2>
            </div>
            <div className="p-8 md:p-10">
              {specs.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {specs.map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-secondary-50/50' : 'bg-white'}>
                        <td className="py-3.5 px-5 text-secondary-500 font-medium w-2/5 border-b border-border/50" style={{ color: 'var(--clr-text-muted)' }}>{key}</td>
                        <td className="py-3.5 px-5 text-primary-950 font-semibold border-b border-border/50">{val}</td>
                      </tr>
                    ))}
                    <tr className={specs.length % 2 === 0 ? 'bg-secondary-50/50' : 'bg-white'}>
                        <td className="py-3.5 px-5 text-secondary-500 font-medium w-2/5 border-b border-border/50" style={{ color: 'var(--clr-text-muted)' }}>Warranty</td>
                      <td className="py-3.5 px-5 text-primary-950 font-semibold border-b border-border/50">1 Year Comprehensive Warranty</td>
                    </tr>
                    <tr className={(specs.length + 1) % 2 === 0 ? 'bg-secondary-50/50' : 'bg-white'}>
                        <td className="py-3.5 px-5 text-secondary-500 font-medium w-2/5 border-b border-border/50" style={{ color: 'var(--clr-text-muted)' }}>Condition</td>
                      <td className="py-3.5 px-5 text-primary-950 font-semibold border-b border-border/50">{product.discount > 0 ? 'Certified Pre-Owned' : 'New'}</td>
                    </tr>
                    <tr className={(specs.length + 2) % 2 === 0 ? 'bg-secondary-50/50' : 'bg-white'}>
                        <td className="py-3.5 px-5 text-secondary-500 font-medium w-2/5" style={{ color: 'var(--clr-text-muted)' }}>In The Box</td>
                      <td className="py-3.5 px-5 text-primary-950 font-semibold">
                        {product.title}, Charging Cable, SIM ejector tool, User Manual, Warranty Card
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
                  <Package size={40} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-secondary-500">Detailed specifications are not available for this product.</p>
                  <p className="text-secondary-400 text-xs mt-2">Contact our support team for more information.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── HIGHLIGHTS SECTION (Flipkart style) ── */}
        <section className="mt-8 mb-8">
          <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
            <div className="px-8 py-5 border-b border-border bg-secondary-50/30">
              <h2 className="text-xl font-bold text-primary-950 flex items-center gap-2">
                <span style={{ width: 4, height: 24, background: '#6366f1', borderRadius: 2, display: 'inline-block' }}></span>
                Product Description
              </h2>
            </div>
            <div className="p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div>
                  <p className="text-secondary-600 leading-relaxed">{product.description}</p>
                  <ul className="mt-5 space-y-3">
                    {[
                      '45-point quality inspection performed',
                      '1-year comprehensive warranty included',
                      'Free shipping with tracking',
                      '30-day hassle-free returns',
                      '24/7 customer support',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-secondary-600">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block', flexShrink: 0 }}></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-secondary-50/30 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-primary-950 uppercase tracking-wider mb-5">Why buy from SR Communication?</h3>
                  <div className="space-y-5">
                    {[
                      { icon: Shield, title: 'Certified Quality', desc: 'Every product undergoes a rigorous 45-point inspection process.' },
                      { icon: Truck, title: 'Free Delivery', desc: 'Free shipping on all orders with real-time tracking.' },
                      { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy. No questions asked.' },
                      { icon: CheckCircle, title: '1 Year Warranty', desc: 'Comprehensive warranty covering manufacturing defects.' },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <item.icon size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-primary-950">{item.title}</div>
                          <div className="text-xs text-secondary-500 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
