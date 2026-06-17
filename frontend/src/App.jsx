import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider } from './contexts/ThemeContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CustomerDashboard from './pages/customer/Dashboard';
import BookRepair from './pages/customer/BookRepair';
import CustomerSettings from './pages/customer/CustomerSettings';
import LiveTracking from './pages/customer/LiveTracking';
import CustomerSupport from './pages/customer/CustomerSupport';
import OrderHistory from './pages/customer/OrderHistory';
import Products from './pages/ecommerce/Products';
import ProductDetail from './pages/ecommerce/ProductDetail';
import Smartphones from './pages/ecommerce/Smartphones';
import Laptops from './pages/ecommerce/Laptops';
import Accessories from './pages/ecommerce/Accessories';
import Cart from './pages/ecommerce/Cart';
import Checkout from './pages/ecommerce/Checkout';
import Wishlist from './pages/ecommerce/Wishlist';
import Coupons from './pages/ecommerce/Coupons';
import InvoiceDetail from './pages/ecommerce/InvoiceDetail';
import OrderDetail from './pages/ecommerce/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRepairs from './pages/admin/AdminRepairs';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminPriceList from './pages/admin/AdminPriceList';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSettings from './pages/admin/AdminSettings';
import AdminBilling from './pages/admin/AdminBilling';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="shop" element={<Products />} />
          <Route path="smartphones" element={<Smartphones />} />
          <Route path="laptops" element={<Laptops />} />
          <Route path="accessories" element={<Accessories />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="repairs/new" element={<BookRepair />} />
          <Route path="settings" element={<CustomerSettings />} />
          <Route path="live-tracking" element={<LiveTracking />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="support" element={<CustomerSupport />} />
        </Route>

        <Route path="/invoices/:id" element={<InvoiceDetail />} />
        <Route path="/order/:orderId" element={<OrderDetail />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="repairs" element={<AdminRepairs />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="billing" element={<AdminBilling />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="price-list" element={<AdminPriceList />} />
        </Route>

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
              <p className="text-secondary-600 mb-6">Page not found</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
