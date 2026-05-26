import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell, 
  ShieldCheck, 
  Users,
  Percent,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const vendorSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { label: 'Inventory', href: '/vendor/inventory', icon: Package },
  { label: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
  { label: 'Analytics', href: '/vendor/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/vendor/settings', icon: Settings },
];

const adminSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Vendor Approval', href: '/admin/vendors', icon: ShieldCheck },
  { label: 'User Management', href: '/admin/users', icon: Users },
  { label: 'Commission', href: '/admin/commission', icon: Percent },
  { label: 'Fraud Monitoring', href: '/admin/fraud', icon: Bell },
  { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
];

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const sidebarItems = isAdmin ? adminSidebarItems : vendorSidebarItems;

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
            VENDORA
          </Link>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
            {isAdmin ? 'Admin Portal' : 'Vendor Dashboard'}
          </p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-muted font-semibold text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Dev User</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center justify-between px-8 md:px-12">
          <h1 className="text-xl font-semibold">
            {sidebarItems.find(i => i.href === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        <main className="flex-1 p-8 md:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
