import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buyerService } from '@/services';
import { Order } from '@/types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const OrderHistory: React.FC = () => {
  const { data: ordersData, isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => buyerService.getOrders(),
  });

  const orderList = React.useMemo(() => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) return ordersData;
    if (typeof ordersData === 'object' && ordersData !== null) {
      const possibleArray = (ordersData as any).orders || (ordersData as any).data || (ordersData as any).items;
      if (Array.isArray(possibleArray)) return possibleArray;
    }
    return [];
  }, [ordersData]);

  if (isLoading) {
    return (
      <div className="container py-12 space-y-8">
        <h1 className="text-3xl font-bold">Order History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-12 space-y-8 text-center">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="p-8 border rounded-xl bg-destructive/5 space-y-4">
          <p className="text-destructive font-medium">Failed to load order history</p>
          <p className="text-sm text-muted-foreground">{(error as any)?.message || 'An unknown error occurred'}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (orderList.length === 0) {
    return (
      <div className="container py-20 text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-6 bg-muted rounded-full">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">No orders yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven't placed any orders yet. Once you do, they will appear here for you to track.
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/search">Explore Products</Link>
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-bold">Order History</h1>

      <div className="space-y-6">
        {orderList.map((order: Order) => (
          <div key={order.id} className="border rounded-xl bg-card overflow-hidden transition-shadow hover:shadow-md">
            <div className="p-6 bg-muted/30 border-b flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Order Date</p>
                  <p className="font-semibold">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Order #</p>
                <p className="text-sm font-mono">{order.id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 text-sm font-medium text-primary">
                {order.status === 'DELIVERED' ? (
                  <><Package className="h-4 w-4" /> Delivered on {format(new Date(order.createdAt), 'MMM dd')}</>
                ) : (
                  <><Clock className="h-4 w-4" /> Estimated delivery in 3-5 days</>
                )}
              </div>

              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${item.price.toFixed(2)}</p>
                      <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                        <Link to={`/product/${item.productId}`}>View Product</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t bg-muted/10 flex justify-end gap-3">
              <Button variant="outline" size="sm">Track Order</Button>
              <Button size="sm">View Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
