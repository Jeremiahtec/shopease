import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=/g, '');
const token = `${b64({ alg: 'HS256' })}.${b64({ exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
const user = (role) => ({ id: 7, fullName: 'Ada Okafor', email: 'ada@test.com', phone: '0801', role, enabled: true, createdAt: '2026-09-01T10:00:00' });
const login = (role) => localStorage.setItem('shopease_auth', JSON.stringify({ accessToken: token, refreshToken: 'r', user: user(role) }));

const page = (content) => ({ content, page: 0, size: 10, totalElements: content.length, totalPages: 1, last: true });
const product = { id: 1, name: 'Aura Headphones', description: 'Great sound', price: 125000, stockQuantity: 4, sku: 'APX-1', status: 'ACTIVE', categoryId: 1, categoryName: 'Electronics', storeId: 1, storeName: 'Apex Audio', imageUrls: ['https://x/y.png'], createdAt: '2026-09-01T10:00:00' };
const store = { id: 1, name: 'Apex Audio', description: 'Audio gear', logoUrl: null, active: true, ownerId: 7, createdAt: '2026-09-01T10:00:00' };
const orderItem = { productId: 1, productName: 'Aura Headphones', storeId: 1, storeName: 'Apex Audio', unitPrice: 125000, quantity: 2, lineTotal: 250000 };
const order = { id: 5, status: 'PENDING', totalAmount: 250000, shippingAddress: 'Ada, 0801\n12 Road\nOgbomoso, Oyo', customerId: 7, customerName: 'Ada Okafor', items: [orderItem], createdAt: '2026-09-02T10:00:00' };
const cart = { id: 1, items: [{ id: 3, productId: 1, productName: 'Aura Headphones', storeName: 'Apex Audio', imageUrl: null, unitPrice: 125000, quantity: 2, lineTotal: 250000, availableStock: 4 }], totalItems: 2, totalAmount: 250000 };

const routes = {
  '/api/categories': page([{ id: 1, name: 'Electronics', description: 'Gadgets' }]),
  '/api/products/search': page([product]),
  '/api/products/mine': page([product]),
  '/api/products/1/reviews': page([{ id: 1, productId: 1, userId: 2, reviewerName: 'Kemi A', rating: 5, comment: 'Love it', createdAt: '2026-09-03T10:00:00' }]),
  '/api/products/1': product,
  '/api/stores/me': store,
  '/api/stores/1': store,
  '/api/cart': cart,
  '/api/cart/items': cart,
  '/api/notifications/unread-count': { count: 1 },
  '/api/notifications': page([
    { id: 1, title: 'Your order is on its way', message: 'Order #5 has been shipped.', orderId: 5, status: 'SHIPPED', seen: false, createdAt: '2026-10-03T10:00:00' },
    { id: 2, title: 'Payment received', message: 'We received your payment.', orderId: 5, status: 'PAID', seen: true, createdAt: '2026-10-02T10:00:00' },
  ]),
  '/api/orders/5': order,
  '/api/orders': page([order]),
  '/api/wishlist': page([{ id: 1, product, addedAt: '2026-09-03T10:00:00' }]),
  '/api/admin/dashboard': { totalUsers: 10, totalCustomers: 8, totalVendors: 2, totalStores: 2, totalProducts: 5, totalOrders: 3, totalRevenue: 500000 },
  '/api/admin/stores': page([store]),
  '/api/admin/users': page([user('VENDOR')]),
  '/api/admin/orders': page([order]),
  '/api/payments/verify/REF1': { reference: 'REF1', orderId: 5, amount: 250000, status: 'SUCCESS', orderStatus: 'PAID', paidAt: '2026-09-02T10:05:00' },
};

beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.scrollTo = () => 'returns-something';
  globalThis.fetch = vi.fn(async (url) => {
    const path = new URL(url).pathname;
    const body = routes[path];
    if (!body) return new Response(JSON.stringify({ message: `no mock for ${path}` }), { status: 404 });
    return new Response(JSON.stringify(body), { status: 200 });
  });
});

function renderAt(path) {
  const errors = [];
  const spy = vi.spyOn(console, 'error').mockImplementation((...a) => errors.push(a.join(' ')));
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { errors, spy };
}

const cases = [
  ['guest', null, '/', 'Aura Headphones'],
  ['guest', null, '/products/1', 'Love it'],
  ['guest', null, '/stores/1', 'Audio gear'],
  ['guest', null, '/cart', 'Order summary'],
  ['guest', null, '/login', 'Welcome back to ShopEase'],
  ['guest', null, '/register', 'Create your ShopEase account'],
  ['guest', null, '/legal', 'Last updated'],
  ['guest', null, '/legal/privacy', 'Why we use your data'],
  ['guest', null, '/legal/vendors', 'Fees and payouts'],
  ['guest', null, '/legal/help', 'How do I place an order?'],
  ['guest', null, '/forgot-password', 'Forgot your password?'],
  ['guest', null, '/reset-password?token=abc', 'Choose a new password'],
  ['guest', null, '/reset-password', 'Reset link missing'],
  ['guest', null, '/nope', 'Page not found'],
  ['customer', 'CUSTOMER', '/checkout', 'Delivery address & contact'],
  ['customer', 'CUSTOMER', '/account/orders', 'Order history'],
  ['customer', 'CUSTOMER', '/account/orders/5', 'Financial summary'],
  ['customer', 'CUSTOMER', '/account/profile', 'Change password'],
  ['customer', 'CUSTOMER', '/account/wishlist', 'saved item'],
  ['customer', 'CUSTOMER', '/account/notifications', 'Your order is on its way'],
  ['vendor', 'VENDOR', '/vendor/notifications', 'Payment received'],
  ['customer', 'CUSTOMER', '/payment/callback?reference=REF1', 'Payment verified successfully!'],
  ['vendor', 'VENDOR', '/vendor', 'Recent orders'],
  ['vendor', 'VENDOR', '/vendor/products', 'APX-1'],
  ['vendor', 'VENDOR', '/vendor/orders', 'Store orders'],
  ['vendor', 'VENDOR', '/vendor/settings', 'General brand identity'],
  ['admin', 'ADMIN', '/admin', 'Platform overview & governance'],
  ['admin', 'ADMIN', '/admin/users', 'Users management'],
  ['admin', 'ADMIN', '/admin/categories', 'Category management'],
  ['admin', 'ADMIN', '/admin/orders', 'Global orders'],
];

describe('route smoke tests', () => {
  for (const [who, role, path, text] of cases) {
    it(`${who} ${path}`, async () => {
      if (role) login(role);
      const { errors, spy } = renderAt(path);
      await waitFor(() => expect(screen.getAllByText(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).length).toBeGreaterThan(0), { timeout: 4000 });
      spy.mockRestore();
      const real = errors.filter((e) => !/act\(/.test(e));
      expect(real, real.join('\n')).toEqual([]);
    });
  }

  it('customer redirected away from vendor area, guest sent to login', async () => {
    login('CUSTOMER');
    renderAt('/vendor');
    await waitFor(() => expect(screen.getAllByText(/Marketplace products/).length).toBeGreaterThan(0));
    cleanup(); localStorage.clear();
    renderAt('/account/orders');
    await waitFor(() => expect(screen.getAllByText(/Welcome back to ShopEase/).length).toBeGreaterThan(0));
  });

  it('sign in <-> create account switches in place and keeps typed values', async () => {
    renderAt('/login');
    await waitFor(() => expect(screen.getAllByText(/Welcome back to ShopEase/).length).toBeGreaterThan(0));
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'kemi@test.com' } });
    fireEvent.click(screen.getAllByText('Create account')[0]);
    await waitFor(() => expect(screen.getAllByText(/Create your ShopEase account/).length).toBeGreaterThan(0));
    expect(screen.getByPlaceholderText('you@example.com').value).toBe('kemi@test.com');
    fireEvent.click(screen.getAllByText('Sign in')[0]);
    await waitFor(() => expect(screen.getAllByText(/Welcome back to ShopEase/).length).toBeGreaterThan(0));
  });

  it('shows the branded loader while data is loading', async () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {}));
    renderAt('/products/1');
    await waitFor(() => expect(screen.getAllByRole('status').length).toBeGreaterThan(0));
    expect(document.querySelector('img[src="/logo.png"].animate-logo-pulse')).not.toBeNull();
  });

  it('guest sees Add to cart and Buy now on a product page', async () => {
    renderAt('/products/1');
    await waitFor(() => expect(screen.getAllByText(/Add to cart/).length).toBeGreaterThan(0));
    expect(screen.getAllByText('Buy now').length).toBeGreaterThan(0);
    expect(screen.queryByText(/signed in as/)).toBeNull();
  });

  it('customer sees Add to cart', async () => {
    login('CUSTOMER');
    renderAt('/products/1');
    await waitFor(() => expect(screen.getAllByText(/Add to cart/).length).toBeGreaterThan(0));
  });

  it('vendor sees an explanation instead of silently missing buttons', async () => {
    login('VENDOR');
    renderAt('/products/1');
    await waitFor(() => expect(screen.getAllByText(/This is your product/).length).toBeGreaterThan(0));
    expect(screen.queryByRole('button', { name: /Add to cart/ })).toBeNull();
    expect(screen.getAllByText(/Log out & shop as a customer/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/You are browsing as/).length).toBeGreaterThan(0);   // banner
  });

  it('vendor browsing the marketplace gets View buttons and the banner', async () => {
    login('VENDOR');
    renderAt('/');
    await waitFor(() => expect(screen.getAllByText('Aura Headphones').length).toBeGreaterThan(0));
    expect(screen.getAllByText('View').length).toBeGreaterThan(0);
    expect(screen.queryByText('Add')).toBeNull();
  });

  it('review form has exactly five stars and needs a rating before submitting', async () => {
    login('CUSTOMER');
    renderAt('/products/1');
    await waitFor(() => expect(screen.getAllByText('Write a review').length).toBeGreaterThan(0));
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    fireEvent.click(screen.getByLabelText('4 stars'));
    expect(screen.getByLabelText('4 stars').getAttribute('aria-checked')).toBe('true');
    expect(screen.getAllByText('Very good').length).toBeGreaterThan(0);
  });

  it('adding to cart shows a quiet note next to the cart icon (no toast)', async () => {
    renderAt('/products/1');
    await waitFor(() => expect(screen.getAllByText(/Add to cart/).length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByRole('button', { name: /Add to cart/ })[0]);
    await waitFor(() => expect(screen.getAllByText('Added to cart').length).toBeGreaterThan(0));
    expect(document.querySelector('a[href="/cart"].animate-scale-in')).not.toBeNull();
  });

  it('vendor sidebar shows a red counter for paid orders waiting', async () => {
    login('VENDOR');
    routes['/api/orders'] = page([{ ...order, id: 9, status: 'PAID' }, { ...order, id: 10, status: 'PAID' }, order]);
    renderAt('/vendor/products');
    await waitFor(() => expect(screen.getAllByLabelText('2 new orders waiting').length).toBeGreaterThan(0));
    expect(document.title).toContain('(2)');
    routes['/api/orders'] = page([order]);
  });

  it('wishlist heart flips straight away and un-loves on the second click', async () => {
    login('CUSTOMER');
    renderAt('/');
    await waitFor(() => expect(screen.getAllByLabelText('Remove from wishlist').length).toBeGreaterThan(0));
    const calls = [];
    let removed = false;
    const original = globalThis.fetch;
    globalThis.fetch = vi.fn(async (url, init) => {
      const path = new URL(url).pathname;
      if (init?.method === 'DELETE') { calls.push(path); removed = true; return new Response(null, { status: 204 }); }
      if (path === '/api/wishlist' && removed) return new Response(JSON.stringify(page([])), { status: 200 });
      return original(url, init);
    });
    fireEvent.click(screen.getAllByLabelText('Remove from wishlist')[0]);
    await waitFor(() => expect(screen.getAllByLabelText('Save to wishlist').length).toBeGreaterThan(0));
    await waitFor(() => expect(calls).toContain('/api/wishlist/1'));
  });

  it('customer bell shows the unread count and opens the latest notifications', async () => {
    login('CUSTOMER');
    renderAt('/');
    await waitFor(() => expect(screen.getAllByLabelText('Notifications, 1 unread').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByLabelText('Notifications, 1 unread')[0]);
    await waitFor(() => expect(screen.getAllByText('Your order is on its way').length).toBeGreaterThan(0));
    expect(screen.getAllByText('View all notifications').length).toBeGreaterThan(0);
  });

  it('customer confirms arrival of a shipped order', async () => {
    login('CUSTOMER');
    routes['/api/orders/5'] = { ...order, status: 'SHIPPED' };
    window.confirm = () => true;
    const puts = [];
    const original = globalThis.fetch;
    globalThis.fetch = vi.fn(async (url, init) => {
      if (init?.method === 'PUT') { puts.push([new URL(url).pathname, init.body]); return new Response(JSON.stringify({ ...order, status: 'DELIVERED' }), { status: 200 }); }
      return original(url, init);
    });
    renderAt('/account/orders/5');
    await waitFor(() => expect(screen.getAllByText('Has your order arrived?').length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByText('I received my order')[0]);
    await waitFor(() => expect(puts).toEqual([['/api/orders/5/status', JSON.stringify({ status: 'DELIVERED' })]]));
    routes['/api/orders/5'] = order;
  });

  it('vendor cannot mark delivered - sees awaiting customer instead', async () => {
    login('VENDOR');
    routes['/api/orders'] = page([{ ...order, id: 12, status: 'SHIPPED' }]);
    renderAt('/vendor/orders');
    await waitFor(() => expect(screen.getAllByText('Awaiting customer').length).toBeGreaterThan(0));
    expect(screen.queryByText('Mark as delivered')).toBeNull();
    routes['/api/orders'] = page([order]);
  });

  it('vendor sidebar shows unread notifications badge', async () => {
    login('VENDOR');
    renderAt('/vendor');
    await waitFor(() => expect(screen.getAllByLabelText('1 unread notifications').length).toBeGreaterThan(0));
  });

  it('forgot password shows the same confirmation and calls the API', async () => {
    const calls = [];
    const original = globalThis.fetch;
    globalThis.fetch = vi.fn(async (url, init) => {
      if (init?.method === 'POST') { calls.push([new URL(url).pathname, init.body]); return new Response(JSON.stringify({ message: 'ok' }), { status: 200 }); }
      return original(url, init);
    });
    renderAt('/forgot-password');
    await waitFor(() => expect(screen.getAllByText('Forgot your password?').length).toBeGreaterThan(0));
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'ada@test.com' } });
    fireEvent.click(screen.getByText('Send reset link'));
    await waitFor(() => expect(screen.getAllByText('Check your email').length).toBeGreaterThan(0));
    expect(calls).toEqual([['/api/auth/forgot-password', JSON.stringify({ email: 'ada@test.com' })]]);
  });

  it('sign in page links to forgot password', async () => {
    renderAt('/login');
    await waitFor(() => expect(screen.getAllByText('Forgot password?').length).toBeGreaterThan(0));
  });

  it('legal pages show the template notice until reviewed, and unknown documents redirect', async () => {
    renderAt('/legal/terms');
    await waitFor(() => expect(screen.getAllByText(/Template\./).length).toBeGreaterThan(0));
    cleanup();
    renderAt('/legal/nonsense');
    await waitFor(() => expect(screen.getAllByText('Cancellations, returns and refunds').length).toBeGreaterThan(0));
  });

  it('creating an account requires agreeing to the terms', async () => {
    renderAt('/register');
    await waitFor(() => expect(screen.getAllByText(/Create your ShopEase account/).length).toBeGreaterThan(0));
    const box = screen.getByRole('checkbox');
    expect(box.required).toBe(true);
    expect(box.checked).toBe(false);
  });

  it('footer links point at the real documents', async () => {
    renderAt('/');
    await waitFor(() => expect(screen.getAllByText('Privacy Policy').length).toBeGreaterThan(0));
    const hrefs = [...document.querySelectorAll('footer a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/legal/privacy');
    expect(hrefs).toContain('/legal/vendors');
    expect(hrefs.some((h) => h.startsWith('mailto:'))).toBe(true);
  });

  it('shows an error page (not a crash) when the API address is wrong and a web page comes back', async () => {
    globalThis.fetch = vi.fn(async () => new Response('<!doctype html><html></html>', { status: 200, headers: { 'Content-Type': 'text/html' } }));
    renderAt('/');
    await waitFor(() => expect(screen.getAllByText('Something went wrong').length).toBeGreaterThan(0));
    expect(screen.getAllByText(/VITE_API_URL/).length).toBeGreaterThan(0);
  });
});
