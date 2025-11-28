import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'processing' | 'completed' | 'failed';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    processing: {
      icon: Loader2,
      label: 'Processing',
      className: 'bg-blue-100 text-blue-700',
      iconClassName: 'animate-spin',
    },
    completed: {
      icon: CheckCircle2,
      label: 'Completed',
      className: 'bg-green-100 text-green-700',
      iconClassName: '',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      className: 'bg-red-100 text-red-700',
      iconClassName: '',
    },
  };

  const { icon: Icon, label, className, iconClassName } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      <Icon size={16} className={iconClassName} />
      {label}
    </span>
  );
}
