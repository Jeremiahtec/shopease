import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Bell, ClipboardList, LayoutDashboard, Package, Settings, Store, Tags, Users as UsersIcon } from 'lucide-react';

import PublicLayout from './layouts/PublicLayout';
import AccountLayout from './layouts/AccountLayout';
import DashboardLayout from './layouts/DashboardLayout';
import RequireRole from './components/RouteGuards';
import TopProgress from './components/TopProgress';
import { BrandLoader } from './components/ui';

import Marketplace from './pages/Marketplace';
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const StorePage = lazy(() => import('./pages/StorePage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentCallback = lazy(() => import('./pages/PaymentCallback'));
const Auth = lazy(() => import('./pages/Auth'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Orders = lazy(() => import('./pages/account/Orders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Wishlist = lazy(() => import('./pages/account/Wishlist'));
const Notifications = lazy(() => import('./pages/Notifications'));

const VendorOverview = lazy(() => import('./pages/vendor/Overview'));
const VendorProducts = lazy(() => import('./pages/vendor/Products'));
const VendorOrders = lazy(() => import('./pages/vendor/Orders'));
const VendorSettings = lazy(() => import('./pages/vendor/Settings'));

const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));

const VENDOR_NAV = [
  { to: '/vendor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/vendor/products', label: 'Products', icon: Package },
  { to: '/vendor/orders', label: 'Orders', icon: ClipboardList },
  { to: '/vendor/notifications', label: 'Notifications', icon: Bell },
  { to: '/vendor/settings', label: 'Store settings', icon: Settings },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Platform overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Global orders', icon: Store },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <TopProgress />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Marketplace />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="stores/:id" element={<StorePage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="legal" element={<Legal />} />
          <Route path="legal/:doc" element={<Legal />} />
          <Route element={<RequireRole roles={['CUSTOMER']} />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="payment/callback" element={<PaymentCallback />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="login" element={<Suspense fallback={<BrandLoader fullScreen />}>
              <Auth />
            </Suspense>} />
        <Route path="forgot-password" element={<Suspense fallback={<BrandLoader fullScreen />}><ForgotPassword /></Suspense>} />
        <Route path="reset-password" element={<Suspense fallback={<BrandLoader fullScreen />}><ResetPassword /></Suspense>} />
        <Route path="register" element={<Suspense fallback={<BrandLoader fullScreen />}>
              <Auth />
            </Suspense>} />

        <Route element={<RequireRole roles={['CUSTOMER']} />}>
          <Route path="account" element={<AccountLayout />}>
            <Route index element={<Navigate to="orders" replace />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<Profile />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>

        <Route element={<RequireRole roles={['VENDOR']} />}>
          <Route path="vendor" element={<DashboardLayout variant="vendor" nav={VENDOR_NAV} sectionLabel="Store management" />}>
            <Route index element={<VendorOverview />} />
            <Route path="products" element={<VendorProducts />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<VendorSettings />} />
          </Route>
        </Route>

        <Route element={<RequireRole roles={['ADMIN']} />}>
          <Route path="admin" element={<DashboardLayout variant="admin" nav={ADMIN_NAV} sectionLabel="Operational console" />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
