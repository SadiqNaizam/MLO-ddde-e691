import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

// Custom Components
import IntegratedHeader from '@/components/layout/IntegratedHeader';
import CollapsibleAnimatedSidebar from '@/components/layout/CollapsibleAnimatedSidebar';
import AppFooter from '@/components/layout/AppFooter';
import InteractiveFinancialChart, { ChartConfig } from '@/components/InteractiveFinancialChart';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For potential filtering

// Lucide Icons
import { ArrowLeft, Settings as SettingsIcon, CreditCard, Eye, Download, ListFilter, Search as SearchIcon, DollarSign, AlertCircle, FileText } from 'lucide-react';

// Define types for data structures
interface Account {
  id: string;
  name: string;
  number: string; // Masked usually, e.g., "**** 1234"
  balance: number;
  currency: string;
  type: 'checking' | 'savings' | 'credit';
  accentColor?: string; // For UI flair, e.g., 'bg-blue-500'
  limit?: number; // For credit cards
  transactions?: Transaction[]; // Loaded on demand or pre-fetched
  spendingData?: SpendingCategory[];
}

interface Transaction {
  id: string;
  date: string; // "YYYY-MM-DD"
  description: string;
  amount: number; // Positive for income, negative for expense
  status: 'Cleared' | 'Pending' | 'Failed';
  category?: string; // Optional: for spending analysis
}

interface SpendingCategory {
  category: string;
  amount: number;
  fill?: string; // For chart color
}

// Sample Data
const userAccountsData: Account[] = [
  { id: 'acc_chk_001', name: 'Primary Checking', number: '•••• 1234', balance: 10530.75, currency: '$', type: 'checking', accentColor: 'bg-sky-600',
    transactions: [
      { id: 'txn_c001', date: '2024-07-28', description: 'Online Groceries - InstaMart', amount: -75.99, status: 'Cleared', category: 'Groceries' },
      { id: 'txn_c002', date: '2024-07-27', description: 'Salary Deposit - Tech Solutions LLC', amount: 3200.00, status: 'Cleared', category: 'Income' },
      { id: 'txn_c003', date: '2024-07-26', description: 'Coffee Shop - The Beanery', amount: -5.25, status: 'Cleared', category: 'Dining' },
      { id: 'txn_c004', date: '2024-07-25', description: 'ATM Withdrawal', amount: -100.00, status: 'Cleared', category: 'Cash' },
      { id: 'txn_c005', date: '2024-07-24', description: 'Utility Bill - Power Co.', amount: -120.50, status: 'Pending', category: 'Utilities' },
    ],
    spendingData: [
      { category: 'Groceries', amount: 350.50, fill: 'hsl(var(--chart-1))' },
      { category: 'Dining', amount: 220.75, fill: 'hsl(var(--chart-2))' },
      { category: 'Utilities', amount: 180.00, fill: 'hsl(var(--chart-3))' },
      { category: 'Shopping', amount: 450.00, fill: 'hsl(var(--chart-4))' },
      { category: 'Other', amount: 90.25, fill: 'hsl(var(--chart-5))' },
    ]
  },
  { id: 'acc_sav_001', name: 'Rainy Day Savings', number: '•••• 5678', balance: 25100.20, currency: '$', type: 'savings', accentColor: 'bg-emerald-600',
    transactions: [
      { id: 'txn_s001', date: '2024-07-15', description: 'Interest Earned', amount: 50.20, status: 'Cleared', category: 'Interest' },
      { id: 'txn_s002', date: '2024-07-01', description: 'Transfer from Checking', amount: 500.00, status: 'Cleared', category: 'Transfer' },
    ],
    spendingData: [ // Less spending from savings, more income/transfers
        { category: 'Interest', amount: 150.60, fill: 'hsl(var(--chart-1))' },
        { category: 'Transfers In', amount: 1500.00, fill: 'hsl(var(--chart-2))' },
    ]
  },
  { id: 'acc_cc_001', name: 'Travel Rewards Card', number: '•••• 9012', balance: -1250.45, currency: '$', type: 'credit', limit: 15000, accentColor: 'bg-violet-600',
    transactions: [
      { id: 'txn_cr001', date: '2024-07-20', description: 'Airline Ticket - SkyHigh Airways', amount: -450.99, status: 'Cleared', category: 'Travel' },
      { id: 'txn_cr002', date: '2024-07-18', description: 'Hotel Booking - Comfy Stays', amount: -280.00, status: 'Pending', category: 'Travel' },
      { id: 'txn_cr003', date: '2024-07-10', description: 'Payment Received - Thank You', amount: 1000.00, status: 'Cleared', category: 'Payment' },
    ],
    spendingData: [
      { category: 'Travel', amount: 1200.50, fill: 'hsl(var(--chart-1))' },
      { category: 'Dining', amount: 300.75, fill: 'hsl(var(--chart-2))' },
      { category: 'Shopping', amount: 250.00, fill: 'hsl(var(--chart-3))' },
    ]
  },
];

