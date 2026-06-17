import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Shield, Truck, RotateCcw, Package, ShoppingCart, Sparkles, Clock, Wrench, Smartphone, Battery, Droplets, Cpu, Heart, ArrowRight, Search, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import { getProducts, getCategories } from '../api/productsApi';
import { trackOrder } from '../api/ordersApi';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { useToast } from '../contexts/ToastContext';
import CategoryBadge from '../components/CategoryBadge';

const placeholder = (text, _bg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23g)'/%3E%3Ctext x='800' y='450' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='48' fill='white'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;

const heroImages = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=1600',
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1600',
];

const collections = [
  { title: 'Premium Smartphones', desc: 'Certified pre-owned iPhones and Androids', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600', link: '/smartphones' },
  { title: 'Laptops & MacBooks', desc: 'High-performance machines for work and play', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600', link: '/laptops' },
  { title: 'Accessories & Audio', desc: 'Headphones, chargers, and essential gear', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600', link: '/accessories' },
];

const testimonials = [
  { name: 'Rahul S.', text: 'Bought an iPhone 14 Pro from here. The condition was better than described. Battery health at 98%! Highly recommend.', role: 'Verified Buyer' },
  { name: 'Priya M.', text: 'Excellent service! My MacBook arrived in 2 days, perfectly packaged. Saved over ₹4,000 compared to new.', role: 'Loyal Customer' },
  { name: 'Amit K.', text: 'Had an issue with my iPad, they replaced it within a week under warranty. Trustworthy store and great support.', role: 'Premium Member' },
];

const repairServices = [
  { icon: Smartphone, title: 'Screen Replacement', desc: 'Cracked or broken screen? We replace screens for all major brands with genuine quality parts.', color: 'from-blue-500 to-blue-600' },
  { icon: Battery, title: 'Battery Replacement', desc: 'Is your phone dying too fast? Get a fresh, high-quality battery installed within an hour.', color: 'from-green-500 to-green-600' },
  { icon: Droplets, title: 'Water Damage Repair', desc: 'Dropped your device in water? Our ultrasonic cleaning and component repair can save it.', color: 'from-cyan-500 to-cyan-600' },
  { icon: Cpu, title: 'Hardware & Software', desc: 'From charging ports to motherboard repairs and software issues - we fix it all.', color: 'from-purple-500 to-purple-600' },
];

const slidingAccessories = [
  { title: 'Premium iPhone 14 Screen Guard', price: '₹499', image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=400' },
  { title: 'Silicone Back Case', price: '₹299', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400' },
  { title: 'Type-C Fast Charger 20W', price: '₹999', image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=400' },
  { title: 'Matte Finish Glass Protector', price: '₹349', image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=400' },
  { title: 'Leather Flip Cover', price: '₹599', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=400' },
  { title: 'Wireless Charging Pad', price: '₹1499', image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=400' },
  { title: 'Camera Lens Protector', price: '₹199', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=400' },
  { title: 'Clear Transparent Case', price: '₹249', image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=400' },
  { title: 'Braided Data Cable', price: '₹399', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=400' },
  { title: 'Privacy Screen Guard', price: '₹599', image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=400' },
  { title: 'Rugged Armor Case', price: '₹799', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=400' },
  { title: 'Car Charger Dual Port', price: '₹699', image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=400' },
  { title: 'UV Glue Tempered Glass', price: '₹899', image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=400' },
  { title: 'Magnetic Ring Case', price: '₹449', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400' },
  { title: 'Power Bank 10000mAh', price: '₹1299', image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?auto=format&fit=crop&q=80&w=400' },
  { title: 'Edge-to-Edge Screen Guard', price: '₹399', image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=400' },
  { title: 'Liquid Silicone Cover', price: '₹349', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=400' },
  { title: 'Type-C to 3.5mm Adapter', price: '₹299', image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=400' },
  { title: 'Gaming Glass Protector', price: '₹499', image: 'https://images.unsplash.com/photo-1581090700227-1e37b190418e?auto=format&fit=crop&q=80&w=400' },
  { title: 'Shockproof Bumper Case', price: '₹549', image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=400' },
  { title: '65W GaN Charger', price: '₹1999', image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&q=80&w=400' },
];

export default function LandingPage() {
  const { t } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);
  const observerRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchError(null);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error('Failed to fetch landing data:', err);
        setFetchError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bestSellers = products.slice(0, 4);
  const newStocks = products.filter(p => p.stock > 0).slice(0, 8);
  const discountedPrice = (p) => {
    const price = Number(p.price) || 0;
    const disc = Number(p.discount) || 0;
    return disc > 0 ? (price * (1 - disc / 100)).toFixed(2) : price;
  };
  const isLiked = (product) => wishlistItems.some((x) => x._id === product._id || x.id === product.id);
  const handleLike = (product) => {
    const liked = isLiked(product);
    dispatch(toggleWishlist(product));
    showToast(liked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);
    try {
      const data = await trackOrder(trackId.trim());
      setTrackResult(data);
    } catch (err) {
      setTrackError(err.response?.data?.message || 'Order not found');
    } finally {
      setTrackLoading(false);
    }
  };

  // Auto-slide removed — user found it annoying

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    els.forEach(el => el.classList.add('revealed'));
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [loading]);

  useEffect(() => {
    document.title = 'Shree Renukamba Communication - Mobile Sales & Services';
  }, []);

  return (
    <div style={{ paddingTop: 0 }}>
      {/* ── HERO ── */}
      <section className="lp-hero">
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`lp-hero-bg${i === slideIndex ? ' active' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          <h1 className="lp-hero-title reveal" style={{ marginTop: 40 }}>
            {t('home.heroTitle1')} <span className="lp-hero-highlight">{t('home.heroTitle2')}</span>
            <span className="lp-hero-highlight">{t('home.heroTitle3')}</span>
          </h1>
          <p className="lp-hero-desc reveal">
            {t('home.heroDesc')}
          </p>
          <div className="lp-hero-buttons reveal">
            <Link to="/shop" className="lp-btn-primary lp-btn-lg">
              {t('home.browseStore')} <ChevronRight size={16} />
            </Link>
            <Link to="/dashboard/repairs/new" className="lp-btn-outline lp-btn-light lp-btn-lg">
              {t('home.bookRepair')}
            </Link>
          </div>
          <div className="lp-hero-stats reveal">
            <div className="lp-stat">
              <span className="lp-stat-num">45+</span>
              <span className="lp-stat-label">{t('home.stat1')}</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">10K+</span>
              <span className="lp-stat-label">{t('home.stat2')}</span>
            </div>
            <div className="lp-stat">
              <span className="lp-stat-num">1 Yr</span>
              <span className="lp-stat-label">{t('home.stat3')}</span>
            </div>
          </div>
          <div className="lp-hero-dots">
            {heroImages.map((_, i) => (
              <button type="button"
                key={i}
                className={`lp-hero-dot${i === slideIndex ? ' active' : ''}`}
                onClick={() => setSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY QUICK LINKS (FLIPKART STYLE) ── */}
      <div style={{ background: 'var(--clr-white)', borderBottom: '1px solid var(--clr-border)', padding: '16px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }} className="reveal">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '36px', overflowX: 'auto', paddingBottom: '4px' }}>
            <Link to="/shop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '8px', flexShrink: 0 }} className="quick-cat-link">
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--clr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--clr-border)', overflow: 'hidden', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '1.3rem' }}>🛍️</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>All Products</span>
            </Link>
            
            {categories.map((cat) => (
              <Link key={cat._id} to={`/shop?category=${cat._id}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '8px', flexShrink: 0 }} className="quick-cat-link">
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--clr-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--clr-border)', overflow: 'hidden', transition: 'all 0.2s' }}>
                    {cat.categoryImage ? (
                    <img src={cat.categoryImage} alt={cat.categoryName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span style={{ fontSize: '1.3rem' }}>📱</span>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.categoryName}</span>
              </Link>
            ))}

            <Link to="/dashboard/repairs/new" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '8px', flexShrink: 0 }} className="quick-cat-link">
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--clr-icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #E2E8F0', overflow: 'hidden', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '1.3rem' }}>🔧</span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-on-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Book Repair</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── ACCESSORIES SHOWCASE (MARQUEE) — MOVED TO TOP 3RD POSITION ── */}
      <section className="lp-section-alt" style={{ padding: '60px 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: 'var(--clr-accent-brand)' }}>Accessories Showcase</span>
          <h2 style={{ fontSize: '2rem', color: 'var(--clr-text)', marginBottom: 8 }}>All Types of Mobile Accessories</h2>
          <p style={{ color: 'var(--clr-text-light)' }}>Screen guards, back cases, chargers, and everything your device needs.</p>
        </div>
        
        <div className="accessories-marquee-container">
          <div className="accessories-marquee">
            {[...slidingAccessories, ...slidingAccessories].map((item, idx) => (
              <div key={idx} className="marquee-item">
                <div className="marquee-img-wrap">
                  <img src={item.image} alt={item.title} onError={e => { e.target.style.display = 'none'; }} />
                </div>
                <div className="marquee-details">
                  <h4>{item.title}</h4>
                  <span>{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .accessories-marquee-container {
            width: 100%;
            position: relative;
            background: var(--clr-white);
            padding: 30px 0;
            border-top: 1px solid var(--clr-border);
            border-bottom: 1px solid var(--clr-border);
            overflow: hidden;
          }
          .accessories-marquee {
            display: flex;
            gap: 24px;
            width: max-content;
            animation: marquee-scroll 50s linear infinite;
          }
          .accessories-marquee:hover {
            animation-play-state: paused;
          }
          @keyframes marquee-scroll {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .marquee-item {
            width: 200px;
            background: var(--clr-cream);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid var(--clr-border);
            flex-shrink: 0;
            transition: transform 0.3s ease;
          }
          .marquee-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          }
          .marquee-img-wrap {
            height: 140px;
            width: 100%;
            background: var(--clr-white);
            border-bottom: 1px solid var(--clr-border);
          }
          .marquee-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 16px;
          }
          .marquee-details {
            padding: 12px 16px;
            text-align: center;
          }
          .marquee-details h4 {
            font-size: 0.85rem;
            color: var(--clr-text);
            margin: 0 0 4px 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .marquee-details span {
            font-size: 0.8rem;
            color: var(--clr-primary);
            font-weight: 600;
          }
        `}} />
      </section>

      {/* ── PROMOTIONAL DEALS & COUPONS (FLIPKART STYLE) ── */}
      <section className="promo-section reveal">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          
          {/* Main Coupon Banner (Dotted Ticket Style) */}
          <div className="promo-coupon-banner">
            <div className="promo-coupon-left">
              <div style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--clr-accent)', marginBottom: '8px' }}>Special Repair Deal</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.2 }}>Flat ₹500 Off on Screen &amp; Battery Replacements!</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.9 }}>Get your device fixed by professional technicians today. Offer valid this week only.</p>
            </div>
            <div className="promo-coupon-right">
              <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.7, marginBottom: '4px' }}>Coupon Code</div>
              <code>FIXMYDEVICE</code>
            </div>
            
            {/* Dotted border circles on ticket sides */}
            <div className="promo-coupon-notch-left"></div>
            <div className="promo-coupon-notch-right"></div>
          </div>

          {/* Three-Column Offer Banners */}
          <div className="promo-grid">
            {/* Banner 1 */}
            <Link to="/shop" style={{ textDecoration: 'none' }} className="promo-card">
              <div className="promo-card-img-wrap">
                <img src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600" alt="Mobiles Offer" onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div className="promo-card-content">
                <div>
                  <div className="promo-card-tag">Smartphones</div>
                  <h4 className="promo-card-title">Pre-Owned iPhones &amp; Androids</h4>
                  <p className="promo-card-desc">Certified 45-point inspected devices starting from ₹9,999 with 6-month warranty.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 750, color: 'var(--clr-primary)', marginTop: '16px' }}>
                  Shop Phones <ArrowRight size={12} />
                </div>
              </div>
            </Link>

            {/* Banner 2 */}
            <Link to="/shop" style={{ textDecoration: 'none' }} className="promo-card">
              <div className="promo-card-img-wrap">
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600" alt="Laptops Offer" onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div className="promo-card-content">
                <div>
                  <div className="promo-card-tag">Mac &amp; Windows</div>
                  <h4 className="promo-card-title">Supercharged Laptops</h4>
                  <p className="promo-card-desc">Save up to 20% on Apple MacBooks and high-performance Windows business laptops.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 750, color: 'var(--clr-primary)', marginTop: '16px' }}>
                  Shop Laptops <ArrowRight size={12} />
                </div>
              </div>
            </Link>

            {/* Banner 3 */}
            <Link to="/shop" style={{ textDecoration: 'none' }} className="promo-card">
              <div className="promo-card-img-wrap">
                <img src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600" alt="Accessories Offer" onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div className="promo-card-content">
                <div>
                  <div className="promo-card-tag">Gear Sale</div>
                  <h4 className="promo-card-title">Premium Accessories</h4>
                  <p className="promo-card-desc">Charging adapters, cables, tempered glass, and back cases. Buy 2 Get 1 Free today.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 750, color: 'var(--clr-primary)', marginTop: '16px' }}>
                  Shop Accessories <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW STOCKS ── */}
      <section className="lp-section-alt">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: 'var(--clr-accent-brand)' }}>{t('home.newStocks')}</span>
            <h2>{t('home.newStocks')}</h2>
            <p>{t('home.newStocksDesc')}</p>
          </div>
          {fetchError && (
            <div style={{ textAlign: 'center', padding: '12px', marginBottom: '24px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#B91C1C', fontSize: '0.85rem' }}>
              {fetchError}
            </div>
          )}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} style={{ height: 350, background: 'var(--clr-white)', borderRadius: 16, opacity: 0.5, border: '1px solid var(--clr-border)' }} />
              ))}
            </div>
          ) : newStocks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {newStocks.map((product, _i) => (
                <div key={product._id} className="reveal" onClick={() => navigate(`/products/${product._id}`)} style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--clr-white)', border: '1px solid var(--clr-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                    <div style={{ height: 200, background: 'var(--clr-icon-bg)', position: 'relative', overflow: 'hidden' }}>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div style={{ width: '100%', height: '100%', display: product.images && product.images[0] ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={40} color="var(--clr-text-muted)" />
                      </div>
                      <span style={{ position: 'absolute', top: 10, right: 10, background: 'var(--clr-accent-brand)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Sparkles size={11} /> {t('home.justAdded')}
                      </span>
                      {product.discount > 0 && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                      {[...Array(5)].map((_, s) => <Star key={s} size={12} fill={s < 4 ? "var(--clr-star-active)" : "var(--clr-star-inactive)"} color={s < 4 ? "var(--clr-star-active)" : "var(--clr-star-inactive)"} />)}
                    </div>
                      <h3 style={{ fontSize: '0.95rem', color: 'var(--clr-text-on-light)', margin: '0 0 8px 0', fontWeight: 600 }}>{product.title}</h3>
                    <div style={{ marginBottom: '6px' }}><CategoryBadge category={product.category} /></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 8 }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> {product.stock} units available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--clr-border)', paddingTop: 12 }}>
                      <div>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', textDecoration: 'line-through', marginRight: 6 }}>₹{product.price}</span>
                        )}
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-accent-brand)' }}>₹{discountedPrice(product)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleLike(product); }}
                          style={{ background: isLiked(product) ? '#FEE2E2' : '#F1F5F9', border: 'none', color: isLiked(product) ? '#EF4444' : '#64748B', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Heart size={13} fill={isLiked(product) ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); dispatch(addToCart(product)); showToast('Item added to cart successfully!'); }}
                          style={{ background: 'var(--clr-accent-brand)', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '40px 0' }}>
              <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>New arrivals coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── REPAIR SERVICES ── */}
      <section className="lp-section">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(234,88,12,0.3)', color: 'var(--clr-accent-orange)' }}>Repair Services</span>
            <h2>Professional Phone &amp; Laptop Repairs</h2>
            <p>Fast, reliable, and affordable repair services by certified technicians with genuine parts.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: 48 }}>
            {repairServices.map((svc, i) => (
              <div key={i} className="reveal" style={{ padding: '32px', borderRadius: 20, background: 'var(--clr-cream)', border: '1px solid var(--clr-border)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--clr-icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svc.icon size={28} style={{ color: 'var(--clr-accent-brand)' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--clr-text-on-light)', marginBottom: 8 }}>{svc.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{svc.desc}</p>
                <Link to="/dashboard/repairs/new" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-accent-brand)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Book Now <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section className="lp-section-alt">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: 'var(--clr-accent-brand)' }}>{t('home.featured')}</span>
            <h2>{t('home.bestSellers')}</h2>
            <p>{t('home.bestSellersDesc')}</p>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ height: 350, background: 'var(--clr-white)', borderRadius: 16, opacity: 0.5, border: '1px solid var(--clr-border)' }} />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {bestSellers.map((product, _i) => (
                <div key={product._id} className="reveal" onClick={() => navigate(`/products/${product._id}`)} style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--clr-white)', border: '1px solid var(--clr-border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
                    <div style={{ height: 220, background: 'var(--clr-icon-bg)', position: 'relative', overflow: 'hidden' }}>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                      ) : null}
                      <div style={{ width: '100%', height: '100%', display: product.images && product.images[0] ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={40} color="var(--clr-text-muted)" />
                      </div>
                      {product.discount > 0 && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {[...Array(5)].map((_, s) => <Star key={s} size={12} fill={s < 4 ? "var(--clr-star-active)" : "var(--clr-star-inactive)"} color={s < 4 ? "var(--clr-star-active)" : "var(--clr-star-inactive)"} />)}
                    </div>
                      <h3 style={{ fontSize: '1rem', color: 'var(--clr-text-on-light)', margin: '0 0 4px 0', fontWeight: 600 }}>{product.title}</h3>
                    <div style={{ marginBottom: '6px' }}><CategoryBadge category={product.category} /></div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={12} /> Certified quality
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--clr-border)', paddingTop: 12 }}>
                      <div>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', textDecoration: 'line-through', marginRight: 6 }}>₹{product.price}</span>
                        )}
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-accent-brand)' }}>₹{discountedPrice(product)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleLike(product); }}
                          style={{ background: isLiked(product) ? '#FEE2E2' : '#F1F5F9', border: 'none', color: isLiked(product) ? '#EF4444' : '#64748B', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Heart size={13} fill={isLiked(product) ? 'currentColor' : 'none'} />
                        </button>
                        <button type="button"
                          onClick={(e) => { e.stopPropagation(); dispatch(addToCart(product)); showToast('Item added to cart successfully!'); }}
                          style={{ background: 'var(--clr-accent-brand)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <ShoppingCart size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: '40px 0' }}>
              <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No products available at the moment.</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--clr-accent-brand)', color: '#fff', padding: '12px 32px', borderRadius: 12, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              {t('home.viewAll')} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ACCESSORIES SHOWCASE — MOVED TO POSITION 3 (ABOVE) ── */}

      {/* ── ABOUT / WHY CHOOSE US ── */}
      <section className="lp-section">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div className="reveal" style={{ position: 'relative' }}>
              <div style={{ overflow: 'hidden', borderRadius: 20 }}>
                <img src={placeholder('Professional Repair Service', 'linear-gradient(135deg, #0c3483, #a2b6df)')} alt="Repair" style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ position: 'absolute', bottom: -16, right: -16, background: 'var(--clr-accent-brand)', color: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 600, borderRadius: 12 }}>
                <Shield size={20} /> {t('home.val1')}
              </div>
            </div>
            <div className="reveal">
              <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--clr-accent-brand)', border: '1px solid rgba(79,70,229,0.2)', padding: '4px 14px', marginBottom: 12 }}>{t('home.whyChoose')}</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 20, color: 'var(--clr-text-on-light)' }}>{t('home.whyTitle')} <span style={{ color: 'var(--clr-accent-brand)' }}>{t('home.whyTitleAccent')}</span></h2>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--clr-text-muted)', marginBottom: 16 }}>{t('home.whyDesc1')}</p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--clr-text-muted)', marginBottom: 28 }}>{t('home.whyDesc2')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-on-light)' }}><Shield size={18} style={{ color: 'var(--clr-accent-brand)' }} /><span>{t('home.val1')}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-on-light)' }}><RotateCcw size={18} style={{ color: 'var(--clr-accent-brand)' }} /><span>{t('home.val2')}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-on-light)' }}><Truck size={18} style={{ color: 'var(--clr-accent-brand)' }} /><span>{t('home.val3')}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: 'var(--clr-text-on-light)' }}><Star size={18} style={{ color: 'var(--clr-accent-brand)' }} /><span>{t('home.val4')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ORDER TRACKING ── */}
      <section className="lp-section" style={{ background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: 'var(--clr-accent-brand)' }}>Track Order</span>
            <h2>Track Your Order</h2>
            <p>Enter your Order ID to check the current status of your purchase.</p>
          </div>
          <div className="reveal" style={{ maxWidth: 600, margin: '0 auto' }}>
            <form onSubmit={handleTrackOrder} style={{ display: 'flex', gap: 0, borderRadius: 16, overflow: 'hidden', border: '2px solid var(--clr-border)', background: 'var(--clr-card-bg)' }}>
              <input
                type="text"
                value={trackId}
                onChange={e => { setTrackId(e.target.value); }}
                placeholder="Enter Order ID (e.g. ORD-749123)"
                style={{ flex: 1, padding: '16px 20px', border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent' }}
              />
              <button type="submit" disabled={trackLoading}
                style={{ padding: '16px 28px', background: 'var(--clr-accent-brand)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                {trackLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Track
              </button>
            </form>

            {/* Track Result */}
            {trackError && (
              <div style={{ marginTop: 24, padding: 20, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} color="#EF4444" />
                <span style={{ fontSize: '0.85rem', color: '#B91C1C' }}>{trackError}</span>
              </div>
            )}

            {trackResult && (
              <div style={{ marginTop: 24, background: 'var(--clr-card-bg)', borderRadius: 16, border: '1px solid var(--clr-border)', overflow: 'hidden' }}>
                <div style={{ padding: 20, borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{trackResult.isRepair ? 'Repair ID' : 'Order ID'}</span>
                    <Link to={`/order/${trackResult.orderId}`} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-accent-brand)', fontFamily: 'monospace', margin: '4px 0 0', textDecoration: 'underline', textUnderlineOffset: 3 }}>{trackResult.orderId}</Link>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</span>
                    <p style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 20, display: 'inline-block', margin: '4px 0 0',
                      background: ['Delivered', 'Repair Completed'].includes(trackResult.orderStatus) ? '#DCFCE7' : trackResult.orderStatus === 'Shipped' ? '#DBEAFE' : ['Processing', 'Under Review', 'Awaiting Approval'].includes(trackResult.orderStatus) ? '#FEF3C7' : '#F1F5F9',
                      color: ['Delivered', 'Repair Completed'].includes(trackResult.orderStatus) ? '#16A34A' : trackResult.orderStatus === 'Shipped' ? '#2563EB' : ['Processing', 'Under Review', 'Awaiting Approval'].includes(trackResult.orderStatus) ? '#D97706' : '#64748B'
                    }}>
                      {trackResult.orderStatus || 'Processing'}
                    </p>
                  </div>
                </div>

                {trackResult.isRepair ? (
                  <div style={{ padding: 20 }}>
                    {/* Device Images */}
                    {trackResult.deviceImages?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
                        {trackResult.deviceImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Device ${idx + 1}`}
                            style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--clr-border)', flexShrink: 0 }}
                            onError={e => { e.target.style.display = 'none'; }} />
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                      <Clock size={14} color="var(--clr-text-muted)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Requested on {new Date(trackResult.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {trackResult.issueDescription && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                        <Wrench size={14} color="var(--clr-text-muted)" style={{ marginTop: 2 }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-on-light)' }}>{trackResult.issueDescription}</span>
                      </div>
                    )}
                    {trackResult.diagnosisDetails && (
                      <div style={{ padding: 12, background: '#F8FAFC', borderRadius: 8, marginBottom: 16, border: '1px solid var(--clr-border)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>Diagnosis</span>
                        <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-on-light)', margin: 0 }}>{trackResult.diagnosisDetails}</p>
                      </div>
                    )}
                    {(trackResult.estimatedCost || trackResult.finalCost) && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent-brand)' }}>
                          {trackResult.finalCost ? `Final: ₹${trackResult.finalCost}` : `Est: ₹${trackResult.estimatedCost}`}
                        </span>
                      </div>
                    )}
                    {trackResult.expectedDeliveryDate && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                        <Calendar size={14} color="var(--clr-text-muted)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Est. Delivery: {new Date(trackResult.expectedDeliveryDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                    {/* Repair Images */}
                    {trackResult.repairImages?.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16, marginTop: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'block' }}>Repair Photos</span>
                        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                          {trackResult.repairImages.map((img, idx) => (
                            <img key={idx} src={img} alt={`Repair ${idx + 1}`}
                              style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--clr-border)', flexShrink: 0 }}
                              onError={e => { e.target.style.display = 'none'; }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: 20 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                      <Clock size={14} color="var(--clr-text-muted)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Ordered on {new Date(trackResult.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                      <Package size={14} color="var(--clr-text-muted)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{trackResult.products?.length || 0} item(s)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--clr-accent-brand)' }}>Total: ₹{trackResult.totalAmount}</span>
                    </div>

                    {/* Products List */}
                    {trackResult.products && trackResult.products.length > 0 && (
                      <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16, marginTop: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, display: 'block' }}>Items</span>
                        {trackResult.products.map((p, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < trackResult.products.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--clr-text-on-light)' }}>{p.title || p.name || `Product ${i + 1}`} {p.quantity ? `x${p.quantity}` : ''}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--clr-text-on-light)' }}>₹{p.price || p.totalPrice || 0}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Status */}
                    <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Payment</span>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: trackResult.paymentStatus === 'Paid' ? '#DCFCE7' : '#FEF3C7',
                        color: trackResult.paymentStatus === 'Paid' ? '#16A34A' : '#D97706'
                      }}>
                        {trackResult.paymentStatus || 'Pending'}
                      </span>
                    </div>

                    {/* Shipping Address */}
                    {trackResult.shippingAddress && (
                      <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16, marginTop: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Shipping To</span>
                        <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-on-light)', margin: 0 }}>
                          {trackResult.shippingAddress.address}, {trackResult.shippingAddress.city}, {trackResult.shippingAddress.state} - {trackResult.shippingAddress.zip}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ── */}
      <section className="lp-section-alt">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: 'var(--clr-accent-brand)' }}>{t('home.categories')}</span>
            <h2>{t('home.shopByCategory')}</h2>
            <p>{t('home.shopByCategoryDesc')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {collections.map((col, i) => (
              <div key={i} className="reveal" style={{ background: 'var(--clr-white)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--clr-border)', cursor: 'pointer' }}>
                <Link to={col.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <img src={col.image} alt={col.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: 24 }}>
                      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: '1.5px solid var(--clr-accent-brand)', paddingBottom: 4 }}>
                        Explore <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--clr-text-on-light)', marginBottom: 4 }}>{col.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>{col.desc}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 0', background: 'var(--clr-accent-brand)' }}>
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>{t('home.reviews')}</span>
            <h2 style={{ color: '#fff' }}>{t('home.whatCustomersSay')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {testimonials.map((item, i) => (
              <div key={i} className="reveal" style={{ padding: 32, background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#FBBF24" color="#FBBF24" />)}
                </div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', marginBottom: 24, fontStyle: 'italic' }}>"{item.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FBBF24', color: 'var(--clr-accent-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: '#fff' }}>{item.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* ── NEWSLETTER ── */}
      <section style={{ padding: '100px 0', background: '#FFF', textAlign: 'center' }}>
        <div className="container">
          <div className="reveal" style={{ maxWidth: 520, margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--clr-text-on-light)', marginBottom: 12 }}>{t('home.stayUpdated')}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-muted)', marginBottom: 36, lineHeight: 1.6 }}>{t('home.stayUpdatedDesc')}</p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto' }}>
              <input type="email" placeholder={t('home.emailPlaceholder')} required style={{ flex: 1, padding: '16px 20px', border: '1px solid var(--clr-border)', borderRight: 'none', borderRadius: '12px 0 0 12px', outline: 'none', fontSize: '0.85rem', background: 'var(--clr-cream)' }} />
              <button type="submit" style={{ padding: '16px 28px', background: 'var(--clr-accent-brand)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', border: 'none', borderRadius: '0 12px 12px 0', cursor: 'pointer' }}>{t('home.subscribe')}</button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
