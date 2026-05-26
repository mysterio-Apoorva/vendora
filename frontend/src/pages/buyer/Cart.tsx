import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { buyerService } from '@/services';
import { CartItem } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Cart: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => buyerService.getCart(),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string, quantity: number }) => 
      buyerService.updateCartItem(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: string) => buyerService.removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({ title: "Item removed from cart" });
    },
  });

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="container py-12 space-y-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
          </div>
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container py-20 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-muted rounded-full">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Looks like you haven't added anything to your cart yet. Explore our products to find something you'll love.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/search">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">Your Cart ({cartItems.length} items)</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item: CartItem) => (
            <div key={item.id} className="flex gap-6 p-4 border rounded-xl bg-card transition-shadow hover:shadow-sm">
              <div className="h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product.category.name}</p>
                  </div>
                  <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center border rounded-md h-9">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantityMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      disabled={item.quantity >= item.product.stock || updateQuantityMutation.isPending}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeItemMutation.mutate(item.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-6 border rounded-xl bg-card space-y-4 sticky top-24">
            <h3 className="text-xl font-bold">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full h-12 text-lg" asChild>
              <Link to="/checkout">
                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <div className="pt-4 text-center">
              <Link to="/search" className="text-sm text-muted-foreground hover:text-primary underline transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
