import { Link } from 'react-router-dom';
import { Logo } from './ui';

/** Centered card layout shared by the small auth pages (forgot / reset password). */
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen animate-fade-in bg-gradient-to-br from-brand-50/60 via-white to-violet-50/60">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/"><Logo className="h-8" /></Link>
        <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-700">← Back to sign in</Link>
      </header>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="card animate-page p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
