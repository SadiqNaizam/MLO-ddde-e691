import React from 'react';
import { useLocation } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, ArrowRightLeft } from "lucide-react";

// Custom Components
import IntegratedHeader from '@/components/layout/IntegratedHeader';
import CollapsibleAnimatedSidebar from '@/components/layout/CollapsibleAnimatedSidebar';
import AppFooter from '@/components/layout/AppFooter';

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// Transfer form schema
const transferFormSchema = z.object({
  fromAccountId: z.string().min(1, "Please select a source account."),
  toAccountId: z.string().min(1, "Please select a destination account."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  scheduledDate: z.date().optional(),
  memo: z.string().max(100, "Memo cannot exceed 100 characters.").optional(),
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: "Source and destination accounts cannot be the same.",
  path: ["toAccountId"],
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

// Placeholder data
const userAccounts = [
  { id: "acc_chk_001", name: "Primary Checking (•••• 1234)", balance: 5250.75 },
  { id: "acc_sav_002", name: "High-Yield Savings (•••• 5678)", balance: 12800.20 },
  { id: "acc_inv_003", name: "Investment Portfolio (•••• 9012)", balance: 75000.00 },
];

const transferHistory = [
  { id: "txn_1", date: "2024-07-20", from: "Primary Checking", to: "High-Yield Savings", amount: 500.00, status: "Completed", memo: "Monthly savings" },
  { id: "txn_2", date: "2024-07-15", from: "High-Yield Savings", to: "External ACME Corp (•••• 1122)", amount: 120.50, status: "Completed", memo: "Utility Bill" },
  { id: "txn_3", date: "2024-07-28", from: "Primary Checking", to: "John Doe (Zelle)", amount: 75.00, status: "Pending", memo: "Lunch" },
  { id: "txn_4", date: "2024-07-01", from: "Investment Portfolio", to: "Primary Checking", amount: 1000.00, status: "Failed", memo: "Dividend Payout" },
];

const TransfersPage = () => {
  console.log('TransfersPage loaded');
  const location = useLocation();
  const { toast } = useToast();
  const { fromAccountId: initialFromAccountId } = (location.state as { fromAccountId?: string } || {});

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      fromAccountId: initialFromAccountId || "",
      toAccountId: "",
      amount: undefined,
      scheduledDate: undefined,
      memo: "",
    },
  });

  function onSubmit(data: TransferFormValues) {
    console.log("Transfer data submitted:", data);
    const fromAccount = userAccounts.find(acc => acc.id === data.fromAccountId)?.name || data.fromAccountId;
    const toAccount = userAccounts.find(acc => acc.id === data.toAccountId)?.name || data.toAccountId;
    
    toast({
      title: "Transfer Initiated",
      description: `Transferring ${data.amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} from ${fromAccount} to ${toAccount} ${data.scheduledDate ? `on ${format(data.scheduledDate, "PPP")}` : 'immediately'}.`,
    });
    // Here you would typically call an API
    // For demo, we add to history if not scheduled, or just log if scheduled
    if (!data.scheduledDate) {
        transferHistory.unshift({ // Add to the start of the array
            id: `txn_${Date.now()}`,
            date: format(new Date(), "yyyy-MM-dd"),
            from: fromAccount,
            to: toAccount,
            amount: data.amount,
            status: "Processing",
            memo: data.memo || "User Transfer"
        });
    }
    form.reset();
  }

  return (
    <div className="relative min-h-screen bg-muted/40">
      <IntegratedHeader />
      <CollapsibleAnimatedSidebar />
      
      <main className="md:pl-60 pt-16 flex flex-col min-h-[calc(100vh-4rem)]"> {/* Adjust pl for expanded sidebar, pt for header. min-h to push footer. */}
        {/* Content Wrapper */}
        <div className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center">
              <ArrowRightLeft className="mr-3 h-6 w-6 text-primary" />
              Fund Transfers
            </h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {/* Transfer Form Section */}
            <Card className="lg:col-span-3 shadow-lg">
              <CardHeader>
                <CardTitle>Initiate New Transfer</CardTitle>
                <CardDescription>
                  Securely move funds between your accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fromAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select source account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userAccounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name} - Bal: ${account.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="toAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Account</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select destination account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {userAccounts.map(account => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Scheduled Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Leave blank to transfer immediately.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="memo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Memo (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g., For monthly savings" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full">Review and Transfer</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Transfer History Section */}
            <Card className="lg:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle>Transfer History</CardTitle>
                <CardDescription>View your recent and pending transfers.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] md:h-[500px]">
                  <Table>
                    <TableCaption>A list of your recent transfers.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Date</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transferHistory.length > 0 ? transferHistory.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell className="font-medium text-xs">{transfer.date}</TableCell>
                          <TableCell>
                              <div className="font-medium text-sm break-all">{transfer.memo || "Transfer"}</div>
                              <div className="text-xs text-muted-foreground break-all">From: {transfer.from}</div>
                              <div className="text-xs text-muted-foreground break-all">To: {transfer.to}</div>
                          </TableCell>
                          <TableCell className="text-right">${transfer.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell>
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full inline-block",
                              transfer.status === "Completed" && "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100",
                              transfer.status === "Pending" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100",
                              transfer.status === "Processing" && "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100",
                              transfer.status === "Failed" && "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                            )}>
                              {transfer.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No transfer history found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <AppFooter />
      </main>
    </div>
  );
};

export default TransfersPage;