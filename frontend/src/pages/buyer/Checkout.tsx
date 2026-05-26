import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Truck, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { buyerService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const Checkout: React.FC = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: () => buyerService.getCart(),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => buyerService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setStep(3);
      toast({ title: "Order placed successfully!" });
    },
  });

  const subtotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const total = subtotal + (subtotal > 100 ? 0 : 15) + (subtotal * 0.08);

  if (step === 3) {
    return (
      <div className="container py-20 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-green-100 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Thank You for Your Order!</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your order has been placed successfully and is being processed. You will receive an email confirmation shortly.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/orders')}>View Order History</Button>
          <Button variant="outline" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Steps */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>1</div>
              <span className="font-semibold">Shipping</span>
            </div>
            <div className="h-px flex-1 bg-muted" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>2</div>
              <span className="font-semibold">Payment</span>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-6 p-6 border rounded-xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5" />
                <h2 className="text-xl font-bold">Shipping Information</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input id="zipCode" placeholder="10001" />
                </div>
              </div>
              <Button className="w-full" onClick={() => setStep(2)}>Continue to Payment</Button>
            </div>
          ) : (
            <div className="space-y-6 p-6 border rounded-xl bg-card">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5" />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 border-2 border-primary bg-primary/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    <div>
                      <p className="font-bold">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                  </div>
                  <div className="h-4 w-4 rounded-full border-4 border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  className="flex-1" 
                  onClick={() => createOrderMutation.mutate({})}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-6 border rounded-xl bg-card space-y-4">
            <h3 className="text-xl font-bold">Your Order</h3>
            <div className="space-y-4">
              {cartItems?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.quantity}x {item.product.name}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{subtotal > 100 ? 'Free' : '$15.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${(subtotal * 0.08).toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg flex gap-3">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your payment information is encrypted and secure. We do not store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
