import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletCards, History, ArrowRightLeft } from 'lucide-react';

interface AccountSummaryCardWidgetProps {
  accountId: string;
  accountName: string;
  balance: number;
  accountNumber: string; // Full account number, e.g., "123456789012"
  currencySymbol?: string;
  accentColor?: string; // e.g., "bg-blue-500" Tailwind class for top border
}

const AccountSummaryCardWidget: React.FC<AccountSummaryCardWidgetProps> = ({
  accountId,
  accountName,
  balance,
  accountNumber,
  currencySymbol = '$',
  accentColor,
}) => {
  console.log('AccountSummaryCardWidget loaded for account:', accountName, 'ID:', accountId);

  const maskedAccountNumber = `•••• ${accountNumber.slice(-4)}`;

  return (
    <Card className="w-full max-w-md shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {accentColor && <div className={`h-1.5 ${accentColor}`}></div>}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800">{accountName}</CardTitle>
          <WalletCards className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 pt-1">Account No: {maskedAccountNumber}</p>
      </CardHeader>

      <CardContent className="py-4 flex-grow">
        <p className="text-xs text-gray-500 mb-1">Available Balance</p>
        <p className="text-3xl font-bold text-gray-900">
          {currencySymbol}
          {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 pb-4 px-4 border-t bg-slate-50">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
          <Link to="/accounts" state={{ accountId: accountId, accountName: accountName }}>
            <History className="mr-2 h-4 w-4" />
            View Transactions
          </Link>
        </Button>
        <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
          <Link to="/transfers" state={{ fromAccountId: accountId }}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountSummaryCardWidget;