import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Loader2, UserCog, User, Smartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { login, clearError } from '../redux/slices/authSlice';

const testAccounts = [
  {
    label: 'Admin',
    email: 'admin@electrofix.com',
    password: 'admin123',
    role: 'admin',
    icon: UserCog,
  },
  {
    label: 'Customer',
    email: 'john@example.com',
    password: 'customer123',
    role: 'customer',
    icon: User,
  },
];

const Login = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fillTestAccount = (acc) => {
    setFormData({ email: acc.email, password: acc.password });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      dispatch(login(formData));
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-gray-900 to-slate-900">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1920"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-gray-900/80 to-slate-900/85"></div>
      </div>

      {/* Decorative orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

      {/* Form card */}
      <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-glass border border-white/40 w-full max-w-md z-10 relative mx-auto">
        {/* Logo & Brand */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-1 mb-2">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 object-cover rounded-full mb-2 shadow-sm" onError={(e) => e.target.style.display='none'} />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">SHREE RENUKAMBA</span>
            <span className="text-xs sm:text-sm font-medium text-gray-500 tracking-widest uppercase">Communication</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">{t('login.welcome')}</p>
        </div>

        {/* Login / Register Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <div className="flex-1 bg-white text-indigo-600 font-bold text-sm py-2.5 rounded-lg shadow-sm text-center transition-all">
            {t('login.login')}
          </div>
          <Link
            to="/register"
            className="flex-1 text-gray-500 font-medium text-sm py-2.5 rounded-lg text-center hover:text-gray-800 transition-colors"
          >
            {t('login.register')}
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
            {error}
          </div>
        )}

        {/* Test Accounts */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 font-medium text-center mb-3">
            {t('login.testAccounts')}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {testAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => fillTestAccount(acc)}
                  className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-sm transition-all text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      acc.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                        : 'bg-teal-100 text-teal-600 group-hover:bg-teal-200'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-gray-800">
                      {t(`login.${acc.label.toLowerCase()}`)}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate leading-tight">
                      {acc.email}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              {t('login.email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                placeholder={t('login.email')}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-gray-800">
                {t('login.password')}
              </label>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                {t('login.forgotPassword')}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Lock size={16} />
            )}
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs font-medium text-gray-400 shrink-0">
            {t('login.orContinue')}
          </span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Social Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
              />
            </svg>
            Apple
          </button>
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-400 font-medium leading-relaxed">
          {t('login.terms')}{' '}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="text-indigo-600 hover:text-indigo-700 hover:underline bg-transparent border-none p-0 cursor-pointer font-medium"
          >
            {t('login.termsOfService')}
          </button>{' '}
          {t('login.and')}{' '}
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            className="text-indigo-600 hover:text-indigo-700 hover:underline bg-transparent border-none p-0 cursor-pointer font-medium"
          >
            {t('login.privacyPolicy')}
          </button>
          .
        </p>
      </div>
    </div>
  );
};

export default Login;
