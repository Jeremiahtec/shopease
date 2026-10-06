import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { PageLoader } from './ui';

/**
 * Wraps the routed page: every navigation fades/slides the new page in, and pages that are still
 * downloading (code-split) show the branded loader instead of a blank screen.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-page">
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </div>
  );
}
