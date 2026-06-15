import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrench, Loader2, Eye, EyeOff } from 'lucide-react';
import { register, clearError } from '../redux/slices/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (userInfo) {
      navigate(userInfo.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setLocalError('');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    const { confirmPassword, ...registerData } = formData;
    dispatch(register(registerData));
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200 opacity-40 blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200 opacity-40 blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-glass border border-white/50 w-full max-w-md backdrop-blur-sm z-10 relative">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-1 mb-3 text-primary-900">
            <img src="/logo.png" alt="Logo" className="h-16 w-16 object-cover rounded-full mb-2 shadow-sm" onError={(e) => e.target.style.display='none'} />
            <span className="text-2xl font-bold tracking-tight">SHREE RENUKAMBA</span>
            <span className="text-sm font-medium text-secondary-500">COMMUNICATION</span>
          </div>
          <p className="text-secondary-600 text-sm">Create your account to get started.</p>
        </div>

        <div className="flex bg-secondary-50 p-1 rounded-xl mb-8">
          <Link to="/login" className="flex-1 text-secondary-500 font-medium text-sm py-2 rounded-lg text-center hover:text-secondary-900 transition-colors">Login</Link>
          <Link to="/register" className="flex-1 bg-white text-primary-600 font-bold text-sm py-2 rounded-lg shadow-sm text-center">Register</Link>
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
            {displayError}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-secondary-900 mb-1.5">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm font-medium text-secondary-900 placeholder:text-secondary-400"
              placeholder="John Doe" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary-900 mb-1.5">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm font-medium text-secondary-900 placeholder:text-secondary-400"
              placeholder="john@example.com" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary-900 mb-1.5">Phone Number</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm font-medium text-secondary-900 placeholder:text-secondary-400"
              placeholder="+1 234 567 8900" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary-900 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 pr-10 py-3 bg-secondary-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm font-medium text-secondary-900 placeholder:text-secondary-400"
                placeholder="Create a strong password" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary-400 hover:text-secondary-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-secondary-900 mb-1.5">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              className="w-full px-4 py-3 bg-secondary-50 border border-transparent rounded-xl focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 transition-all outline-none text-sm font-medium text-secondary-900 placeholder:text-secondary-400"
              placeholder="Confirm your password" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary-500 font-medium">
          Already have an account? <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
