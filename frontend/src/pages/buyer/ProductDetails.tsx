import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  Heart, 
  Truck, 
  ShieldCheck, 
  ArrowLeft,
  Minus,
  Plus,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { buyerService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import RecommendationPanel from '@/components/ai/RecommendationPanel';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => buyerService.getProduct(id!),
    enabled: !!id,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => buyerService.addToCart(id!, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart.`,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-muted animate-pulse rounded-xl" />
          <div className="space-y-6">
            <div className="h-10 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-24 w-full bg-muted animate-pulse rounded" />
            <div className="h-12 w-1/2 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Button asChild>
          <Link to="/search">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button variant="ghost" asChild className="mb-8 -ml-4">
        <Link to="/search" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to={`/search?category=${product.categoryId}`} className="hover:text-primary transition-colors">
                {product.category.name}
              </Link>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                4.8 (120 reviews)
              </span>
            </div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.stock} items available
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1 h-12 text-lg" 
                onClick={() => addToCartMutation.mutate()}
                disabled={addToCartMutation.isPending || product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-5 w-5" /> 
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="flex gap-3">
              <div className="p-2 bg-muted rounded-lg h-fit">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm">Free Delivery</p>
                <p className="text-xs text-muted-foreground">Orders over $100</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="p-2 bg-muted rounded-lg h-fit">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-sm">2 Year Warranty</p>
                <p className="text-xs text-muted-foreground">Authentic products only</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/50 rounded-xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sold by</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {product.vendor.businessName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{product.vendor.businessName}</p>
                  <p className="text-xs text-muted-foreground">Verified Vendor</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Visit Store</Button>
            </div>
          </div>
        </div>
      </div>

      <RecommendationPanel />
    </div>
  );
};

export default ProductDetails;
