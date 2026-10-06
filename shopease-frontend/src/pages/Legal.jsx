import { useEffect } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { COMPANY, LEGAL_REVIEWED, LEGAL_UPDATED, SUPPORT_EMAIL } from '../lib/legalConfig';
import { HELP, PRIVACY, TERMS, VENDORS } from '../lib/legalContent';

const DOCS = {
  terms: { label: 'Terms of Service', title: 'Terms of Service', sections: TERMS, intro: `The rules for using ${COMPANY} as a customer.` },
  privacy: { label: 'Privacy Policy', title: 'Privacy Policy', sections: PRIVACY, intro: 'What personal data we collect, why, and your rights.' },
  vendors: { label: 'Vendor Terms', title: 'Vendor Terms', sections: VENDORS, intro: 'The rules for selling on ShopEase.' },
  help: { label: 'Help Center', title: 'Help Center', sections: HELP, intro: 'Quick answers to common questions.' },
};

function Block({ block }) {
  if (typeof block === 'string') return <p className="mt-3 text-sm leading-relaxed text-slate-600">{block}</p>;
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
      {block.list.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export default function Legal() {
  const { doc = 'terms' } = useParams();
  const { hash } = useLocation();
  const current = DOCS[doc];

  // jump to #security etc. after the page has rendered
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, doc]);

  if (!current) return <Navigate to="/legal/terms" replace />;
  const numbered = doc !== 'help';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Legal & help</p>
      <h1 className="mt-1 text-3xl font-extrabold">{current.title}</h1>
      <p className="mt-1 text-sm text-slate-500">{current.intro} {numbered && <>Last updated {LEGAL_UPDATED}.</>}</p>

      {!LEGAL_REVIEWED && numbered && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            <b>Template.</b> This text is a starting point written for ShopEase. Have a Nigerian lawyer review it and fill in your company details
            before launch, then set <code>VITE_LEGAL_REVIEWED=true</code> to remove this notice.
          </p>
        </div>
      )}

      <nav className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" aria-label="Legal documents">
        {Object.entries(DOCS).map(([key, d]) => (
          <Link
            key={key}
            to={`/legal/${key}`}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-colors ${key === doc ? 'bg-white text-brand-700 shadow-card' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {d.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-24 p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">On this page</p>
            <ul className="space-y-1 text-sm">
              {current.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-md px-2 py-1 text-slate-600 hover:bg-slate-50 hover:text-brand-700">
                    {numbered ? `${i + 1}. ` : ''}{s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="card divide-y divide-slate-100">
          {current.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 p-6">
              <h2 className="text-lg font-bold">
                {numbered && <span className="mr-2 text-brand-600">{String(i + 1).padStart(2, '0')}</span>}
                {s.title}
              </h2>
              {s.body.map((block, idx) => <Block key={idx} block={block} />)}
            </section>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        Still need help? Email <a className="font-semibold text-brand-600 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </div>
  );
}
