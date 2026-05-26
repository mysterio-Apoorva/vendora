import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { buyerService } from '@/services';
import { Product, Category } from '@/types';
import { Link } from 'react-router-dom';

const ProductSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => buyerService.getCategories(),
  });

  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory, sortBy],
    queryFn: () => buyerService.getProducts({ 
      search: searchTerm, 
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      sort: sortBy
    }),
  });

  const categoryList = React.useMemo(() => {
    if (!categoriesData) return [];
    if (Array.isArray(categoriesData)) return categoriesData;
    if (typeof categoriesData === 'object' && categoriesData !== null) {
      const possibleArray = (categoriesData as any).categories || (categoriesData as any).data || (categoriesData as any).items;
      if (Array.isArray(possibleArray)) return possibleArray;
    }
    return [];
  }, [categoriesData]);

  const productList = React.useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    if (typeof productsData === 'object' && productsData !== null) {
      const possibleArray = (productsData as any).products || (productsData as any).data || (productsData as any).items;
      if (Array.isArray(possibleArray)) return possibleArray;
    }
    return [];
  }, [productsData]);

  return (
    <div className="container py-12 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Browse Products</h1>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
            <div className="flex flex-wrap md:flex-col gap-2">
              <Button 
                variant={selectedCategory === 'all' ? 'default' : 'ghost'} 
                className="justify-start w-full"
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </Button>
              {categoryList.map((cat: Category) => (
                <Button 
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'ghost'} 
                  className="justify-start w-full"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Sort By</h3>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <p className="text-destructive font-medium">Failed to load products</p>
              <p className="text-sm text-muted-foreground">{(error as any)?.message || 'An unknown error occurred'}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : (
            <>
              {productList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">No products found</h2>
                  <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>Clear Filters</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
