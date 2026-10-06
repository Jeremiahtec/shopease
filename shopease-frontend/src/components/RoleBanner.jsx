import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { roleHome } from '../lib/format';

/** Vendors and admins can browse the marketplace but cannot buy, so say so instead of silently hiding the cart. */
export default function RoleBanner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);

  if (!user || user.role === 'CUSTOMER' || hidden) return null;
  const vendor = user.role === 'VENDOR';

  return (
    <div className="animate-fade-in border-b border-brand-100 bg-brand-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-xs text-brand-700 sm:px-6">
        <Info className="h-4 w-4 shrink-0" />
        <span>
          You are browsing as <b>{user.fullName}</b> ({vendor ? 'vendor' : 'admin'}). {vendor ? 'Vendor' : 'Admin'} accounts
          cannot buy; use a customer account to shop.
        </span>
        <Link to={roleHome(user.role)} className="font-bold underline">
          Go to {vendor ? 'vendor hub' : 'admin console'}
        </Link>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="font-bold underline"
        >
          Log out
        </button>
        <button onClick={() => setHidden(true)} className="ml-auto rounded p-0.5 hover:bg-brand-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
