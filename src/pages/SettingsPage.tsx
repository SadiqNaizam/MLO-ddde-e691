import React from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";

// Custom Layout Components
import IntegratedHeader from '@/components/layout/IntegratedHeader';
import CollapsibleAnimatedSidebar from '@/components/layout/CollapsibleAnimatedSidebar';
import AppFooter from '@/components/layout/AppFooter';

// Shadcn/ui Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast"; // For form submission feedback

// Lucide Icons (optional, can be added within specific forms if needed)
import { UserCog, BellRing, ShieldCheck, Palette, Save } from 'lucide-react';

// Define Zod Schemas for Forms

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  bio: z.string().max(160).optional(),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
  promotionalEmails: z.boolean().default(false),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmNewPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  twoFactorEnabled: z.boolean().default(false),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

const preferencesFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  language: z.string(), // Could be an enum if specific languages are predefined
  dateFormat: z.string(),
});


const SettingsPage = () => {
  console.log('SettingsPage loaded');

  // Form Hooks
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "",
      bio: "Banking enthusiast.",
    },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      promotionalEmails: false,
    },
  });

  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
      twoFactorEnabled: true,
    },
  });

  const preferencesForm = useForm<z.infer<typeof preferencesFormSchema>>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      theme: "system",
      language: "en-US",
      dateFormat: "MM/DD/YYYY",
    },
  });

  // Placeholder Submit Handlers
  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    console.log("Profile settings submitted:", values);
    toast({ title: "Profile Updated", description: "Your profile settings have been saved." });
  }

  function onNotificationsSubmit(values: z.infer<typeof notificationsFormSchema>) {
    console.log("Notification settings submitted:", values);
    toast({ title: "Notifications Updated", description: "Your notification preferences have been saved." });
  }

  function onSecuritySubmit(values: z.infer<typeof securityFormSchema>) {
    console.log("Security settings submitted:", values);
    // Reset password fields after submission for security
    securityForm.reset({ 
      currentPassword: "", 
      newPassword: "", 
      confirmNewPassword: "",
      twoFactorEnabled: values.twoFactorEnabled 
    });
    toast({ title: "Security Settings Updated", description: "Your security settings have been changed." });
  }

  function onPreferencesSubmit(values: z.infer<typeof preferencesFormSchema>) {
    console.log("Preference settings submitted:", values);
    toast({ title: "Preferences Updated", description: "Your application preferences have been saved." });
  }

  return (
    <div className="relative min-h-screen bg-muted/10 dark:bg-muted/30">
      <IntegratedHeader />
      <CollapsibleAnimatedSidebar />

      <div className="flex flex-col flex-1 md:pl-60 pl-16 pt-16 transition-all duration-300 ease-in-out">
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">
                Manage your profile, notifications, security, and application preferences.
              </p>
            </header>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 gap-2">
                <TabsTrigger value="profile" className="flex items-center gap-2"><UserCog className="h-4 w-4"/> Profile</TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2"><BellRing className="h-4 w-4"/> Notifications</TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Security</TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2"><Palette className="h-4 w-4"/> Preferences</TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                  </CardHeader>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                      <CardContent className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number (Optional)</FormLabel>
                              <FormControl><Input type="tel" placeholder="Your phone number" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio (Optional)</FormLabel>
                              <FormControl><Input placeholder="Tell us a bit about yourself" {...field} /></FormControl>
                              <FormDescription>A short description about you.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4">
                        <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Profile</Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified.</CardDescription>
                  </CardHeader>
                  <Form {...notificationsForm}>
                    <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
                      <CardContent className="space-y-6">
                        <FormField
                          control={notificationsForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>Receive important updates via email.</FormDescription>
                              </div>
                              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationsForm.control}
                          name="smsNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">SMS Notifications</FormLabel>
                                <FormDescription>Get critical alerts via SMS (carrier charges may apply).</FormDescription>
                              </div>
                              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={notificationsForm.control}
                          name="pushNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Push Notifications</FormLabel>
                                <FormDescription>Receive real-time updates on your mobile device.</FormDescription>
                              </div>
                              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={notificationsForm.control}
                          name="promotionalEmails"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Promotional Emails</FormLabel>
                                <FormDescription>Receive news, offers, and promotions from BankDash.</FormDescription>
                              </div>
                              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4">
                        <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Preferences</Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage your password and account security.</CardDescription>
                  </CardHeader>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                      <CardContent className="space-y-6">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="confirmNewPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="twoFactorEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                               <div className="space-y-0.5">
                                <FormLabel className="text-base">Two-Factor Authentication (2FA)</FormLabel>
                                <FormDescription>Enhance your account security by enabling 2FA.</FormDescription>
                              </div>
                              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4">
                        <Button type="submit"><Save className="mr-2 h-4 w-4" />Update Security</Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Preferences</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                  </CardHeader>
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}>
                      <CardContent className="space-y-6">
                        <FormField
                          control={preferencesForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a theme" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System Default</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Choose your preferred application theme.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={preferencesForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="en-US">English (United States)</SelectItem>
                                  <SelectItem value="es-ES">Español (España)</SelectItem>
                                  <SelectItem value="fr-FR">Français (France)</SelectItem>
                                  {/* Add more languages as needed */}
                                </SelectContent>
                              </Select>
                              <FormDescription>Select your preferred language for the application.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={preferencesForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Format</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select date format" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>Choose how dates are displayed across the application.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4">
                        <Button type="submit"><Save className="mr-2 h-4 w-4" />Save Preferences</Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default SettingsPage;