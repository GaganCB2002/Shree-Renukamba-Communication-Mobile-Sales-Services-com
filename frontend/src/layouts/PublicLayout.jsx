import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingBag, Heart, Menu, X, Globe, MapPin, Phone, Mail, ChevronDown, Smartphone, Wrench, Shield, Headphones, Gift, Bluetooth, RotateCcw, Sun, Moon, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getCategories } from '../api/productsApi';
import SearchSuggest from '../components/SearchSuggest';
import CookieConsent from '../components/CookieConsent';
import AiChatWidget from '../components/AiChatWidget';
import DeliveryReminder from '../components/DeliveryReminder';
import { logout } from '../redux/slices/authSlice';
import { resetPageData } from '../redux/slices/pageSlice';
import '../pages/LandingPage.css';

const staticCategories = [
  { 
    label: 'Smartphones', 
    desc: 'Latest iOS & Android devices', 
    icon: Smartphone, 
    path: '/smartphones', 
    color: '#3b82f6', 
    bgColor: '#eff6ff' 
  },
  { 
    label: 'Refurbished Phones', 
    desc: 'Quality pre-owned phones', 
    icon: RotateCcw, 
    path: '/shop?condition=refurbished', 
    color: '#10b981', 
    bgColor: '#ecfdf5' 
  },
  { 
    label: 'Phone Repair', 
    desc: 'Expert screen & battery fixes', 
    icon: Wrench, 
    path: '/dashboard/repairs/new', 
    color: '#8b5cf6', 
    bgColor: '#f5f3ff' 
  },
  { 
    label: 'Tempered Glass', 
    desc: '9H hardness screen guards', 
    icon: Shield, 
    path: '/shop?keyword=tempered', 
    color: '#f59e0b', 
    bgColor: '#fffbeb' 
  },
  { 
    label: 'Screen & Camera Protectors', 
    desc: 'Camera lens & back guards', 
    icon: Shield, 
    path: '/shop?keyword=protector', 
    color: '#ec4899', 
    bgColor: '#fdf2f8' 
  },
  { 
    label: 'Bluetooth Devices', 
    desc: 'Speakers, trackers & smart tech', 
    icon: Bluetooth, 
    path: '/shop?keyword=buds', 
    color: '#ef4444', 
    bgColor: '#fef2f2' 
  },
  { 
    label: 'Earphones & Audio', 
    desc: 'Wireless buds & headphones', 
    icon: Headphones, 
    path: '/shop?keyword=buds', 
    color: '#06b6d4', 
    bgColor: '#ecfeff' 
  },
  { 
    label: 'Coupons & Deals', 
    desc: 'Active promo codes & discounts', 
    icon: Gift, 
    path: '/coupons', 
    color: '#f97316', 
    bgColor: '#fff7ed' 
  },
];

