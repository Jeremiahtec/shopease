import { Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderTimeline from '../../components/OrderTimeline';
import { Button, Modal, StatusBadge } from '../../components/ui';

export default function TrackModal({ order, onClose }) {
  return (
    <Modal
      open={Boolean(order)}
      onClose={onClose}
      title={order ? `Tracking order #${order.id}` : ''}
      subtitle="Follow your order from payment to delivery"
      footer={
        <>
          <Link to={order ? `/account/orders/${order.id}` : '#'} className="mr-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
            <Download className="h-4 w-4" /> Open full receipt
          </Link>
          <Button onClick={onClose}>Dismiss</Button>
        </>
      }
    >
      {order && (
        <>
          <div className="mb-5 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-600">Current status</span>
            <StatusBadge status={order.status} />
          </div>
          <OrderTimeline status={order.status} />
        </>
      )}
    </Modal>
  );
}
