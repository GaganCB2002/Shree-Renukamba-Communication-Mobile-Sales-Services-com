import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import Products from './pages/ecommerce/Products';
import ProductDetail from './pages/ecommerce/ProductDetail';
import Smartphones from './pages/ecommerce/Smartphones';
import Laptops from './pages/ecommerce/Laptops';
import Accessories from './pages/ecommerce/Accessories';
import Cart from './pages/ecommerce/Cart';
import Wishlist from './pages/ecommerce/Wishlist';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRepairs from './pages/admin/AdminRepairs';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
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
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
        </Route>

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="repairs/new" element={<BookRepair />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="repairs" element={<AdminRepairs />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="settings" element={<AdminSettings />} />
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
  );
}

export default App;
