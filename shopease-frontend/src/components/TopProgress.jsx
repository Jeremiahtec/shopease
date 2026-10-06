import { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/** Slim animated bar at the top of the screen whenever the app is talking to the server. */
export default function TopProgress() {
  // background polling queries are tagged meta.silent and should not trigger the bar
  const busy = useIsFetching({ predicate: (query) => !query.meta?.silent }) + useIsMutating() > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // small delay on the way in so instant requests never flash the bar
    const timer = setTimeout(() => setVisible(busy), busy ? 150 : 300);
    return () => clearTimeout(timer);
  }, [busy]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] overflow-hidden transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="h-full w-2/5 animate-bar rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-violet-500" />
    </div>
  );
}
