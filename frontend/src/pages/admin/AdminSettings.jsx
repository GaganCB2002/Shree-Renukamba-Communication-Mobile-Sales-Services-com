import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User as UserIcon, MapPin, History, Shield, Save, 
  CheckCircle, Clock,
  Timer
} from 'lucide-react';
import { updateUserProfileApi, changePasswordApi } from '../../api/authApi';
import { getSettings, updateSetting } from '../../api/settingsApi';
import { setCredentials } from '../../redux/slices/authSlice';

const AdminSettings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  // Tabs: 'personal', 'addresses', 'repairs', 'security', 'cancellation'
  const [activeTab, setActiveTab] = useState('personal');

  // Cancellation settings state
  const [cancelRepairHours, setCancelRepairHours] = useState('24');
  const [cancelOrderHours, setCancelOrderHours] = useState('24');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      if (data.cancel_repair_hours) setCancelRepairHours(data.cancel_repair_hours);
      if (data.cancel_order_hours) setCancelOrderHours(data.cancel_order_hours);
    } catch (e) {
      console.error('Failed to load settings');
    }
  };

  useEffect(() => {
    if (userInfo?.role === 'admin') {
      loadSettings();
    }
    }, [userInfo?.role]);

  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      setSettingsMessage('');
      await updateSetting('cancel_repair_hours', cancelRepairHours);
      await updateSetting('cancel_order_hours', cancelOrderHours);
      setSettingsMessage('Cancellation settings saved successfully!');
    } catch (err) {
      setSettingsMessage(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  // Personal Info Form State
  const fullNameParts = userInfo?.fullName?.split(' ') || ['', ''];
  const [personalInfo, setPersonalInfo] = useState({
    firstName: fullNameParts[0] || '',
    lastName: fullNameParts.slice(1).join(' ') || '',
    email: userInfo?.email || '',
    phone: userInfo?.phoneNumber || '',
  });

  // Address State
  const [addressState, setAddressState] = useState({
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    zipCode: userInfo?.address?.zipCode || '',
    country: userInfo?.address?.country || 'India',
  });

  // Password State
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Recent Repairs (simulated / fallback)
  const recentRepairs = [
    {
      id: 'REP-2023-8942',
      device: 'iPhone 13 Pro Max Screen Replacement',
      date: 'Oct 12, 2023',
      status: 'Completed',
    },
    {
      id: 'REP-2024-1024',
      device: 'MacBook Pro Battery Service',
      date: 'Nov 05, 2024',
      status: 'In Progress',
    }
  ];

  const handlePersonalChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressState({ ...addressState, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordState({ ...passwordState, [e.target.name]: e.target.value });
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserProfileApi({
        fullName: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
        email: personalInfo.email,
        phoneNumber: personalInfo.phone,
      });
      dispatch(setCredentials(updatedUser));
      alert('Personal details saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save personal details');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserProfileApi({
        address: addressState
      });
      dispatch(setCredentials(updatedUser));
      alert('Address saved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      await changePasswordApi({
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword
      });
      alert('Password updated successfully!');
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-700 dark:text-slate-200">
      {/* Profile Header Block */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 shrink-0 flex items-center justify-center">
          <img 
            src={userInfo?.profileImage || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop"} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop';
            }}
          />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {userInfo?.fullName || 'Guest User'}
          </h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold">
            <span className="bg-indigo-50 dark:bg-indigo-900/55 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 px-2.5 py-0.5 rounded-full uppercase text-[10px]">
              {userInfo?.role || 'customer'}
            </span>
            <span className="text-slate-400 font-medium">Shree Renukamba Member</span>
          </div>
        </div>
      </div>

      {/* Main Settings Tabs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side Tab Selector */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'personal'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <UserIcon size={16} />
            <span>Personal Info</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'addresses'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <MapPin size={16} />
            <span>Address Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('repairs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'repairs'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <History size={16} />
            <span>Repair History</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'security'
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Shield size={16} />
            <span>Security</span>
          </button>

          {userInfo?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('cancellation')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeTab === 'cancellation'
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Timer size={16} />
              <span>Cancellation Policy</span>
            </button>
          )}
        </div>

        {/* Right Side Panel Content */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
          
          {/* PERSONAL INFO TAB */}
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                <p className="text-xs text-slate-400">Update your primary contact and profile details.</p>
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={personalInfo.firstName} 
                      onChange={handlePersonalChange}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={personalInfo.lastName} 
                      onChange={handlePersonalChange}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={personalInfo.email} 
                    onChange={handlePersonalChange}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={personalInfo.phone} 
                    onChange={handlePersonalChange}
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-100 dark:shadow-none transition-colors"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Address Details</h3>
                <p className="text-xs text-slate-400">Configure your primary service billing and shipping address details.</p>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
                  <input 
                    type="text" 
                    name="street" 
                    value={addressState.street} 
                    onChange={handleAddressChange}
                    placeholder="e.g. 123 Main Street"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={addressState.city} 
                      onChange={handleAddressChange}
                      placeholder="e.g. Bengaluru"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">State</label>
                    <input 
                      type="text" 
                      name="state" 
                      value={addressState.state} 
                      onChange={handleAddressChange}
                      placeholder="e.g. Karnataka"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Zip / Postal Code</label>
                    <input 
                      type="text" 
                      name="zipCode" 
                      value={addressState.zipCode} 
                      onChange={handleAddressChange}
                      placeholder="e.g. 560001"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Country</label>
                    <input 
                      type="text" 
                      name="country" 
                      value={addressState.country} 
                      onChange={handleAddressChange}
                      placeholder="India"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-100 dark:shadow-none transition-colors"
                  >
                    <Save size={14} />
                    <span>Save Address</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* REPAIRS TAB */}
          {activeTab === 'repairs' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Repairs</h3>
                <p className="text-xs text-slate-400">List of your personal recent device repair tickets.</p>
              </div>

              <div className="space-y-4">
                {recentRepairs.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                        📱
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{rep.device}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{rep.id} • {rep.date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                      rep.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800'
                    }`}>
                      {rep.status === 'Completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      <span>{rep.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CANCELLATION POLICY TAB */}
          {activeTab === 'cancellation' && userInfo?.role === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancellation Policy</h3>
                <p className="text-xs text-slate-400">Set the cancellation window for repairs and orders.</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Customers can cancel within the specified time window after booking. Cancellations require admin approval.
                </p>
              </div>

              {settingsMessage && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  settingsMessage.includes('success')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {settingsMessage}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Repair Cancellation Window (hours)
                  </label>
                  <div className="flex items-center gap-2">
                    <Timer size={18} className="text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={cancelRepairHours}
                      onChange={(e) => setCancelRepairHours(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none"
                    />
                    <span className="text-xs text-slate-400 font-medium">hours</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Default: 24 hours. Max: 720 (30 days).</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Order Cancellation Window (hours)
                  </label>
                  <div className="flex items-center gap-2">
                    <Timer size={18} className="text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={cancelOrderHours}
                      onChange={(e) => setCancelOrderHours(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none"
                    />
                    <span className="text-xs text-slate-400 font-medium">hours</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Default: 24 hours. Max: 720 (30 days).</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                <button
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-100 dark:shadow-none transition-colors"
                >
                  <Save size={14} />
                  <span>{settingsLoading ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Security Settings</h3>
                <p className="text-xs text-slate-400">Update your password details.</p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword"
                    value={passwordState.currentPassword}
                    onChange={handlePasswordChange}
                    required 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={passwordState.newPassword}
                    onChange={handlePasswordChange}
                    required 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={passwordState.confirmPassword}
                    onChange={handlePasswordChange}
                    required 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:outline-none dark:text-white transition-all outline-none" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2">
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100 dark:shadow-none transition-colors">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminSettings;
