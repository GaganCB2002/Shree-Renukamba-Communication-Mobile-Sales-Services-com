import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Tag, Clock, CheckCircle, ChevronRight, Loader2, IndianRupee, Percent } from 'lucide-react';
import { getCoupons } from '../../api/couponsApi';

const fallbackCoupons = [
  { code: 'FIXMYDEVICE', discountType: 'flat', discountValue: 500, description: 'Flat ₹500 off on screen and battery replacement services.', minPurchase: 1499, validUntil: new Date('2026-03-31').toISOString() },
  { code: 'SRC20', discountType: 'percentage', discountValue: 20, description: 'Get 20% off on all accessories including chargers, cases, and screen guards.', minPurchase: 999, validUntil: new Date('2026-04-15').toISOString() },
  { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, description: 'Special discount for first-time customers on all products.', minPurchase: 499, validUntil: new Date('2026-06-30').toISOString() },
  { code: 'PHONEFREE', discountType: 'flat', discountValue: 0, description: 'Get a free tempered glass screen guard with every smartphone purchase.', minPurchase: 0, validUntil: new Date('2026-05-15').toISOString() },
  { code: 'REPAIR100', discountType: 'flat', discountValue: 100, description: 'Flat ₹100 discount on any repair service. Applicable on all device types.', minPurchase: 0, validUntil: new Date('2026-04-30').toISOString() },
];

const colorPairs = [
  { bg: 'from-indigo-600 to-purple-700', badge: 'bg-indigo-50 text-indigo-600' },
  { bg: 'from-emerald-600 to-teal-700', badge: 'bg-emerald-50 text-emerald-600' },
  { bg: 'from-orange-500 to-red-600', badge: 'bg-orange-50 text-orange-600' },
  { bg: 'from-blue-600 to-cyan-600', badge: 'bg-blue-50 text-blue-600' },
  { bg: 'from-rose-500 to-pink-600', badge: 'bg-rose-50 text-rose-600' },
];

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchCoupons() {
    try {
      const data = await getCoupons();
      if (data && data.length > 0) {
        setCoupons(data);
      } else {
        setCoupons(fallbackCoupons);
      }
    } catch {
      setCoupons(fallbackCoupons);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-950 mb-3">Coupons & Offers</h1>
          <p className="text-secondary-500 max-w-lg mx-auto">Exclusive deals and discounts for our valued customers. Use the coupon codes at checkout.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16">
            <Gift size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-primary-950 mb-2">No Active Coupons</h3>
            <p className="text-secondary-500">Check back later for new offers and discounts.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {coupons.map((coupon, i) => {
              const colors = colorPairs[i % colorPairs.length];
              return (
                <div key={coupon.code || i} className={`bg-gradient-to-br ${colors.bg} rounded-3xl p-0.5 shadow-lg`}>
                  <div className="bg-white rounded-[calc(1.5rem-1px)] p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Coupon Code</div>
                        <div className="text-lg font-extrabold text-primary-950 font-mono tracking-wider">{coupon.code}</div>
                      </div>
                      <div className={`flex items-center gap-1 text-2xl font-extrabold ${i === 0 ? 'text-indigo-600' : i === 1 ? 'text-emerald-600' : i === 2 ? 'text-orange-600' : i === 3 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {coupon.discountType === 'percentage' ? <Percent size={20} /> : <IndianRupee size={20} />}
                        {coupon.discountValue > 0 ? (
                          coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue}`
                        ) : (
                          'FREE'
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-secondary-600 mb-4">{coupon.description}</p>
                    <div className="flex flex-col gap-1.5 mb-5">
                      {coupon.validUntil && (
                        <div className="flex items-center gap-2 text-xs text-secondary-500">
                          <Clock size={12} />
                          Valid until {new Date(coupon.validUntil).toLocaleDateString()}
                        </div>
                      )}
                      {coupon.minPurchase > 0 && (
                        <div className="flex items-center gap-2 text-xs text-secondary-500">
                          <Tag size={12} />
                          Min. purchase: ₹{coupon.minPurchase}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                        <CheckCircle size={14} />
                        Active
                      </div>
                      <Link to="/shop" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                        Shop Now <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 bg-white rounded-3xl p-8 border border-border shadow-sm">
          <h2 className="text-lg font-bold text-primary-950 mb-6">How to Use Coupons</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Browse & Add', desc: 'Browse our products and add items to your cart.' },
              { step: '2', title: 'Apply Code', desc: 'Enter the coupon code at checkout in the "Apply Coupon" field.' },
              { step: '3', title: 'Enjoy Savings', desc: 'Your discount will be applied automatically. Complete your purchase!' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-4">{item.step}</div>
                <h3 className="text-sm font-bold text-primary-950 mb-2">{item.title}</h3>
                <p className="text-xs text-secondary-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-secondary-400">* Coupons cannot be combined with other offers. One coupon per order. Subject to terms and conditions.</p>
        </div>
      </div>
    </div>
  );
}
