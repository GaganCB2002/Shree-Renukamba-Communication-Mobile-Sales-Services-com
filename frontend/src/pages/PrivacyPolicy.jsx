import { Link } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-secondary-600 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Home
      </Link>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center">
            <Lock size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary-950">Privacy Policy</h1>
            <p className="text-sm text-secondary-500">Last updated: June 2026</p>
          </div>
        </div>

        <div className="space-y-8 text-secondary-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">1. Introduction</h2>
            <p>Shree Renukamba Communication ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">2. Information We Collect</h2>
            <h3 className="font-semibold text-primary-900 mt-4 mb-2">Personal Information</h3>
            <p>When you register, place an order, or contact us, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Shipping and billing address</li>
              <li>Payment information (processed securely through third-party gateways)</li>
            </ul>

            <h3 className="font-semibold text-primary-900 mt-4 mb-2">Non-Personal Information</h3>
            <p>We automatically collect certain information when you visit our website, including:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>IP address and browser type</li>
              <li>Device information (operating system, screen resolution)</li>
              <li>Pages visited and time spent on the site</li>
              <li>Referring URL and search terms</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>To process and fulfill your orders and repair requests</li>
              <li>To communicate with you regarding your orders, inquiries, and account</li>
              <li>To improve our website, products, and services</li>
              <li>To send promotional offers and updates (only with your consent)</li>
              <li>To prevent fraud and ensure the security of our platform</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">4. Cookies &amp; Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us remember your preferences and understand how you use our site.</p>
            <h3 className="font-semibold text-primary-900 mt-4 mb-2">Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., cart items, login sessions).</li>
              <li><strong>Preference Cookies:</strong> Remember your language and display preferences.</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site.</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (only with consent).</li>
            </ul>
            <p className="mt-3">You can control cookie settings through your browser preferences. Disabling certain cookies may affect website functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">5. Data Sharing &amp; Disclosure</h2>
            <p>We do not sell your personal information to third parties. We may share your data with:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Service Providers:</strong> Payment processors, shipping carriers, and IT service providers who need the data to perform their services.</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our legal rights.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">6. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>SSL/TLS encryption for all data transmissions</li>
              <li>Secure storage with restricted access</li>
              <li>Regular security audits and updates</li>
              <li>Industry-standard payment processing with PCI-compliant gateways</li>
            </ul>
            <p className="mt-3">However, no method of electronic storage or transmission is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">7. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide services. We may retain certain data for legal compliance, dispute resolution, and fraud prevention purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the following rights:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations).</li>
              <li><strong>Restriction:</strong> Request restriction of processing your data.</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service provider.</li>
              <li><strong>Withdrawal of Consent:</strong> Withdraw consent at any time where we rely on consent for processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">9. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to review their privacy policies before providing any personal information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">10. Children's Privacy</h2>
            <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will delete it.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. Significant changes will be notified via email or website notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-950 mb-3">12. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
            <p className="mt-2">
              <strong>Email:</strong> info@shreerenukamba.com<br />
              <strong>Phone:</strong> +91 98765 43210<br />
              <strong>Address:</strong> 123 MG Road, Bengaluru, Karnataka, India
            </p>
          </section>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
