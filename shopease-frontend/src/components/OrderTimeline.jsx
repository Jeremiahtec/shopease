import { Check, Package, Truck, Wallet, Clock, Cog, XCircle } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', title: 'Order placed', text: 'Your order is waiting for payment.', icon: Clock },
  { key: 'PAID', title: 'Payment received', text: 'Payment was verified successfully.', icon: Wallet },
  { key: 'PROCESSING', title: 'Processing', text: 'The vendor is preparing your items.', icon: Cog },
  { key: 'SHIPPED', title: 'Shipped', text: 'Your parcel is on its way. Confirm below once it arrives.', icon: Truck },
  { key: 'DELIVERED', title: 'Delivered', text: 'Arrival confirmed by you.', icon: Package },
];

export default function OrderTimeline({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
        <XCircle className="h-5 w-5 shrink-0" />
        This order was cancelled. Reserved stock has been released.
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);

  return (
    <ol>
      {STEPS.map((step, index) => {
        const done = index < current || status === 'DELIVERED';
        const active = index === current && status !== 'DELIVERED';
        const Icon = step.icon;
        const circle = done
          ? 'bg-brand-600 text-white'
          : active
            ? 'bg-brand-600 text-white ring-4 ring-brand-100'
            : 'bg-slate-100 text-slate-400';
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {index < STEPS.length - 1 && (
              <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${index < current ? 'bg-brand-600' : 'bg-slate-200'}`} />
            )}
            <span className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${circle}`}>
              {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-bold ${done || active ? 'text-slate-900' : 'text-slate-400'}`}>
                {index + 1}. {step.title}
                {active && (
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">Current</span>
                )}
              </p>
              <p className={`text-sm ${done || active ? 'text-slate-500' : 'text-slate-400'}`}>{step.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
