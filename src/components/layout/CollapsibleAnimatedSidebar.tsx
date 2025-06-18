import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users, // Placeholder for 'Accounts' or similar
  ArrowLeftRight, // For Transfers
  ReceiptText, // For Bill Pay
  Settings,
  PanelLeftClose,
  PanelRightClose,
  ShieldCheck, // Placeholder for Bank icon
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils.ts exists for cn

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts', icon: Users, label: 'Accounts' },
  { to: '/transfers', icon: ArrowLeftRight, label: 'Transfers' },
  { to: '/bill-pay', icon: ReceiptText, label: 'Bill Pay' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

interface CollapsibleAnimatedSidebarProps {
  className?: string;
}

const CollapsibleAnimatedSidebar: React.FC<CollapsibleAnimatedSidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  console.log('CollapsibleAnimatedSidebar loaded');

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
      isActive && 'bg-muted text-primary font-semibold',
      isCollapsed && 'justify-center'
    );
  
  const iconSize = isCollapsed ? "h-5 w-5" : "h-4 w-4";

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-60',
          className
        )}
      >
        <div className={cn("flex h-16 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
          <Link to="/" className={cn("flex items-center gap-2 font-semibold", isCollapsed && "sr-only")}>
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span>BankDash</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="rounded-lg">
            {isCollapsed ? <PanelRightClose className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            <span className="sr-only">{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
          </Button>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink to={item.to} className={navLinkClasses}>
                        <item.icon className={iconSize} />
                        <span className="sr-only">{item.label}</span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  <NavLink to={item.to} className={navLinkClasses}>
                    <item.icon className={iconSize} />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {/* Optional: Footer section in sidebar */}
        {/* {!isCollapsed && (
          <div className="mt-auto p-4 border-t">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} BankDash</p>
          </div>
        )} */}
      </aside>
    </TooltipProvider>
  );
};

export default CollapsibleAnimatedSidebar;