const PublicLayout = () => {
  const { t, lang, switchLang } = useLanguage();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Safely get cart items count, handle case where cart state might be undefined or array might not exist
  const cartItems = useSelector((state) => state.cart?.cartItems || []);
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="lp-page">
      <header className={`lp-header${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-header-inner">
          <div className="lp-logo" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginRight: 'auto' }}>
            <img 
              src="/logo.png" 
              alt="Shree Renukamba Logo" 
              onClick={() => setLogoModalOpen(true)}
              onError={e => { e.target.style.display = 'none'; }}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginRight: 10, background: '#fff', cursor: 'pointer' }} 
            />
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
              <span className="lp-logo-text" style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 1, margin: 0, lineHeight: 1.2, letterSpacing: '0.02em' }}>SR Communication</span>
              <div style={{ fontSize: '0.55rem', color: 'inherit', opacity: 0.65, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 1 }}>Mobiles &amp; Electronics</div>
            </Link>
          </div>
          <nav className="lp-nav" style={{ flex: '1 1 auto', justifyContent: 'center', margin: '0 20px' }}>
            <div 
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              style={{ display: 'inline-block' }}
            >
              <Link 
                to="/shop" 
                className="flex items-center gap-1 nav-link"
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                All Products <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </Link>
              {dropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 shadow-xl z-50 p-4 min-w-[560px] lp-dropdown"
                  style={{
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
                    borderRadius: '20px',
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'contents' }}>
                    {staticCategories.map((cat) => (
                      <Link
                        key={cat.label}
                        to={cat.path}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                        style={{ textDecoration: 'none' }}
                      >
                        <div 
                          className="flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                          style={{ 
                            width: 44, 
                            height: 44, 
                            backgroundColor: cat.bgColor, 
                            color: cat.color, 
                            flexShrink: 0 
                          }}
                        >
                          <cat.icon size={22} strokeWidth={2} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--clr-text-on-light)' }}>{cat.label}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>{cat.desc}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {categories.length > 0 && (
                    <>
                      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0' }}></div>
                      <div style={{ padding: '2px 0' }}>
                        <div style={{ padding: '4px 16px 6px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }} className="lp-dropdown-cat-header">All Categories</div>
                        {categories.map((cat) => (
                          <Link
                            key={cat._id}
                            to={`/shop?category=${cat._id}`}
                            onClick={() => setDropdownOpen(false)}
                            className="block px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors lp-dropdown-cat-item"
                            style={{ textDecoration: 'none', display: 'block', paddingLeft: 16 }}
                          >
                            {cat.categoryName}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <Link to="/smartphones">{t('nav.smartphones')}</Link>
            <Link to="/laptops">{t('nav.laptops')}</Link>
            <Link to="/accessories">{t('nav.accessories')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
          </nav>
          <div className="lp-header-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="lp-icon-btn"
              aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <SearchSuggest headerScrolled={scrolled} />
            <button
              type="button"
              onClick={() => switchLang(lang === 'en' ? 'kn' : 'en')}
              className="lp-icon-btn"
              style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', minWidth: 32 }}
              aria-label="Switch Language"
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
            </button>
            <Link to="/wishlist" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }} className="lp-icon-btn" aria-label="Wishlist">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#fff',
                  fontSize: '0.55rem', fontWeight: 700, width: '15px', height: '15px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{wishlistCount}</span>
              )}
            </Link>
            <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }} className="lp-icon-btn" aria-label="Cart">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: '-2px', right: '-2px', background: '#C47A6A', color: '#fff',
                  fontSize: '0.55rem', fontWeight: 700, width: '15px', height: '15px',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{totalItems}</span>
              )}
            </Link>
            {userInfo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link
                  to={userInfo.role === 'admin' ? '/admin' : '/dashboard'}
                  className="lp-icon-btn"
                  title="My Dashboard"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', position: 'relative' }}
                >
                  {userInfo.profileImage ? (
                    <img
                      src={userInfo.profileImage}
                      alt={userInfo.fullName || 'User'}
                      onError={e => { e.target.style.display = 'none'; }}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid currentColor' }}
                    />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--clr-primary, #4f46e5)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, lineHeight: 1
                    }}>
                      {(userInfo.fullName || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </Link>
                <button type="button" onClick={() => { dispatch(logout()); dispatch(resetPageData()); }} className="lp-icon-btn" title="Sign Out" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              !isLoginPage && <Link to="/login" className="lp-btn-signin">{t('nav.signIn')}</Link>
            )}
            <button className="lp-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Menu"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="lp-mobile-menu">
          <div className="lp-mobile-header">
            <img src="/logo.png" alt="Logo" onClick={() => setLogoModalOpen(true)} onError={e => { e.target.style.display = 'none'; }} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#fff', cursor: 'pointer' }} />
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close"><X size={24} /></button>
          </div>
          <nav className="lp-mobile-nav">
            <Link to="/shop" onClick={() => setMenuOpen(false)} style={{ fontWeight: 700 }}>All Products</Link>
            {staticCategories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setMenuOpen(false)}
                style={{ paddingLeft: '20px', fontSize: '1rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                — {cat.label}
              </Link>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
            {categories.map((cat) => (
              <Link 
                key={cat._id} 
                to={`/shop?category=${cat._id}`} 
                onClick={() => setMenuOpen(false)}
                style={{ paddingLeft: '20px', fontSize: '1rem', opacity: 0.7 }}
              >
                — {cat.categoryName}
              </Link>
            ))}
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '10px 0' }}></div>
            <Link to="/smartphones" onClick={() => setMenuOpen(false)}>{t('nav.smartphones')}</Link>
            <Link to="/laptops" onClick={() => setMenuOpen(false)}>{t('nav.laptops')}</Link>
            <Link to="/accessories" onClick={() => setMenuOpen(false)}>{t('nav.accessories')}</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>{t('nav.contact')}</Link>
            <button
              type="button"
              onClick={() => { toggleTheme(); setMenuOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: 0, fontFamily: 'inherit' }}
            >
              {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
            <button
              type="button"
              onClick={() => { switchLang(lang === 'en' ? 'kn' : 'en'); setMenuOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: 0, fontFamily: 'inherit' }}
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>
          </nav>
          <div className="lp-mobile-actions">
            {userInfo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <Link to={userInfo.role === 'admin' ? '/admin' : '/dashboard'} className="lp-btn-primary" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setMenuOpen(false)}>
                  {userInfo.profileImage ? (
                    <img src={userInfo.profileImage} alt="" onError={e => { e.target.style.display = 'none'; }} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700 }}>
                      {(userInfo.fullName || 'U')[0].toUpperCase()}
                    </span>
                  )}
                  {userInfo.fullName || 'Dashboard'}
                </Link>
                <button type="button" onClick={() => { dispatch(logout()); dispatch(resetPageData()); setMenuOpen(false); }} className="lp-btn-outline lp-btn-light" style={{ width: '100%' }}>
                  Sign Out
                </button>
              </div>
            ) : (
              !isLoginPage && <Link to="/login" className="lp-btn-primary" onClick={() => setMenuOpen(false)}>{t('nav.signIn')}</Link>
            )}
          </div>
        </div>
      )}

      <main className="lp-main">
        <Outlet />
      </main>

      <footer className="lp-footer" id="contact">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <div className="lp-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img src="/logo.png" alt="Logo" onClick={() => setLogoModalOpen(true)} onError={e => { e.target.style.display = 'none'; }} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#fff', cursor: 'pointer' }} />
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                  <span className="lp-logo-text" style={{ fontSize: '0.8rem', opacity: 1, color: 'var(--clr-footer-heading)', margin: 0, lineHeight: 1.2 }}>SR Communication</span>
                  <div style={{ fontSize: '0.55rem', color: 'var(--clr-footer-text)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mobile &amp; Electronics</div>
                </Link>
              </div>
              <p>{t('footer.brandDesc')}</p>
              <div className="lp-social">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Globe size={18} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Globe size={18} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Globe size={18} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Globe size={18} /></a>
              </div>
            </div>
            <div className="lp-footer-col">
              <h4>{t('footer.shop')}</h4>
              <ul>
                <li><Link to="/smartphones">{t('nav.smartphones')}</Link></li>
                <li><Link to="/laptops">{t('nav.laptops')}</Link></li>
                <li><Link to="/shop?category=tablets">{t('footer.tablets')}</Link></li>
                <li><Link to="/accessories">{t('nav.accessories')}</Link></li>
                <li><Link to="/shop">{t('footer.allProducts')}</Link></li>
              </ul>
            </div>
            <div className="lp-footer-col">
                <h4>{t('footer.support')}</h4>
              <ul>
                <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
                <li><Link to="/dashboard/repairs/new">{t('footer.bookRepair')}</Link></li>
                <li><a href="#shipping">{t('footer.shipping')}</a></li>
                <li><a href="#returns">{t('footer.returns')}</a></li>
                <li><a href="#faq">{t('footer.faqs')}</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h4>{t('footer.contactUs')}</h4>
              <ul className="lp-contact-list">
                <li>
                  <button type="button"
                    onClick={() => window.open('https://www.google.com/maps?q=Shree+Renukamba+Communication+Guttur+Colony+Harihar', '_blank')}
                    style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', fontFamily: 'inherit', fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer' }}
                    title="Open in Google Maps"
                  >
                    <MapPin size={14} /> Guttur Colony, Harihar
                  </button>
                </li>
                <li><Phone size={14} /><span>+91 98765 43210</span></li>
                <li><Mail size={14} /><span>info@shreerenukamba.com</span></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Shree Renukamba Communication. {t('footer.rights')}</p>
            <div className="lp-footer-links">
              <Link to="/privacy">{t('footer.privacy')}</Link>
              <Link to="/terms">{t('footer.terms')}</Link>
              <Link to="/privacy">{t('footer.cookies')}</Link>
            </div>
          </div>
        </div>
      </footer>

      {logoModalOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} 
          onClick={() => setLogoModalOpen(false)}
        >
          <div 
            style={{ background: 'var(--clr-card-bg)', borderRadius: '3rem', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
               style={{ position: 'absolute', top: 20, right: 20, background: 'var(--clr-icon-bg)', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} 
              onClick={() => setLogoModalOpen(false)}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--clr-border)'; e.currentTarget.style.color = 'var(--clr-text-on-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--clr-icon-bg)'; e.currentTarget.style.color = 'var(--clr-text-muted)'; }}
            >
              <X size={20} />
            </button>
            <img src="/logo.png" alt="Shree Renukamba" onError={e => { e.target.style.display = 'none'; }} style={{ width: 220, height: 220, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.2), 0 8px 10px -6px rgba(79, 70, 229, 0.1)', border: '4px solid #fff', marginBottom: '24px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-text-on-light)', margin: '0 0 8px 0', textAlign: 'center' }}>Shree Renukamba</h3>
            <p style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px 0', textAlign: 'center' }}>Communication</p>
            <div style={{ background: 'var(--clr-accent-brand)', color: '#fff', padding: '12px 20px', borderRadius: '1rem', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center', width: '100%', opacity: 0.9 }}>
              All types of mobile accessories available
            </div>
          </div>
        </div>
      )}
      <AiChatWidget />
      <DeliveryReminder />
      <CookieConsent />
    </div>
  );
};

export default PublicLayout;
