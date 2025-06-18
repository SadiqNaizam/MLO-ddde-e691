import React from 'react';
import { Link } from 'react-router-dom';

// Custom Components
import IntegratedHeader from '@/components/layout/IntegratedHeader';
import CollapsibleAnimatedSidebar from '@/components/layout/CollapsibleAnimatedSidebar';
import AccountSummaryCardWidget from '@/components/AccountSummaryCardWidget';
import RecentTransactionItem from '@/components/RecentTransactionItem';
import InteractiveFinancialChart, { type ChartConfig as FinancialChartConfig } from '@/components/InteractiveFinancialChart';
import AppFooter from '@/components/layout/AppFooter';

// Shadcn/ui Components
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // For any additional buttons if needed

const DashboardOverviewPage: React.FC = () => {
  console.log('DashboardOverviewPage loaded');

  // Sample data for components
  const accountSummaries = [
    { accountId: "acc_chk_001", accountName: "Primary Checking", balance: 12530.75, accountNumber: "1111222233334444", accentColor: "bg-blue-600" },
    { accountId: "acc_sav_002", accountName: "High-Yield Savings", balance: 55870.20, accountNumber: "5555666677778888", accentColor: "bg-green-600" },
    { accountId: "acc_crd_003", accountName: "Platinum Rewards Card", balance: -750.45, accountNumber: "9999000011112222", accentColor: "bg-indigo-600" },
  ];

  const recentTransactions = [
    { id: "txn_1", date: "Oct 28, 2023", description: "Netflix Subscription Renewal", amount: 15.99, currency: "USD", type: "expense" as const, status: "cleared" as const },
    { id: "txn_2", date: "Oct 27, 2023", description: "Salary Deposit - Innovatech Ltd.", amount: 2850.00, currency: "USD", type: "income" as const, status: "cleared" as const },
    { id: "txn_3", date: "Oct 26, 2023", description: "Groceries at Local Market", amount: 85.40, currency: "USD", type: "expense" as const, status: "pending" as const },
    { id: "txn_4", date: "Oct 25, 2023", description: "Transfer to Savings Account", amount: 500.00, currency: "USD", type: "expense" as const, status: "processing" as const },
    { id: "txn_5", date: "Oct 24, 2023", description: "Coffee Shop Meeting", amount: 12.75, currency: "USD", type: "expense" as const, status: "cleared" as const },
  ];

  const spendingChartData = [
    { category: "Groceries", value: 350 },
    { category: "Utilities", value: 180 },
    { category: "Dining Out", value: 280 },
    { category: "Transport", value: 120 },
    { category: "Shopping", value: 450 },
    { category: "Entertainment", value: 150 },
  ];

  const spendingChartConfig = {
    value: { label: "Spending" }, // Default label for values if not specified per category
    Groceries: { label: "Groceries", color: "hsl(var(--chart-1))" },
    Utilities: { label: "Utilities", color: "hsl(var(--chart-2))" },
    "Dining Out": { label: "Dining Out", color: "hsl(var(--chart-3))" },
    Transport: { label: "Transport", color: "hsl(var(--chart-4))" },
    Shopping: { label: "Shopping", color: "hsl(var(--chart-5))" },
    Entertainment: { label: "Entertainment", color: "hsl(var(--chart-1) / 0.7)"},
  } satisfies FinancialChartConfig;

  return (
    <div className="flex min-h-screen bg-muted/20 dark:bg-muted/40">
      <CollapsibleAnimatedSidebar /> {/* Fixed position, manages its own state */}

      {/* Main content area, offset by sidebar width */}
      {/* ml-16 for collapsed sidebar (w-16), ml-60 for expanded sidebar (w-60) on md+ screens */}
      {/* This requires JS to toggle a class on a parent or CSS vars, for simplicity we use fixed large margin */}
      <div className="flex-1 flex flex-col ml-16 lg:ml-60 transition-all duration-300 ease-in-out">
        <IntegratedHeader /> {/* Sticky header */}
        
        <ScrollArea className="flex-1 bg-background dark:bg-background-muted shadow-inner">
          <main className="p-4 py-6 sm:p-6 lg:p-8 space-y-8">
            {/* Section 1: Welcome & Quick Actions (Optional) */}
            <section aria-labelledby="dashboard-welcome-title">
                <div className="p-6 bg-gradient-to-r from-primary to-primary/80 rounded-lg shadow-md text-primary-foreground">
                    <h2 id="dashboard-welcome-title" className="text-3xl font-bold">Welcome Back!</h2>
                    <p className="mt-1 text-lg opacity-90">Here's your financial overview for today.</p>
                     <div className="mt-4 flex flex-wrap gap-3">
                        <Button variant="secondary" asChild>
                            <Link to="/transfers">Make a Transfer</Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link to="/bill-pay">Pay a Bill</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Section 2: Account Summaries */}
            <section aria-labelledby="dashboard-account-summaries-title">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 id="dashboard-account-summaries-title" className="text-2xl font-semibold text-foreground">
                  Account Summaries
                </h3>
                <Button variant="link" asChild className="px-0">
                  <Link to="/accounts">View All Accounts &rarr;</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {accountSummaries.map(account => (
                  <AccountSummaryCardWidget key={account.accountId} {...account} />
                ))}
              </div>
            </section>

            {/* Section 3: Recent Activity & Spending Overview (Side-by-side) */}
            <section aria-labelledby="dashboard-activity-title" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Recent Transactions List */}
              <div className="lg:col-span-3">
                <Card className="h-full flex flex-col shadow-lg">
                  <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <CardTitle id="dashboard-recent-transactions-title" className="text-xl">Recent Transactions</CardTitle>
                      <Button variant="link" asChild className="px-0">
                        <Link to="/accounts">View All Transactions &rarr;</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-0">
                    <ScrollArea className="h-[350px] sm:h-[400px]"> {/* Fixed height for scrollable transaction list */}
                      {recentTransactions.length > 0 ? (
                        recentTransactions.map(tx => <RecentTransactionItem key={tx.id} {...tx} />)
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground text-center">No recent transactions to display.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Spending Analysis Chart */}
              <div className="lg:col-span-2">
                <InteractiveFinancialChart
                  chartType="pie"
                  data={spendingChartData}
                  chartConfig={spendingChartConfig}
                  categoryKey="category"
                  dataKeys={["value"]}
                  title="Spending Overview"
                  description="Monthly expense breakdown by category."
                  height="400px" // Match approximate height of transactions card + header
                  showLegend={true}
                  showBarLabels={true} // Enable labels on pie chart
                  onElementClick={(payload, index) => {
                    if (payload && payload.category) {
                      console.log(`Clicked on chart slice: ${payload.category}, Value: ${payload.value}, Index: ${index}`);
                      // Example: navigate to transactions filtered by this category
                      // navigate(`/accounts?filterCategory=${payload.category}`);
                    }
                  }}
                  className="shadow-lg"
                />
              </div>
            </section>
            
          </main>
        </ScrollArea>
        <AppFooter />
      </div>
    </div>
  );
};

export default DashboardOverviewPage;