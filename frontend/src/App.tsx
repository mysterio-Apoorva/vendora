import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy load pages
const Home = React.lazy(() => import('./pages/buyer/Home'));
const ProductSearch = React.lazy(() => import('./pages/buyer/ProductSearch'));
const ProductDetails = React.lazy(() => import('./pages/buyer/ProductDetails'));
const Cart = React.lazy(() => import('./pages/buyer/Cart'));
const Checkout = React.lazy(() => import('./pages/buyer/Checkout'));
const OrderHistory = React.lazy(() => import('./pages/buyer/OrderHistory'));
const Profile = React.lazy(() => import('./pages/buyer/Profile'));

const VendorInventory = React.lazy(() => import('./pages/vendor/Inventory'));
const VendorOrders = React.lazy(() => import('./pages/vendor/Orders'));
const VendorAnalytics = React.lazy(() => import('./pages/vendor/Analytics'));

const AdminVendorApproval = React.lazy(() => import('./pages/admin/VendorApproval'));
const AdminFraudMonitoring = React.lazy(() => import('./pages/admin/FraudMonitoring'));
const AdminPlatformAnalytics = React.lazy(() => import('./pages/admin/PlatformAnalytics'));
const AdminCommissionManagement = React.lazy(() => import('./pages/admin/CommissionManagement'));

const ProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
  role?: string;
}) => {
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <React.Suspense
        fallback={
          <div className="h-screen w-screen flex items-center justify-center">
            Loading Vendora...
          </div>
        }
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<ProductSearch />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>

          <Route path="/vendor" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<VendorInventory />} />
            <Route path="inventory" element={<VendorInventory />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="analytics" element={<VendorAnalytics />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminPlatformAnalytics />} />
            <Route path="vendors" element={<AdminVendorApproval />} />
            <Route path="fraud" element={<AdminFraudMonitoring />} />
            <Route path="commission" element={<AdminCommissionManagement />} />
            <Route path="analytics" element={<AdminPlatformAnalytics />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App;