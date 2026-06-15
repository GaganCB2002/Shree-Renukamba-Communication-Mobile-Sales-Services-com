import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Shield, Truck, RotateCcw, Package, ShoppingCart, Sparkles, Clock, Wrench, Smartphone, Battery, Droplets, Cpu } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import { getProducts } from '../api/productsApi';
import { addToCart } from '../redux/slices/cartSlice';

const heroImages = [
  'https://images.unsplash.com/photo-1550009158-9efff6c0e561?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1200',
];

const collections = [
  { title: 'Premium Smartphones', desc: 'Certified pre-owned iPhones and Androids', image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800', link: '/smartphones' },
  { title: 'Laptops & MacBooks', desc: 'High-performance machines for work and play', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800', link: '/laptops' },
  { title: 'Accessories & Audio', desc: 'Headphones, chargers, and essential gear', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', link: '/accessories' },
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

export default function LandingPage() {
  const { t } = useLanguage();
  const [slideIndex, setSlideIndex] = useState(0);
  const observerRef = useRef(null);
  
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bestSellers = products.slice(0, 4);
  const newStocks = products.filter(p => p.stock > 5).slice(0, 4);
  const discountedPrice = (p) => p.discount > 0 ? (p.price * (1 - p.discount / 100)).toFixed(2) : p.price;

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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

    const els = document.querySelectorAll('.reveal');
    els.forEach(el => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [loading]);

  useEffect(() => {
    document.title = 'SR Communication - Mobile Sales & Services';
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
          <div className="lp-hero-badge reveal">{t('home.heroBadge')}</div>
          <h1 className="lp-hero-title reveal">
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
              <button
                key={i}
                className={`lp-hero-dot${i === slideIndex ? ' active' : ''}`}
                onClick={() => setSlideIndex(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW STOCKS ── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: '#4F46E5' }}>{t('home.newStocks')}</span>
            <h2>{t('home.newStocks')}</h2>
            <p>{t('home.newStocksDesc')}</p>
          </div>
          {newStocks.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {newStocks.map((product, i) => (
                <div key={product._id} className="reveal" style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <Link to={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ height: 200, background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={40} color="#94A3B8" />
                        </div>
                      )}
                      <span style={{ position: 'absolute', top: 10, right: 10, background: '#4F46E5', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Sparkles size={11} /> {t('home.justAdded')}
                      </span>
                      {product.discount > 0 && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  </Link>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                      {[...Array(5)].map((_, s) => <Star key={s} size={12} fill={s < 4 ? "#4F46E5" : "#E2E8F0"} color={s < 4 ? "#4F46E5" : "#E2E8F0"} />)}
                    </div>
                    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '0.95rem', color: '#0F172A', margin: '0 0 8px 0', fontWeight: 600 }}>{product.title}</h3>
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 8 }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: 4 }} /> {product.stock} units available
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                      <div>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through', marginRight: 6 }}>₹{product.price}</span>
                        )}
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4F46E5' }}>₹{discountedPrice(product)}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); dispatch(addToCart(product)); }}
                        style={{ background: '#4F46E5', border: 'none', color: '#fff', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>
              <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>New arrivals coming soon. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── REPAIR SERVICES ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(234,88,12,0.3)', color: '#EA580C' }}>Repair Services</span>
            <h2>Professional Phone &amp; Laptop Repairs</h2>
            <p>Fast, reliable, and affordable repair services by certified technicians with genuine parts.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: 48 }}>
            {repairServices.map((svc, i) => (
              <div key={i} className="reveal" style={{ padding: '32px', borderRadius: 20, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svc.icon size={28} style={{ color: '#4F46E5' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{svc.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.7, marginBottom: 20 }}>{svc.desc}</p>
                <Link to="/dashboard/repairs/new" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4F46E5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Book Now <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: '#4F46E5' }}>{t('home.featured')}</span>
            <h2>{t('home.bestSellers')}</h2>
            <p>{t('home.bestSellersDesc')}</p>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ height: 350, background: '#fff', borderRadius: 16, opacity: 0.5, border: '1px solid #E2E8F0' }} />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {bestSellers.map((product, i) => (
                <div key={product._id} className="reveal" style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <Link to={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ height: 220, background: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package size={40} color="#94A3B8" />
                        </div>
                      )}
                      {product.discount > 0 && (
                        <span style={{ position: 'absolute', top: 10, left: 10, background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          -{product.discount}%
                        </span>
                      )}
                    </div>
                  </Link>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                      {[...Array(5)].map((_, s) => <Star key={s} size={12} fill={s < 4 ? "#4F46E5" : "#E2E8F0"} color={s < 4 ? "#4F46E5" : "#E2E8F0"} />)}
                    </div>
                    <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', color: '#0F172A', margin: '0 0 4px 0', fontWeight: 600 }}>{product.title}</h3>
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={12} /> Certified quality
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                      <div>
                        {product.discount > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', textDecoration: 'line-through', marginRight: 6 }}>₹{product.price}</span>
                        )}
                        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4F46E5' }}>₹{discountedPrice(product)}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.preventDefault(); dispatch(addToCart(product)); }}
                        style={{ background: '#4F46E5', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <ShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94A3B8', padding: '40px 0' }}>
              <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No products available at the moment.</p>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#4F46E5', color: '#fff', padding: '12px 32px', borderRadius: 12, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>
              {t('home.viewAll')} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT / WHY CHOOSE US ── */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div className="reveal" style={{ position: 'relative' }}>
              <div style={{ overflow: 'hidden', borderRadius: 20 }}>
                <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800" alt="Repair" style={{ width: '100%', height: 480, objectFit: 'cover', display: 'block' }} />
              </div>
              <div style={{ position: 'absolute', bottom: -16, right: -16, background: '#4F46E5', color: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 600, borderRadius: 12 }}>
                <Shield size={20} /> {t('home.val1')}
              </div>
            </div>
            <div className="reveal">
              <span style={{ display: 'inline-block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4F46E5', border: '1px solid rgba(79,70,229,0.2)', padding: '4px 14px', marginBottom: 12 }}>{t('home.whyChoose')}</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: 20, color: '#0F172A' }}>{t('home.whyTitle')} <span style={{ color: '#4F46E5' }}>{t('home.whyTitleAccent')}</span></h2>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#64748B', marginBottom: 16 }}>{t('home.whyDesc1')}</p>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#64748B', marginBottom: 28 }}>{t('home.whyDesc2')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: '#0F172A' }}><Shield size={18} style={{ color: '#4F46E5' }} /><span>{t('home.val1')}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: '#0F172A' }}><RotateCcw size={18} style={{ color: '#4F46E5' }} /><span>{t('home.val2')}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: '#0F172A' }}><Truck size={18} style={{ color: '#4F46E5' }} /><span>{t('home.val3')}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', fontWeight: 500, color: '#0F172A' }}><Star size={18} style={{ color: '#4F46E5' }} /><span>{t('home.val4')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ── */}
      <section style={{ padding: '80px 0', background: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-section-head reveal">
            <span className="lp-section-tag" style={{ borderColor: 'rgba(79,70,229,0.3)', color: '#4F46E5' }}>{t('home.categories')}</span>
            <h2>{t('home.shopByCategory')}</h2>
            <p>{t('home.shopByCategoryDesc')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {collections.map((col, i) => (
              <div key={i} className="reveal" style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                <Link to={col.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/5' }}>
                    <img src={col.image} alt={col.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: 24 }}>
                      <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6, borderBottom: '1.5px solid #4F46E5', paddingBottom: 4 }}>
                        Explore <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{col.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5 }}>{col.desc}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 0', background: '#4F46E5' }}>
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
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#FBBF24', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
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
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>{t('home.stayUpdated')}</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: 36, lineHeight: 1.6 }}>{t('home.stayUpdatedDesc')}</p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto' }}>
              <input type="email" placeholder={t('home.emailPlaceholder')} required style={{ flex: 1, padding: '16px 20px', border: '1px solid #E2E8F0', borderRight: 'none', borderRadius: '12px 0 0 12px', outline: 'none', fontSize: '0.85rem', background: '#F8FAFC' }} />
              <button type="submit" style={{ padding: '16px 28px', background: '#4F46E5', color: '#fff', fontWeight: 600, fontSize: '0.8rem', border: 'none', borderRadius: '0 12px 12px 0', cursor: 'pointer' }}>{t('home.subscribe')}</button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
