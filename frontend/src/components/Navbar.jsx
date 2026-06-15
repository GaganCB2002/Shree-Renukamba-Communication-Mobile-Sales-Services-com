import { useState } from 'react';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Wrench } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from '../contexts/LanguageContext';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { t, lang, switchLang } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const wishlistItems = useSelector((state) => state.wishlist?.items || []);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Shree Renukamba Logo" className="h-10 w-10 object-cover rounded-full shadow-sm" onError={(e) => e.target.style.display='none'} />
              <div className="text-primary-900 font-bold text-xl tracking-tight leading-tight flex flex-col">
                <span>SHREE RENUKAMBA</span>
                <span className="text-xs text-secondary-500 font-medium">COMMUNICATION</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/smartphones" className="text-secondary-600 hover:text-primary-600 font-medium text-sm py-5 transition-colors border-b-2 border-transparent hover:border-primary-600">
              {t('nav.smartphones')}
            </Link>
            <Link to="/laptops" className="text-secondary-600 hover:text-primary-600 font-medium text-sm py-5 transition-colors border-b-2 border-transparent hover:border-primary-600">
              {t('nav.laptops')}
            </Link>
            <Link to="/accessories" className="text-secondary-600 hover:text-primary-600 font-medium text-sm py-5 transition-colors border-b-2 border-transparent hover:border-primary-600">
              {t('nav.accessories')}
            </Link>
            <Link to={userInfo ? "/dashboard/repairs/new" : "/login"} className="text-secondary-600 hover:text-primary-600 font-medium text-sm py-5 transition-colors">
              {t('nav.repairs')}
            </Link>
            <Link to="/about" className="text-secondary-600 hover:text-primary-600 font-medium text-sm py-5 transition-colors border-b-2 border-transparent hover:border-primary-600">
              {t('nav.about')}
            </Link>
            <Link to="/contact" className="text-secondary-600 hover:text-primary-600 font-medium text-sm py-5 transition-colors border-b-2 border-transparent hover:border-primary-600">
              {t('nav.contact')}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => switchLang(lang === 'en' ? 'kn' : 'en')}
              className="text-secondary-600 hover:text-primary-600 text-xs font-bold px-2 py-1 rounded-lg border border-border hover:border-primary-300 transition-all"
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
            </button>
            <Link to="/wishlist" className="relative text-secondary-600 hover:text-red-500 transition-colors">
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-secondary-600 hover:text-primary-600 transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {userInfo ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to={userInfo.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-50 rounded-xl text-sm font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
                >
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {userInfo.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden lg:inline">{userInfo.fullName}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-secondary-400 hover:text-red-500 transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block btn-primary text-sm px-5 py-2">
                {t('nav.signIn')}
              </Link>
            )}

            <button className="md:hidden p-2 text-secondary-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Link to="/smartphones" className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.smartphones')}</Link>
            <Link to="/laptops" className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.laptops')}</Link>
            <Link to="/accessories" className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.accessories')}</Link>
            <Link to="/wishlist" className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>Wishlist</Link>
            <Link to={userInfo ? "/dashboard/repairs/new" : "/login"} className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.repairs')}</Link>
            <Link to="/about" className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.about')}</Link>
            <Link to="/contact" className="block px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.contact')}</Link>
            <button
              onClick={() => { switchLang(lang === 'en' ? 'kn' : 'en'); setMobileOpen(false); }}
              className="block w-full text-left px-4 py-2 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50"
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>
            {userInfo ? (
              <>
                <Link to={userInfo.role === 'admin' ? '/admin' : '/dashboard'} className="block px-4 py-2 text-primary-600 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.dashboard')}</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block w-full text-left px-4 py-2 text-red-500 font-medium rounded-lg hover:bg-red-50">{t('nav.logout')}</button>
              </>
            ) : (
              <Link to="/login" className="block px-4 py-2 text-primary-600 font-medium rounded-lg hover:bg-secondary-50" onClick={() => setMobileOpen(false)}>{t('nav.signIn')}</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
