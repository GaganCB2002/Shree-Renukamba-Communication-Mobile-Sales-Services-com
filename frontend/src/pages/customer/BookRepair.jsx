import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Tablet, Laptop, Watch, Monitor, HelpCircle, ArrowRight, ArrowLeft, Check, Loader2, Upload, Camera, Search, PartyPopper } from 'lucide-react';
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
    condition: 'Good',
    issueDescription: '',
    issueCategory: '',
  });
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (submitStatus === 'success') {
      const timer = setTimeout(() => setShowSuccessPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  useEffect(() => {
    if (success) {
      setSubmitStatus('success');
      setShowSuccessPopup(true);
    }
  }, [success]);

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
      setSubmitStatus('submitting');
      setError('');
      const data = {
        deviceDetails: {
          brand: formData.brand || selectedDevice,
          model: formData.model,
          condition: formData.condition,
        },
        issueDescription: formData.issueDescription || selectedIssues.join(', '),
        selectedIssues,
      };
      const result = await bookRepair(data);
      setSuccess(result);
      setSubmitStatus('success');
    } catch (err) {
      setSubmitStatus('error');
      setError(err.response?.data?.message || 'Failed to book repair');
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = () => {
    if (step === 1) return !!selectedDevice;
    if (step === 2) return selectedIssues.length > 0;
    if (step === 3) return formData.brand && formData.model;
    return true;
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="min-h-[60vh] flex flex-col items-center justify-center py-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
        >
          <PartyPopper size={36} className="text-green-600" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-3xl font-bold text-primary-950 mb-2"
        >
          Repair Booked! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-secondary-600 mb-2"
        >
          Your repair ticket <span className="font-bold text-primary-600">{success.repairId}</span> has been created.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="text-sm text-secondary-500 mb-8"
        >
          We'll notify you of the status updates via email.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-sm"
        >
          View My Dashboard
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="text-xs text-secondary-400 mt-4"
        >
          You can track your repair status in real-time from your dashboard.
        </motion.p>
      </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence>
            {showSuccessPopup && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                onClick={() => setShowSuccessPopup(false)}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <PartyPopper size={30} className="text-green-600" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-primary-950 mb-2"
                  >
                    Repair Request Submitted!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="text-sm text-secondary-600 mb-4"
                  >
                    Your ticket <span className="font-bold text-primary-600">{success?.repairId}</span> has been created.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 justify-center"
                  >
                    <button
                      onClick={() => { setShowSuccessPopup(false); navigate('/dashboard'); }}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-colors"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => setShowSuccessPopup(false)}
                      className="text-sm font-medium text-secondary-600 hover:text-primary-600 border border-border px-6 py-2.5 rounded-xl transition-colors"
                    >
                      OK
                    </button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary-950">Select Your Device</h2>
                <p className="text-secondary-500 mt-1">Choose the device you need repaired.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
                {devices.map((device) => {
                  const Icon = device.icon;
                  const isSelected = selectedDevice === device.id;
                  return (
                    <motion.button
                      key={device.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedDevice(device.id)}
                      className={`flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all
                        ${isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                          : 'border-transparent bg-white text-primary-600 hover:border-primary-200 hover:bg-primary-50/50'}`}
                    >
                      <Icon size={32} strokeWidth={1.5} />
                      <span className="text-sm font-bold text-primary-950">{device.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-primary-950">Describe the Issue</h2>
                <p className="text-secondary-500 mt-1">Select the issue category and provide details.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {commonIssues.map((issue) => {
                  const isSelected = selectedIssues.includes(issue);
                  return (
                    <motion.button
                      key={issue}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelectedIssues(prev =>
                          prev.includes(issue)
                            ? prev.filter(i => i !== issue)
                            : [...prev, issue]
                        );
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all flex items-center gap-2
                        ${isSelected
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-transparent bg-white text-secondary-700 hover:border-primary-200 hover:bg-primary-50/50'}`}
                    >
                      {isSelected && <Check size={14} />}
                      {issue}
                    </motion.button>
                  );
                })}
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
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
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
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                    <span className="text-secondary-500 font-medium">Condition</span>
                    <p className="font-bold text-primary-950">{formData.condition}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-secondary-500 font-medium">Selected Issues</span>
                    <p className="font-bold text-primary-950 mt-1">
                      {selectedIssues.length > 0 ? selectedIssues.join(', ') : formData.issueDescription || 'Not specified'}
                    </p>
                  </div>
                  {formData.issueDescription && (
                    <div className="col-span-2">
                      <span className="text-secondary-500 font-medium">Additional Details</span>
                      <p className="font-bold text-primary-950 mt-1">{formData.issueDescription}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-xs text-purple-700 font-medium flex items-center gap-2">
                  <Check size={14} /> By submitting, you agree to our service terms. You will receive email notifications about your repair status.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                whileTap={{ scale: 0.97 }}
                animate={{
                  backgroundColor: submitStatus === 'success' ? '#16a34a' : submitStatus === 'submitting' ? '#7c3aed' : '#6366f1',
                }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed"
              >
                <AnimatePresence mode="wait">
                  {submitStatus === 'submitting' ? (
                    <motion.div key="spinner" initial={{ opacity: 0, rotate: -180 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> Submitting...
                    </motion.div>
                  ) : submitStatus === 'success' ? (
                    <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                      <Check size={18} /> Done!
                    </motion.div>
                  ) : (
                    <motion.div key="submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      Submit Repair Request <ArrowRight size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRepair;
