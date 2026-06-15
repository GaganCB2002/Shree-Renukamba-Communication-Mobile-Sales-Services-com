import { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  User as UserIcon, MapPin, History, Shield, Save, 
  Trash2, Edit, Plus, CheckCircle, Clock 
} from 'lucide-react';

const AdminSettings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Tabs: 'personal', 'addresses', 'repairs', 'orders', 'security'
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Info Form State
  const fullNameParts = userInfo?.fullName?.split(' ') || ['Alex', 'Rivera'];
  const [personalInfo, setPersonalInfo] = useState({
    firstName: fullNameParts[0] || 'Alex',
    lastName: fullNameParts.slice(1).join(' ') || 'Rivera',
    email: userInfo?.email || 'alex.rivera@example.com',
    phone: userInfo?.phoneNumber || '+1 (555) 123-4567',
  });

  // Addresses State
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Default Billing',
      name: 'Alex Rivera',
      street: '123 Innovation Drive, Suite 400',
      cityStateZip: 'San Francisco, CA 94105',
      phone: '(555) 123-4567',
    },
    {
      id: 2,
      type: 'Shipping Address',
      name: 'Office Mailroom',
      street: '789 Tech Boulevard, Building C',
      cityStateZip: 'San Jose, CA 95110',
      phone: '(555) 987-6543',
    }
  ]);

  // Recent Repairs (Screenshot 3)
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

  const handleSavePersonal = (e) => {
    e.preventDefault();
    alert('Personal details saved successfully (mocked)!');
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Delete this address?')) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header Block */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop';
            }}
          />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
            {personalInfo.firstName} {personalInfo.lastName}
          </h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold">
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full">
              Premium Member
            </span>
            <span className="text-slate-400 font-medium">Member since Oct 2022</span>
          </div>
        </div>
      </div>

      {/* Main Settings Tabs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side Tab Selector */}
        <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('personal')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'personal'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <UserIcon size={16} />
            <span>Personal Info</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'addresses'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin size={16} />
            <span>Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('repairs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'repairs'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History size={16} />
            <span>Repair History</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeTab === 'security'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Shield size={16} />
            <span>Security</span>
          </button>
        </div>

        {/* Right Side Panel Content */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          
          {/* PERSONAL INFO TAB */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-400">Update your primary contact and profile details.</p>
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={personalInfo.firstName} 
                      onChange={handlePersonalChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={personalInfo.lastName} 
                      onChange={handlePersonalChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={personalInfo.email} 
                    onChange={handlePersonalChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={personalInfo.phone} 
                    onChange={handlePersonalChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" 
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-100"
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
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Addresses</h3>
                  <p className="text-xs text-slate-400">Manage your shipping and billing address cards.</p>
                </div>
                <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                  <Plus size={14} />
                  <span>Add New</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/20 relative space-y-4 hover:border-slate-300 transition-all">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                        {addr.type}
                      </span>
                      <div className="flex items-center gap-1 text-slate-400">
                        <button className="p-1 hover:text-slate-600 transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="p-1 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-700 font-medium">
                      <p className="font-extrabold text-slate-900">{addr.name}</p>
                      <p>{addr.street}</p>
                      <p>{addr.cityStateZip}</p>
                      <p className="text-xs text-slate-400 mt-2 font-semibold">📞 {addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPAIRS TAB */}
          {activeTab === 'repairs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Repairs</h3>
                <p className="text-xs text-slate-400">List of your personal recent device repair tickets.</p>
              </div>

              <div className="space-y-4">
                {recentRepairs.map((rep) => (
                  <div key={rep.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        📱
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{rep.device}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">{rep.id} • {rep.date}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                      rep.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                    }`}>
                      {rep.status === 'Completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      <span>{rep.status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
                <p className="text-xs text-slate-400">Update your password and verification details.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); alert('Password updated successfully!'); }} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                  <input type="password" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                  <input type="password" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input type="password" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm focus:outline-none" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-100">
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
