import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../lib/legalConfig';
import { Logo } from './ui';

const LINKS = [
  { label: 'Terms of Service', to: '/legal/terms' },
  { label: 'Privacy Policy', to: '/legal/privacy' },
  { label: 'Vendor Terms', to: '/legal/vendors' },
  { label: 'Security', to: '/legal/privacy#security' },
  { label: 'Help Center', to: '/legal/help' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row">
        <div className="flex items-center gap-3">
          <Logo className="h-6" />
          <span>© {new Date().getFullYear()} ShopEase Marketplace. Built for modern vendors and smart shoppers.</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 font-medium">
          {LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="hover:text-brand-700">{label}</Link>
          ))}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-brand-700">Contact Support</a>
        </nav>
      </div>
    </footer>
  );
}