const spendingChartBaseConfig: ChartConfig = {
  amount: { label: 'Amount', color: 'hsl(var(--primary))' },
};


const AccountsPage: React.FC = () => {
  console.log('AccountsPage loaded');
  const location = useLocation();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const state = location.state as { accountId?: string };
    if (state?.accountId) {
      setSelectedAccountId(state.accountId);
      // Clear state after using it to prevent re-triggering if user navigates away and back
      window.history.replaceState({}, document.title) 
    }
  }, [location.state]);

  const selectedAccount = useMemo(() => {
    return userAccountsData.find(acc => acc.id === selectedAccountId) || null;
  }, [selectedAccountId]);

  const filteredTransactions = useMemo(() => {
    if (!selectedAccount?.transactions) return [];
    return selectedAccount.transactions.filter(tx =>
      tx.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedAccount, searchTerm]);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const getTransactionStatusVariant = (status: Transaction['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Cleared': return 'default'; // Typically green, but shadcn default is primary.
      case 'Pending': return 'secondary'; // Typically yellow/orange.
      case 'Failed': return 'destructive'; // Typically red.
      default: return 'outline';
    }
  };

  if (selectedAccount) {
    // Detailed Account View
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <IntegratedHeader />
        <div className="flex flex-1">
          <CollapsibleAnimatedSidebar />
          <div className="flex-1 lg:pl-[15rem] pl-[4rem] transition-all duration-300 ease-in-out"> {/* Adjust pl based on sidebar state */}
            <ScrollArea className="h-[calc(100vh_-_4rem)]"> {/* Assuming header is h-16 (4rem) */}
              <main className="p-4 sm:p-6 lg:p-8">
                <Button variant="outline" onClick={() => setSelectedAccountId(null)} className="mb-6">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Accounts
                </Button>

                <Card className="mb-8 shadow-lg">
                  <CardHeader className={`p-6 ${selectedAccount.accentColor || 'bg-muted'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl font-bold text-white">{selectedAccount.name}</CardTitle>
                            <CardDescription className="text-sm text-slate-200">
                                Account No: {selectedAccount.number}
                            </CardDescription>
                        </div>
                        {selectedAccount.type === 'checking' && <DollarSign className="h-8 w-8 text-slate-200" />}
                        {selectedAccount.type === 'savings' && <DollarSign className="h-8 w-8 text-slate-200" />}
                        {selectedAccount.type === 'credit' && <CreditCard className="h-8 w-8 text-slate-200" />}
                    </div>
                    <div className="mt-4">
                        <p className="text-xs text-slate-200">Available Balance</p>
                        <p className="text-3xl font-extrabold text-white">
                            {selectedAccount.currency}
                            {selectedAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {selectedAccount.type === 'credit' && selectedAccount.limit && (
                            <p className="text-xs text-slate-200 mt-1">
                                Credit Limit: {selectedAccount.currency}{selectedAccount.limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        )}
                    </div>
                  </CardHeader>
                </Card>

                <Tabs defaultValue="transactions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-6">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="analysis">Spending Analysis</TabsTrigger>
                    <TabsTrigger value="settings">Details & Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transactions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Recent transactions for this account.</CardDescription>
                        <div className="mt-4 relative">
                          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full md:w-1/2 lg:w-1/3"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTransactions.length > 0 ? (
                              filteredTransactions.map(tx => (
                                <TableRow key={tx.id}>
                                  <TableCell className="font-medium">{new Date(tx.date).toLocaleDateString()}</TableCell>
                                  <TableCell>{tx.description}</TableCell>
                                  <TableCell className={`text-right font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}
                                    {selectedAccount.currency}
                                    {Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant={getTransactionStatusVariant(tx.status)}>{tx.status}</Badge>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                  No transactions found{searchTerm ? ' matching your search' : ''}.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analysis">
                    <Card>
                      <CardHeader>
                        <CardTitle>Spending Analysis</CardTitle>
                        <CardDescription>Visual breakdown of your spending patterns.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedAccount.spendingData && selectedAccount.spendingData.length > 0 ? (
                          <InteractiveFinancialChart
                            chartType="pie"
                            data={selectedAccount.spendingData}
                            chartConfig={spendingChartBaseConfig} // Individual colors are in spendingData via 'fill'
                            categoryKey="category" // This will be the nameKey for Pie segments
                            dataKeys={["amount"]} // This will be the dataKey for Pie values
                            title="Spending by Category"
                            height="400px"
                            showBarLabels={true} // Enables percentage labels for Pie if large enough
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
                            <AlertCircle className="w-12 h-12 mb-4" />
                            <p>No spending data available for analysis.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Details & Settings</CardTitle>
                        <CardDescription>Manage your account preferences and information.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-2">Account Information</h3>
                          <p><strong>Account Holder:</strong> John Doe (Sample)</p>
                          <p><strong>Account Type:</strong> {selectedAccount.type.charAt(0).toUpperCase() + selectedAccount.type.slice(1)}</p>
                          <p><strong>Opened On:</strong> January 15, 2020 (Sample)</p>
                        </div>
                        <div className="space-x-2">
                            <Button variant="outline"><FileText className="mr-2 h-4 w-4" />Download Statement</Button>
                            {selectedAccount.type === 'credit' && <Button variant="outline"><CreditCard className="mr-2 h-4 w-4" />Manage Card</Button>}
                            <Button variant="outline"><AlertCircle className="mr-2 h-4 w-4" />Setup Alerts</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </main>
            </ScrollArea>
          </div>
        </div>
        <AppFooter />
      </div>
    );
  }

  // Account List View
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <IntegratedHeader />
      <div className="flex flex-1">
        <CollapsibleAnimatedSidebar />
        <div className="flex-1 lg:pl-[15rem] pl-[4rem] transition-all duration-300 ease-in-out"> {/* Adjust pl based on sidebar state */}
          <ScrollArea className="h-[calc(100vh_-_4rem)]"> {/* Assuming header is h-16 (4rem) */}
            <main className="p-4 sm:p-6 lg:p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Your Accounts</h1>
                <p className="text-sm text-muted-foreground">
                  Select an account to view details, transactions, and manage settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userAccountsData.map(account => (
                  <Card 
                    key={account.id} 
                    className="shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col"
                    onClick={() => handleAccountSelect(account.id)}
                  >
                    <CardHeader className={`pb-3 ${account.accentColor || 'bg-muted'}`}>
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-white">{account.name}</CardTitle>
                            {account.type === 'checking' && <DollarSign className="h-6 w-6 text-slate-200" />}
                            {account.type === 'savings' && <DollarSign className="h-6 w-6 text-slate-200" />}
                            {account.type === 'credit' && <CreditCard className="h-6 w-6 text-slate-200" />}
                        </div>
                        <p className="text-xs text-slate-200 pt-1">{account.number}</p>
                    </CardHeader>
                    <CardContent className="pt-4 pb-2 flex-grow">
                      <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                      <p className="text-2xl font-bold text-foreground">
                        {account.currency}
                        {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {account.type === 'credit' && account.limit && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Limit: {account.currency}{account.limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3 pb-4 border-t">
                        <Button variant="link" className="p-0 h-auto text-sm">
                            View Details <Eye className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>
      <AppFooter />
    </div>
  );
};

export default AccountsPage;