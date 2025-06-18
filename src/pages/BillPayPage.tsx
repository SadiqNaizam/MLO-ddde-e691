import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, PlusCircle, Trash2, Edit, MoreHorizontal } from 'lucide-react';

// Custom Layout Components
import IntegratedHeader from '@/components/layout/IntegratedHeader';
import CollapsibleAnimatedSidebar from '@/components/layout/CollapsibleAnimatedSidebar';
import AppFooter from '@/components/layout/AppFooter';

// Shadcn/ui Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Used if not using FormField with FormLabel
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from '@/components/ui/table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast"; // For form submission feedback
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { cn } from '@/lib/utils';

// Define Zod schema for the payment form
const paymentFormSchema = z.object({
  payeeId: z.string().min(1, "Please select a payee."),
  amount: z.coerce.number().positive("Amount must be a positive number.").min(0.01, "Amount must be at least $0.01."),
  paymentDate: z.date({
    required_error: "A payment date is required.",
  }),
  notes: z.string().max(100, "Notes must be 100 characters or less.").optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// Sample Data
interface Payee {
  id: string;
  name: string;
  accountNumber?: string;
}
const samplePayees: Payee[] = [
  { id: 'payee1', name: 'Stark Electric Co.', accountNumber: 'ELEC-12345' },
  { id: 'payee2', name: 'Wayne Water & Power', accountNumber: 'WWP-67890' },
  { id: 'payee3', name: 'Daily Bugle Subscriptions', accountNumber: 'DBS-11223' },
  { id: 'payee4', name: 'City Gas Company', accountNumber: 'GAS-33445' },
];

interface Bill {
  id: string;
  payeeId: string;
  payeeName: string;
  dueDate: Date;
  amount: number;
  status: 'Scheduled' | 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
}

const initialUpcomingBills: Bill[] = [
  { id: 'bill1', payeeId: 'payee1', payeeName: 'Stark Electric Co.', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), amount: 120.50, status: 'Scheduled' },
  { id: 'bill2', payeeId: 'payee2', payeeName: 'Wayne Water & Power', dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), amount: 75.00, status: 'Scheduled' },
];

const initialPaymentHistory: Bill[] = [
  { id: 'hist1', payeeId: 'payee3', payeeName: 'Daily Bugle Subscriptions', dueDate: new Date(new Date().setDate(new Date().getDate() - 15)), amount: 15.99, status: 'Paid' },
  { id: 'hist2', payeeId: 'payee4', payeeName: 'City Gas Company', dueDate: new Date(new Date().setDate(new Date().getDate() - 30)), amount: 88.20, status: 'Paid' },
  { id: 'hist3', payeeId: 'payee1', payeeName: 'Stark Electric Co.', dueDate: new Date(new Date().setDate(new Date().getDate() - 45)), amount: 115.00, status: 'Paid' },
];

const BillPayPage = () => {
  console.log('BillPayPage loaded');
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>(initialUpcomingBills);
  const [paymentHistory, setPaymentHistory] = useState<Bill[]>(initialPaymentHistory);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      payeeId: '',
      amount: undefined,
      paymentDate: undefined,
      notes: '',
    },
  });

  function onSubmit(data: PaymentFormValues) {
    const selectedPayee = samplePayees.find(p => p.id === data.payeeId);
    if (!selectedPayee) {
        toast({ title: "Error", description: "Invalid payee selected.", variant: "destructive" });
        return;
    }

    const newBill: Bill = {
        id: `bill-${Date.now()}`,
        payeeId: selectedPayee.id,
        payeeName: selectedPayee.name,
        dueDate: data.paymentDate,
        amount: data.amount,
        status: 'Scheduled',
    };
    setUpcomingBills(prev => [newBill, ...prev]);
    toast({
      title: "Payment Scheduled",
      description: `Payment of $${data.amount.toFixed(2)} to ${selectedPayee.name} on ${data.paymentDate.toLocaleDateString()} has been scheduled.`,
    });
    form.reset();
  }

  const cancelScheduledPayment = (billId: string) => {
    const billToCancel = upcomingBills.find(b => b.id === billId);
    if (billToCancel) {
        setUpcomingBills(prev => prev.filter(b => b.id !== billId));
        // Optionally move to payment history with 'Cancelled' status
        setPaymentHistory(prev => [{ ...billToCancel, status: 'Cancelled', dueDate: new Date() }, ...prev]);
        toast({ title: "Payment Cancelled", description: `Payment to ${billToCancel.payeeName} has been cancelled.`});
    }
  };
  
  const getStatusBadgeVariant = (status: Bill['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Paid':
        return 'default'; // Typically green, but shadcn default is primary
      case 'Scheduled':
      case 'Pending':
        return 'secondary'; // Typically yellow/blue
      case 'Failed':
      case 'Cancelled':
        return 'destructive'; // Typically red
      default:
        return 'outline';
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-muted/40 text-foreground">
      <IntegratedHeader />
      <CollapsibleAnimatedSidebar /> {/* Manages its own state, fixed position */}

      {/* Main content: Offset for header (h-16 -> pt-16) and sidebar (w-60 -> md:pl-60) */}
      <div className="flex-1 md:pl-60 pt-16">
        <ScrollArea className="h-[calc(100vh-4rem)]"> {/* Adjust height to fill space below header */}
          <main className="p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Bill Payment Center</h1>
                {/* Can add a button like "Add New Payee" if form only schedules */}
            </div>

            {/* Card 1: Schedule a Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule a Payment</CardTitle>
                <CardDescription>
                  Select a payee, enter payment details, and schedule your bill payment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="payeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payee</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a payee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {samplePayees.map(payee => (
                                <SelectItem key={payee.id} value={payee.id}>
                                  {payee.name} ({payee.accountNumber})
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
                            <Input type="number" placeholder="e.g., 50.00" {...field} step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Payment Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full sm:w-[280px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    field.value.toLocaleDateString()
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Monthly bill" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4"/> Schedule Payment
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Card 2: Upcoming Bills */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bills</CardTitle>
                <CardDescription>Review and manage your scheduled payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payee</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingBills.length > 0 ? upcomingBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.payeeName}</TableCell>
                        <TableCell>{bill.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">${bill.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(bill.status)}>{bill.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {bill.status === 'Scheduled' && (
                                <>
                                <DropdownMenuItem onClick={() => alert(`Editing bill ID: ${bill.id} (not implemented)`)}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => cancelScheduledPayment(bill.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                  <Trash2 className="mr-2 h-4 w-4" /> Cancel Payment
                                </DropdownMenuItem>
                                </>
                              )}
                               <DropdownMenuItem onClick={() => alert(`Viewing details for bill ID: ${bill.id} (not implemented)`)}>
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No upcoming bills.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Card 3: Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your past bill payments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payee</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {paymentHistory.length > 0 ? paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.payeeName}</TableCell>
                        <TableCell>{payment.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getStatusBadgeVariant(payment.status)}>{payment.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">No payment history found.</TableCell>
                        </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
               {paymentHistory.length > 0 && (
                <CardFooter className="justify-center border-t pt-4">
                    <Button variant="outline" size="sm">View All Payment History</Button>
                </CardFooter>
               )}
            </Card>

          </main>
        </ScrollArea>
      </div>
      <AppFooter />
    </div>
  );
};

export default BillPayPage;