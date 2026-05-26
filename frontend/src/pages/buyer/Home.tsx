import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buyerService } from '@/services';
import { Product } from '@/types';
import RecommendationPanel from '@/components/ai/RecommendationPanel';

const Home: React.FC = () => {
  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => buyerService.getProducts({ featured: true }),
  });

  const productList = React.useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    if (typeof productsData === 'object' && productsData !== null) {
      // Handle common patterns like { products: [] } or { data: [] }
      const possibleArray = (productsData as any).products || (productsData as any).data || (productsData as any).items;
      if (Array.isArray(possibleArray)) return possibleArray;
    }
    return [];
  }, [productsData]);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center bg-muted/30 overflow-hidden">
        <div className="container grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Elevate Your <span className="text-primary">Lifestyle</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Discover a curated collection of premium products from top vendors around the world. Quality meet convenience.
            </p>
            <div className="flex gap-4">
              <Link to="/search">
                <Button size="lg" className="px-8">Shop Now</Button>
              </Link>
              <Link to="/categories">
                <Button size="lg" variant="outline">Browse Categories</Button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <img 
              src="/assets/hero.png" 
              alt="Hero" 
              className="relative z-10 w-full h-auto object-contain drop-shadow-2xl"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1000' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 space-y-3">
          <div className="p-3 bg-primary/5 rounded-full text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Fast Delivery</h3>
          <p className="text-sm text-muted-foreground">Free shipping on all orders over $100</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 space-y-3">
          <div className="p-3 bg-primary/5 rounded-full text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Secure Payment</h3>
          <p className="text-sm text-muted-foreground">100% secure payment processing</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 space-y-3">
          <div className="p-3 bg-primary/5 rounded-full text-primary">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Premium Quality</h3>
          <p className="text-sm text-muted-foreground">Curated products from verified vendors</p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">Our most popular items this week</p>
          </div>
          <Link to="/search" className="text-primary font-medium flex items-center gap-1 hover:underline">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <p className="text-destructive font-medium">Failed to load products</p>
            <p className="text-sm text-muted-foreground">{(error as any)?.message || 'An unknown error occurred'}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : productList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No featured products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productList.map((product: Product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group space-y-3">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted relative">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <Button size="icon" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category.name}</p>
                  <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <RecommendationPanel />
    </div>
  );
};

export default Home;
