import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Shield, Save, Loader2, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { updateUserProfileApi, changePasswordApi } from '../../api/authApi';
import { setCredentials } from '../../redux/slices/authSlice';

const CustomerSettings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    fullName: userInfo?.fullName || '',
    email: userInfo?.email || '',
    phoneNumber: userInfo?.phoneNumber || '',
  });

  const [address, setAddress] = useState({
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    pincode: userInfo?.address?.pincode || '',
    landmark: userInfo?.address?.landmark || '',
  });

  const [savedAddresses, setSavedAddresses] = useState(
    Array.isArray(userInfo?.address?.savedAddresses) ? userInfo?.address?.savedAddresses : []
  );

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', street: '', city: '', state: '', pincode: '', landmark: '',
  });

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const updated = await updateUserProfileApi({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        address: { ...address, savedAddresses },
      });
      dispatch(setCredentials({ ...userInfo, ...updated, address: updated.address }));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city) return;
    const updated = [...savedAddresses, { ...newAddress, id: Date.now().toString() }];
    setSavedAddresses(updated);
    setNewAddress({ label: '', street: '', city: '', state: '', pincode: '', landmark: '' });
    setAddingAddress(false);
  };

  const handleRemoveAddress = (id) => {
    setSavedAddresses(savedAddresses.filter(a => a.id !== id));
  };

  const handleSetDefaultAddress = (addr) => {
    setAddress({
      street: addr.street,
      city: addr.city,
      state: addr.state || '',
      pincode: addr.pincode || '',
      landmark: addr.landmark || '',
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'address', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your profile, addresses, and security</p>
      </div>

      {message.text && (
        <div className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : null}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-800 -mb-px'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSavePersonal} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
              <input type="email" value={form.email} disabled
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Phone Number</label>
              <input type="text" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Default Address</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Street / Colony</label>
                <input type="text" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">City</label>
                <input type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">State</label>
                <input type="text" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Pincode</label>
                <input type="text" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Landmark</label>
                <input type="text" value={address.landmark} onChange={e => setAddress({ ...address, landmark: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Address Tab */}
      {activeTab === 'address' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Saved Addresses</h3>
              <button type="button" onClick={() => setAddingAddress(!addingAddress)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                <Plus size={14} /> Add Address
              </button>
            </div>

            {addingAddress && (
              <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Label (e.g. Home, Office)</label>
                    <input type="text" value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Street / Colony</label>
                    <input type="text" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
                    <input type="text" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">State</label>
                    <input type="text" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Pincode</label>
                    <input type="text" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Landmark</label>
                    <input type="text" value={newAddress.landmark} onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-indigo-400" />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button type="button" onClick={() => setAddingAddress(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
                  <button type="button" onClick={handleAddAddress}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Save Address</button>
                </div>
              </div>
            )}

            {savedAddresses.length === 0 && !addingAddress ? (
              <p className="text-sm text-slate-400 text-center py-6">No saved addresses. Click "Add Address" to add one.</p>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map(addr => (
                  <div key={addr.id} className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-600">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">{addr.label}</span>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.pincode}</p>
                      {addr.landmark && <p className="text-xs text-slate-400 mt-0.5">Landmark: {addr.landmark}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleSetDefaultAddress(addr)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600" title="Set as default">
                        <MapPin size={14} />
                      </button>
                      <button type="button" onClick={() => handleRemoveAddress(addr.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-5">
          <h3 className="font-bold text-slate-900 dark:text-white">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Current Password</label>
              <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">New Password</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" required minLength={6} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Confirm New Password</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" required minLength={6} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerSettings;
