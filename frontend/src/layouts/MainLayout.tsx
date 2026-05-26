import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import AIConcierge from '@/components/ai/AIConcierge';
// import VisualSearch from '@/components/ai/VisualSearch';

const MainLayout: React.FC = () => {
  const isSignedIn = true; // Temporary mock

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
              VENDORA
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link to="/search" className="text-sm font-medium hover:text-primary/80 transition-colors">
                Shop
              </Link>
              <Link to="/categories" className="text-sm font-medium hover:text-primary/80 transition-colors">
                Categories
              </Link>
              <Link to="/deals" className="text-sm font-medium hover:text-primary/80 transition-colors">
                Deals
              </Link>
            </nav>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 pr-10 bg-muted/50 border-none focus-visible:ring-1"
              />
              <div className="absolute right-1 top-1">
                <div />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>
            {isSignedIn ? (
              <Button variant="ghost" size="icon">
                <UserIcon className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="default" size="sm">Sign In</Button>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-12 bg-muted/30">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/search">All Products</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/deals">Special Deals</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Vendora</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
              <li><Link to="/returns">Returns</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Sell</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/vendor/login">Become a Vendor</Link></li>
              <li><Link to="/vendor/dashboard">Vendor Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Vendora Inc. All rights reserved.
        </div>
      </footer>
      <div />
    </div>
  );
};

export default MainLayout;
