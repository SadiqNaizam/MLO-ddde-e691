import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  DollarSign, // Generic currency icon if needed, but amount will have symbol
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils.ts for cn exists

interface RecentTransactionItemProps {
  id: string;
  date: string; // e.g., "Oct 26, 2023" or "2023-10-26"
  description: string; // Merchant or transaction details
  amount: number; // Absolute value
  currency?: string; // e.g., "USD", "EUR". Defaults to "USD" if not provided.
  type: 'income' | 'expense'; // To determine color and icon for amount
  status: 'pending' | 'cleared' | 'failed' | 'processing';
}

const RecentTransactionItem: React.FC<RecentTransactionItemProps> = ({
  date,
  description,
  amount,
  currency = 'USD',
  type,
  status,
}) => {
  console.log('RecentTransactionItem loaded for:', description);

  const typeIcon =
    type === 'income' ? (
      <TrendingUp className="h-6 w-6 text-green-500" />
    ) : (
      <TrendingDown className="h-6 w-6 text-red-500" />
    );

  const formattedAmount = new Intl.NumberFormat(undefined, { // Use browser's locale for formatting
    style: 'currency',
    currency: currency,
  }).format(type === 'income' ? amount : -amount); // Show negative for expenses if desired, or keep absolute and rely on color/icon

  const statusConfig = {
    pending: {
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      text: 'Pending',
      color: 'text-yellow-600',
    },
    cleared: {
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      text: 'Cleared',
      color: 'text-green-600',
    },
    failed: {
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      text: 'Failed',
      color: 'text-red-600',
    },
    processing: {
      icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
      text: 'Processing',
      color: 'text-blue-600',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="flex items-center py-3 px-4 hover:bg-gray-50/50 border-b border-gray-200 last:border-b-0">
      <div className="mr-3 flex-shrink-0">{typeIcon}</div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate" title={description}>
          {description}
        </p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
      <div className="ml-4 text-right flex-shrink-0">
        <p
          className={cn(
            "text-sm font-semibold",
            type === 'income' ? 'text-green-600' : 'text-red-600'
          )}
        >
          {formattedAmount}
        </p>
        <div className={cn("text-xs flex items-center justify-end", currentStatus.color)}>
          {currentStatus.icon}
          <span className="ml-1">{currentStatus.text}</span>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactionItem;