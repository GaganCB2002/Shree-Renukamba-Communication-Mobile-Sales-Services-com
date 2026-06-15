import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, ShoppingBag, Menu, X, Globe, MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import '../pages/LandingPage.css';

const PublicLayout = () => {
  const { t, lang, switchLang } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  
  // Safely get cart items count, handle case where cart state might be undefined or array might not exist
  const cartItems = useSelector((state) => state.cart?.items || []);
  const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="lp-page">
      <header className={`lp-header${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-header-inner">
          <div className="lp-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Shree Renukamba Logo" 
              onClick={() => setLogoModalOpen(true)}
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginRight: 10, background: '#fff', cursor: 'pointer' }} 
            />
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
              <span className="lp-logo-text" style={{ fontSize: '0.72rem', opacity: 1, margin: 0, lineHeight: 1.2 }}>SR Communication</span>
              <div style={{ fontSize: '0.5rem', color: 'inherit', opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mobile &amp; Electronics</div>
            </Link>
          </div>
          <nav className="lp-nav">
            <Link to="/smartphones">{t('nav.smartphones')}</Link>
            <Link to="/laptops">{t('nav.laptops')}</Link>
            <Link to="/accessories">{t('nav.accessories')}</Link>
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
          </nav>
          <div className="lp-header-actions">
            <button
              onClick={() => switchLang(lang === 'en' ? 'kn' : 'en')}
              className="lp-icon-btn"
              style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', minWidth: 32 }}
              aria-label="Switch Language"
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
            </button>
            <Link to="/shop" className="lp-icon-btn" aria-label="Search"><Search size={18} /></Link>
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
            <Link to="/login" className="lp-btn-outline lp-btn-sm">{t('nav.signIn')}</Link>
            <button className="lp-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Menu"><Menu size={24} /></button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="lp-mobile-menu">
          <div className="lp-mobile-header">
            <img src="/logo.png" alt="Logo" onClick={() => setLogoModalOpen(true)} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#fff', cursor: 'pointer' }} />
            <button onClick={() => setMenuOpen(false)} aria-label="Close"><X size={24} /></button>
          </div>
          <nav className="lp-mobile-nav">
            <Link to="/smartphones" onClick={() => setMenuOpen(false)}>{t('nav.smartphones')}</Link>
            <Link to="/laptops" onClick={() => setMenuOpen(false)}>{t('nav.laptops')}</Link>
            <Link to="/accessories" onClick={() => setMenuOpen(false)}>{t('nav.accessories')}</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>{t('nav.about')}</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)}>{t('nav.contact')}</Link>
            <button
              onClick={() => { switchLang(lang === 'en' ? 'kn' : 'en'); setMenuOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: 0, fontFamily: 'inherit' }}
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>
          </nav>
          <div className="lp-mobile-actions">
            <Link to="/login" className="lp-btn-primary" onClick={() => setMenuOpen(false)}>{t('nav.signIn')}</Link>
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>

      <footer className="lp-footer" id="contact">
        <div className="container" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <div className="lp-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <img src="/logo.png" alt="Logo" onClick={() => setLogoModalOpen(true)} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#fff', cursor: 'pointer' }} />
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                  <span className="lp-logo-text" style={{ fontSize: '0.8rem', opacity: 1, color: '#fff', margin: 0, lineHeight: 1.2 }}>SR Communication</span>
                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mobile &amp; Electronics</div>
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
                  <button
                    style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit', fontFamily: 'inherit', fontSize: '0.82rem', textAlign: 'left' }}
                  >
                    <MapPin size={14} /> 123 MG Road, Bengaluru
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
              <a href="#privacy">{t('footer.privacy')}</a>
              <a href="#terms">{t('footer.terms')}</a>
              <a href="#cookies">{t('footer.cookies')}</a>
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
            style={{ background: 'linear-gradient(145deg, #ffffff, #f0f4f8)', borderRadius: '3rem', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              style={{ position: 'absolute', top: 20, right: 20, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} 
              onClick={() => setLogoModalOpen(false)}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
            >
              <X size={20} />
            </button>
            <img src="/logo.png" alt="Shree Renukamba" style={{ width: 220, height: 220, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.2), 0 8px 10px -6px rgba(79, 70, 229, 0.1)', border: '4px solid #fff', marginBottom: '24px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', textAlign: 'center' }}>Shree Renukamba</h3>
            <p style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px 0', textAlign: 'center' }}>Communication</p>
            <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '12px 20px', borderRadius: '1rem', fontSize: '0.95rem', fontWeight: 600, textAlign: 'center', width: '100%' }}>
              All types of mobile accessories available
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLayout;
