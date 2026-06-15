import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingCart, Star, Shield, Truck, RotateCcw, CheckCircle, Package, ChevronLeft, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { getProductById, getProducts } from '../../api/productsApi';
import { addToCart } from '../../redux/slices/cartSlice';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

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
    setTimeout(() => setAddedToCart(false), 2000);
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
                <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm mb-4">
                  <img
                    src={allImages[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    -{product.discount}% OFF
                  </span>
                )}
                <div className="flex gap-3 mt-4">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-primary-600 shadow-md' : 'border-border hover:border-primary-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
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
                  <button className="p-2.5 rounded-xl border border-border text-secondary-400 hover:text-red-500 hover:border-red-200 transition-all">
                    <Heart size={20} />
                  </button>
                  <button className="p-2.5 rounded-xl border border-border text-secondary-400 hover:text-primary-600 hover:border-primary-200 transition-all">
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

        <section className="mt-16 mb-8">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-primary-950 mb-6">Product Details</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-primary-950 uppercase tracking-wider mb-4">Description</h3>
                <p className="text-secondary-600 leading-relaxed">{product.description}</p>
                <ul className="mt-4 space-y-2">
                  {[
                    '45-point quality inspection performed',
                    '1-year comprehensive warranty included',
                    'Free shipping with tracking',
                    '30-day hassle-free returns',
                    '24/7 customer support',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary-950 uppercase tracking-wider mb-4">Full Specifications</h3>
                {specs.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {specs.map(([key, val], i) => (
                        <tr key={key} className={i % 2 === 0 ? 'bg-secondary-50' : ''}>
                          <td className="py-2.5 px-4 text-secondary-500 font-medium w-2/5">{key}</td>
                          <td className="py-2.5 px-4 text-primary-950 font-semibold">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-secondary-500">No specifications available.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
