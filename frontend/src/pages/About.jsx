import { Link } from 'react-router-dom';
import { Shield, Truck, RotateCcw, Star, Users, CheckCircle, Wrench, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{t('about.heroTitle')}</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t('about.heroDesc')}
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <span className="text-indigo-600 font-bold text-sm tracking-wider uppercase">{t('about.ourStory')}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-6">{t('about.storyTitle')}</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>{t('about.storyP1')}</p>
              <p>{t('about.storyP2')}</p>
              <p>{t('about.storyP3')}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-3xl p-8 md:p-10 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-indigo-600 mb-1">10K+</div>
                <p className="text-sm text-gray-500">{t('about.happyCustomers')}</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-indigo-600 mb-1">5K+</div>
                <p className="text-sm text-gray-500">{t('about.devicesSold')}</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-indigo-600 mb-1">4.8</div>
                <p className="text-sm text-gray-500">{t('about.avgRating')}</p>
              </div>
              <div className="text-center p-4">
                <div className="text-4xl font-bold text-indigo-600 mb-1">8+</div>
                <p className="text-sm text-gray-500">{t('about.yearsExp')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('about.whatWeDo')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('about.whatWeDoDesc')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <Star size={28} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.ecomTitle')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('about.ecomDesc')}</p>
              <Link to="/shop" className="inline-flex items-center gap-1 text-indigo-600 font-semibold text-sm hover:text-indigo-700">
                {t('about.browseStore')} <ChevronRight size={16} />
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <Wrench size={28} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about.repairTitle')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('about.repairDesc')}</p>
              <Link to="/dashboard/repairs/new" className="inline-flex items-center gap-1 text-orange-600 font-semibold text-sm hover:text-orange-700">
                {t('about.bookRepair')} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('about.whyChoose')}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t('about.whyChooseDesc')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Shield size={24} className="text-indigo-600" />, title: 'Certified Quality', desc: 'Every device passes a 45-point inspection. We only sell products that meet our strict quality standards.' },
            { icon: <Truck size={24} className="text-green-600" />, title: 'Free Shipping', desc: 'Free express delivery on orders above $50. Track your order every step of the way.' },
            { icon: <RotateCcw size={24} className="text-purple-600" />, title: '30-Day Returns', desc: 'Not satisfied? Return any device within 30 days for a full refund. No questions asked.' },
            { icon: <CheckCircle size={24} className="text-orange-600" />, title: '1 Year Warranty', desc: 'All devices come with a comprehensive 1-year warranty covering defects and malfunctions.' },
            { icon: <Users size={24} className="text-blue-600" />, title: 'Expert Support', desc: 'Our team of certified technicians is available 24/7 to help with any questions or issues.' },
            { icon: <Star size={24} className="text-yellow-600" />, title: 'Best Prices', desc: 'We guarantee the best prices on certified refurbished devices. Price match included.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('about.meetTeam')}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t('about.meetTeamDesc')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ravi Kumar', role: 'Founder & CEO', bio: '15+ years in electronics retail. Visionary behind Shree Renukamba\'s quality-first approach.' },
              { name: 'Sneha Patel', role: 'Head of Operations', bio: 'Ensures every device meets our 45-point inspection standard before reaching customers.' },
              { name: 'Arun Sharma', role: 'Lead Technician', bio: 'Certified repair specialist with expertise in all major brands from Apple to Samsung.' },
            ].map((member, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 text-center shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl font-bold text-indigo-600">{member.name.charAt(0)}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                <p className="text-indigo-600 text-sm font-medium mb-3">{member.role}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('about.readyToStart')}</h2>
          <p className="text-indigo-200 mb-8 max-w-lg mx-auto">{t('about.readyDesc')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="bg-white text-indigo-600 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              {t('about.shopNow')}
            </Link>
            <Link to="/dashboard/repairs/new" className="bg-indigo-500 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400">
              {t('about.bookRepair')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
