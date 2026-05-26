import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiService } from '@/services';
import { Product } from '@/types';
import { Link } from 'react-router-dom';

const RecommendationPanel: React.FC = () => {
  const { data: recommendations, isLoading, isError } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => aiService.getRecommendations(),
  });

  if (isLoading || isError) return null;

  const recommendationList = Array.isArray(recommendations) ? recommendations : [];

  if (recommendationList.length === 0) return null;

  return (
    <section className="container py-12 border-t mt-12">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <p className="text-sm text-muted-foreground">Smart suggestions based on your shopping style.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {recommendationList.map((product: Product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="group space-y-3">
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted relative">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <Button size="icon" className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg scale-90">
                <ShoppingBag className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <p className="font-bold text-primary">${product.price.toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendationPanel;
