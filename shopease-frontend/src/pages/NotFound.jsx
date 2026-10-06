import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui';

export default function NotFound() {
  return (
    <EmptyState icon={Compass} title="Page not found" description="The page you are looking for does not exist or has moved.">
      <Link to="/" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Back to marketplace</Link>
    </EmptyState>
  );
}
