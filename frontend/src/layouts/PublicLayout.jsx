import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Heart, Menu, X, Globe, MapPin, Phone, Mail, ChevronDown, Smartphone, Wrench, Shield, Headphones, Gift, Bluetooth, RotateCcw, Sun, Moon, LogOut } from 'lucide-react';
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
  { label: 'Smartphones', desc: 'Latest iOS & Android devices', icon: Smartphone, path: '/smartphones', color: '#3b82f6', bgColor: '#eff6ff' },
  { label: 'Refurbished Phones', desc: 'Quality pre-owned phones', icon: RotateCcw, path: '/shop?condition=refurbished', color: '#10b981', bgColor: '#ecfdf5' },
  { label: 'Phone Repair', desc: 'Expert screen & battery fixes', icon: Wrench, path: '/dashboard/repairs/new', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { label: 'Tempered Glass', desc: '9H hardness screen guards', icon: Shield, path: '/shop?keyword=tempered', color: '#f59e0b', bgColor: '#fffbeb' },
  { label: 'Screen & Camera Protectors', desc: 'Camera lens & back guards', icon: Shield, path: '/shop?keyword=protector', color: '#ec4899', bgColor: '#fdf2f8' },
  { label: 'Bluetooth Devices', desc: 'Speakers, trackers & smart tech', icon: Bluetooth, path: '/shop?keyword=buds', color: '#ef4444', bgColor: '#fef2f2' },
  { label: 'Earphones & Audio', desc: 'Wireless buds & headphones', icon: Headphones, path: '/shop?keyword=buds', color: '#06b6d4', bgColor: '#ecfeff' },
  { label: 'Coupons & Deals', desc: 'Active promo codes & discounts', icon: Gift, path: '/coupons', color: '#f97316', bgColor: '#fff7ed' },
];

const PublicLayout = () => {
  const { t, lang, switchLang } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="lp-page">
      <header className={`lp-header${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="lp-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open Menu">
              <Menu size={22} />
            </button>
            <div className="lp-logo" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
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
          </div>
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
                <button type="button" onClick={() => { dispatch(logout()); dispatch(resetPageData()); navigate('/'); }} className="lp-icon-btn" title="Sign Out" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              !isLoginPage && <Link to="/login" className="lp-btn-signin">{t('nav.signIn')}</Link>
            )}
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="lp-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`lp-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="lp-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.png" alt="Logo" onError={e => { e.target.style.display = 'none'; }} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: '#fff' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.2 }}>SR Communication</span>
          </div>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close Menu">
            <X size={22} />
          </button>
        </div>

        <nav className="lp-sidebar-nav">
          <div ref={dropdownRef} className="lp-sidebar-dropdown">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="lp-sidebar-link"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: '0' }}
            >
              <span>All Products</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="lp-sidebar-subnav">
                {staticCategories.map((cat) => (
                  <Link key={cat.label} to={cat.path} onClick={() => { setDropdownOpen(false); setSidebarOpen(false); }} className="lp-sidebar-sub-link">
                    <cat.icon size={16} />
                    <span>{cat.label}</span>
                  </Link>
                ))}
                {categories.length > 0 && (
                  <>
                    <div style={{ height: '1px', background: 'var(--clr-border)', margin: '8px 0' }} />
                    <div style={{ padding: '4px 12px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-light)' }}>All Categories</div>
                    {categories.map((cat) => (
                      <Link key={cat._id} to={`/shop?category=${cat._id}`} onClick={() => { setDropdownOpen(false); setSidebarOpen(false); }} className="lp-sidebar-sub-link">
                        <span>{cat.categoryName}</span>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/smartphones" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.smartphones')}</Link>
          <Link to="/laptops" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.laptops')}</Link>
          <Link to="/accessories" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.accessories')}</Link>
          <Link to="/contact" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.contact')}</Link>
          <Link to="/about" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.about')}</Link>

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '12px 0' }} />

          <Link to="/wishlist" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>Wishlist</Link>
          <Link to="/coupons" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>Coupons & Deals</Link>
          {userInfo ? (
            <>
              <Link to={userInfo.role === 'admin' ? '/admin' : '/dashboard'} className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.dashboard')}</Link>
              <button onClick={() => { dispatch(logout()); dispatch(resetPageData()); navigate('/'); setSidebarOpen(false); }} className="lp-sidebar-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: '#ef4444' }}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            !isLoginPage && <Link to="/login" className="lp-sidebar-link" onClick={() => setSidebarOpen(false)}>{t('nav.signIn')}</Link>
          )}

          <div style={{ height: '1px', background: 'var(--clr-border)', margin: '12px 0' }} />

          <button
            onClick={() => { toggleTheme(); setSidebarOpen(false); }}
            className="lp-sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={() => { switchLang(lang === 'en' ? 'kn' : 'en'); }}
            className="lp-sidebar-link"
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>Language</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>
        </nav>

        <div className="lp-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: 'var(--clr-text-light)' }}>
            <MapPin size={14} /> Guttur Colony, Harihar
          </div>
        </div>
      </aside>

      <main className={`lp-main${sidebarOpen ? ' sidebar-active' : ''}`}>
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
            <p>&copy; {new Date().getFullYear()} Shree Renukamba Communication. {t('footer.rights')} &mdash; Developed with ❤️ by Gagan CB</p>
            <div className="lp-footer-links">
              <a href="https://gagancb.netlify.app/" target="_blank" rel="noopener noreferrer">login CV</a>
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
