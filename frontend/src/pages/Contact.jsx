import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Contact = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{t('contact.heroTitle')}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">{t('contact.heroDesc')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <span className="text-teal-600 font-bold text-sm tracking-wider uppercase">{t('contact.getInTouch')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-8">{t('contact.letsTalk')}</h2>
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={22} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('contact.visitUs')}</h3>
                  <p className="text-gray-500 text-sm">123 MG Road, Bengaluru, Karnataka 560001</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={22} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('contact.callUs')}</h3>
                  <p className="text-gray-500 text-sm">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail size={22} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('contact.emailUs')}</h3>
                  <p className="text-gray-500 text-sm">info@shreerenukamba.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock size={22} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{t('contact.businessHours')}</h3>
                  <p className="text-gray-500 text-sm">{t('contact.hours')}</p>
                  <p className="text-gray-500 text-sm">{t('contact.sunHours')}</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 rounded-3xl p-6 border border-teal-100">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle size={20} className="text-teal-600" />
                <h3 className="font-bold text-gray-900">{t('contact.quickResponse')}</h3>
              </div>
              <p className="text-sm text-gray-500">{t('contact.quickDesc')}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-border">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.sendMessage')}</h3>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={24} className="text-green-600" />
                </div>
                <h4 className="font-bold text-green-800 text-lg mb-1">{t('contact.messageSent')}</h4>
                <p className="text-green-600 text-sm">{t('contact.sentDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder={t('contact.yourName')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.email')}</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder={t('contact.yourEmail')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.subject')}</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder={t('contact.subjectPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.message')}</label>
                  <textarea
                    rows="5"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                    placeholder={t('contact.messagePlaceholder')}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <Send size={18} /> {t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
