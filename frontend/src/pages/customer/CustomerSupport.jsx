import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle, Loader2, ChevronRight } from 'lucide-react';

const faqs = [
  { q: 'How long does a repair take?', a: 'Most repairs are completed within 2-5 business days depending on parts availability.' },
  { q: 'Do you provide warranty on repairs?', a: 'Yes, we offer a 6-month warranty on all screen and battery replacements, and 3 months on other repairs.' },
  { q: 'Can I track my repair status?', a: 'Yes! Go to Live Tracking in your dashboard to see real-time status updates.' },
  { q: 'What payment methods do you accept?', a: 'We accept cash, UPI, debit/credit cards, and net banking.' },
  { q: 'Do I need to bring my bill for repair?', a: 'No bill required. Just bring your device and we will diagnose it on the spot.' },
];

const CustomerSupport = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get help with your repairs, devices, or account</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Phone size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Call Us</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">+91 98765 43210</p>
          <p className="text-[10px] text-slate-400 mt-1">Mon-Sat, 10AM - 8PM</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Email Us</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">support@shreerenukamba.com</p>
          <p className="text-[10px] text-slate-400 mt-1">Reply within 24 hours</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MapPin size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Visit Us</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Guttur Colony, Harihar</p>
          <p className="text-[10px] text-slate-400 mt-1">Open all days</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* FAQ */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors list-none">
                  {faq.q}
                  <ChevronRight size={14} className="text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="p-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Send us a Message</h3>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-slate-900 dark:text-white">Message Sent!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Your Name</label>
                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Message</label>
                <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-400 resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50">
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
