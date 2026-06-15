import { useState } from 'react';
import { Save, Settings } from 'lucide-react';

const AdminSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Shree Renukamba Communication',
    address: '123 Tech Street, Bangalore, India',
    phone: '+91 98765 43210',
    email: 'info@renukamba.com',
    taxRate: 18,
    currency: 'INR',
  });

  const handleChange = (e) => {
    setStoreSettings({ ...storeSettings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Settings size={28} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-primary-950">Store Settings</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-border space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-secondary-700 mb-2">Store Name</label>
            <input type="text" name="storeName" value={storeSettings.storeName} onChange={handleChange}
              className="w-full rounded-xl border-border bg-secondary-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-secondary-700 mb-2">Email</label>
            <input type="email" name="email" value={storeSettings.email} onChange={handleChange}
              className="w-full rounded-xl border-border bg-secondary-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-secondary-700 mb-2">Address</label>
            <input type="text" name="address" value={storeSettings.address} onChange={handleChange}
              className="w-full rounded-xl border-border bg-secondary-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-secondary-700 mb-2">Phone</label>
            <input type="text" name="phone" value={storeSettings.phone} onChange={handleChange}
              className="w-full rounded-xl border-border bg-secondary-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-secondary-700 mb-2">Currency</label>
            <select name="currency" value={storeSettings.currency} onChange={handleChange}
              className="w-full rounded-xl border-border bg-secondary-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none">
              <option value="INR">INR (₹)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-secondary-700 mb-2">Tax Rate (%)</label>
            <input type="number" name="taxRate" value={storeSettings.taxRate} onChange={handleChange}
              className="w-full rounded-xl border-border bg-secondary-50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
