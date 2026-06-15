import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const TermsAndConditions = () => (
  <div className="min-h-screen bg-background py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Home
      </Link>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
            <Shield size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-950">Terms &amp; Conditions</h1>
            <p className="text-sm text-secondary-500">Last updated: June 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-secondary-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">1. Introduction</h2>
            <p>Welcome to Shree Renukamba Communication. By accessing or using our website, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>"Company"</strong> refers to Shree Renukamba Communication, its owners, employees, and affiliates.</li>
              <li><strong>"Services"</strong> refers to the sale of refurbished electronics, repair services, and any other offerings available on this website.</li>
              <li><strong>"User"</strong> refers to any individual accessing or using the website.</li>
              <li><strong>"Products"</strong> refers to all items listed for sale on the website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">3. Account Registration</h2>
            <p>When creating an account, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">4. Product Listings &amp; Pricing</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All products are refurbished unless stated otherwise. Refurbished products undergo a 45-point quality inspection.</li>
              <li>Prices are in Indian Rupees (INR) and inclusive of all applicable taxes unless otherwise specified.</li>
              <li>We reserve the right to modify prices, discounts, and product availability without prior notice.</li>
              <li>Product images are for illustration purposes only. Actual products may vary slightly.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">5. Orders &amp; Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Order placement constitutes an offer to purchase. We reserve the right to accept or decline any order.</li>
              <li>Payment must be made in full at the time of ordering via the available payment methods.</li>
              <li>We reserve the right to cancel orders if fraudulent activity is suspected.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">6. Shipping &amp; Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free shipping is provided on all orders within India.</li>
              <li>Estimated delivery times are provided at checkout but are not guaranteed.</li>
              <li>Risk of loss passes to the customer upon delivery. Any damage during transit must be reported within 48 hours.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">7. Returns &amp; Refunds</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We offer a 30-day return policy from the date of delivery.</li>
              <li>Products must be returned in their original condition with all accessories and packaging.</li>
              <li>Refunds are processed within 7-10 business days after receiving the returned product.</li>
              <li>Certain products may be non-returnable due to hygiene or safety reasons.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">8. Warranty</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All refurbished products come with a 6-month warranty covering manufacturing defects.</li>
              <li>Warranty does not cover accidental damage, unauthorized repairs, or normal wear and tear.</li>
              <li>Warranty claims must be accompanied by the original purchase receipt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">9. Repair Services</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Repair estimates are provided before any work begins.</li>
              <li>We use genuine or high-quality compatible parts for all repairs.</li>
              <li>Repair turnaround time varies based on part availability and complexity.</li>
              <li>A 30-day warranty applies to all repair services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">10. Limitation of Liability</h2>
            <p>Shree Renukamba Communication shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our total liability is limited to the amount paid by the customer for the specific product or service in question.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">11. Intellectual Property</h2>
            <p>All content on this website — including text, images, logos, and software — is the property of Shree Renukamba Communication and is protected by applicable intellectual property laws. Unauthorized reproduction or distribution is prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">12. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">13. Changes to Terms</h2>
            <p>We reserve the right to update these Terms and Conditions at any time. Users will be notified of significant changes via email or a notice on our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">14. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
            <p className="mt-2">
              <strong>Email:</strong> info@shreerenukamba.com<br />
              <strong>Phone:</strong> +91 98765 43210<br />
              <strong>Address:</strong> Guttur Colony, Harihar, Karnataka, India
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;
