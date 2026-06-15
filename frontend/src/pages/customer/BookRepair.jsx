import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Tablet, Laptop, Watch, Monitor, HelpCircle, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { bookRepair } from '../../api/repairsApi';
import { useSelector } from 'react-redux';

const devices = [
  { id: 'iphone', name: 'iPhone', icon: Smartphone },
  { id: 'ipad', name: 'iPad', icon: Tablet },
  { id: 'macbook', name: 'MacBook', icon: Laptop },
  { id: 'watch', name: 'Apple Watch', icon: Watch },
  { id: 'android', name: 'Android', icon: Smartphone },
  { id: 'pc', name: 'PC Desktop', icon: Monitor },
  { id: 'console', name: 'Console', icon: Watch },
  { id: 'other', name: 'Other', icon: HelpCircle },
];

const commonIssues = [
  'Screen Replacement', 'Battery Replacement', 'Charging Port Issue',
  'Camera Not Working', 'Speaker / Audio Issue', 'Water Damage',
  'Software Problem', 'Button Not Working', 'Overheating',
  'Device Not Turning On', 'Other',
];

const BookRepair = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    imei: '',
    condition: 'Good',
    issueDescription: '',
    issueCategory: '',
    estimatedCost: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  if (!userInfo) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const data = {
        deviceDetails: {
          brand: formData.brand || selectedDevice,
          model: formData.model,
          imei: formData.imei,
          condition: formData.condition,
        },
        issueDescription: formData.issueDescription,
        estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
      };
      const result = await bookRepair(data);
      setSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book repair');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return !!selectedDevice;
    if (step === 2) return !!formData.issueCategory;
    if (step === 3) return formData.brand && formData.model;
    return true;
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-primary-950 mb-2">Repair Booked!</h2>
        <p className="text-secondary-600 mb-2">Your repair ticket <span className="font-bold text-primary-600">{success.repairId}</span> has been created.</p>
        <p className="text-sm text-secondary-500 mb-8">We'll notify you of the status updates.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          View My Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-950 mb-4 tracking-tight">Book a Repair</h1>
          <p className="text-secondary-600 text-lg">Let's get your device back in working order.</p>
        </div>

        <div className="relative max-w-3xl mx-auto mb-16 px-4">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-secondary-100 -z-10"></div>
          <div className="absolute top-5 left-10 h-0.5 bg-primary-600 -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 33.33}%` }}></div>

          <div className="flex justify-between relative">
            {['Device', 'Issue', 'Details', 'Confirm'].map((label, idx) => {
              const num = idx + 1;
              const isActive = step === num;
              const isPast = step > num;
              return (
                <div key={num} className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors bg-white
                    ${isActive ? 'border-primary-600 text-primary-600 shadow-sm' :
                      isPast ? 'bg-primary-600 border-primary-600 text-white' : 'border-secondary-200 text-secondary-400'}`}>
                    {isPast ? <Check size={16} /> : num}
                  </div>
                  <span className={`text-xs font-bold tracking-wide ${isActive || isPast ? 'text-primary-950' : 'text-secondary-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-secondary-50/50 rounded-[2rem] p-8 md:p-12 border border-secondary-100 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">{error}</div>
          )}

          {step === 1 && (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary-950">Select Your Device</h2>
                <p className="text-secondary-500 mt-1">Choose the device you need repaired.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {devices.map((device) => {
                  const Icon = device.icon;
                  const isSelected = selectedDevice === device.id;
                  return (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      className={`flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all
                        ${isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-transparent bg-white text-primary-600 hover:border-primary-200 hover:bg-primary-50/50'}`}
                    >
                      <Icon size={32} strokeWidth={1.5} />
                      <span className="text-sm font-bold text-primary-950">{device.name}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary-950">Describe the Issue</h2>
                <p className="text-secondary-500 mt-1">Select the issue category and provide details.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {commonIssues.map((issue) => (
                  <button
                    key={issue}
                    onClick={() => setFormData({ ...formData, issueCategory: issue, issueDescription: issue === formData.issueCategory ? '' : issue })}
                    className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all
                      ${formData.issueCategory === issue
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-transparent bg-white text-secondary-700 hover:border-primary-200 hover:bg-primary-50/50'}`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary-700 mb-2">Detailed Description (Optional)</label>
                <textarea
                  name="issueDescription"
                  value={formData.issueDescription}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border-border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none resize-none"
                  placeholder="Describe the issue in detail..."
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary-950">Device Details</h2>
                <p className="text-secondary-500 mt-1">Help us identify your device precisely.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Brand *</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange}
                    className="w-full rounded-xl border-border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                    placeholder="e.g. Apple, Samsung" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Model *</label>
                  <input type="text" name="model" value={formData.model} onChange={handleChange}
                    className="w-full rounded-xl border-border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                    placeholder="e.g. iPhone 14 Pro Max" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">IMEI Number</label>
                  <input type="text" name="imei" value={formData.imei} onChange={handleChange}
                    className="w-full rounded-xl border-border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                    placeholder="Optional but recommended" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Device Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleChange}
                    className="w-full rounded-xl border-border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Dead">Dead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 mb-2">Estimated Cost (₹)</label>
                  <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange}
                    className="w-full rounded-xl border-border bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all outline-none"
                    placeholder="Leave blank for estimate" />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary-950">Confirm Your Request</h2>
                <p className="text-secondary-500 mt-1">Please review the details before submitting.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 space-y-4 border border-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-secondary-500 font-medium">Device Type</span>
                    <p className="font-bold text-primary-950 capitalize">{selectedDevice}</p>
                  </div>
                  <div>
                    <span className="text-secondary-500 font-medium">Brand / Model</span>
                    <p className="font-bold text-primary-950">{formData.brand} {formData.model}</p>
                  </div>
                  <div>
                    <span className="text-secondary-500 font-medium">IMEI</span>
                    <p className="font-bold text-primary-950">{formData.imei || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-secondary-500 font-medium">Condition</span>
                    <p className="font-bold text-primary-950">{formData.condition}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-secondary-500 font-medium">Issue</span>
                    <p className="font-bold text-primary-950">{formData.issueCategory}{formData.issueDescription && formData.issueDescription !== formData.issueCategory ? ` - ${formData.issueDescription}` : ''}</p>
                  </div>
                  {formData.estimatedCost && (
                    <div className="col-span-2">
                      <span className="text-secondary-500 font-medium">Estimated Cost</span>
                      <p className="font-bold text-primary-950">₹{formData.estimatedCost}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between pt-8 mt-8 border-t border-secondary-200/50">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border border-border bg-white text-secondary-700 hover:bg-secondary-50 transition-all">
                <ArrowLeft size={18} /> Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                onClick={() => canContinue() && setStep(step + 1)}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm
                  ${canContinue()
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-white text-secondary-300 border border-secondary-200 cursor-not-allowed'}`}
              >
                Continue <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 transition-all shadow-sm disabled:bg-primary-400"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
                {submitting ? 'Submitting...' : 'Submit Repair Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRepair;
