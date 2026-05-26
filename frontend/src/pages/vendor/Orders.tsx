import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { vendorService } from '@/services';
import { Order } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const Orders: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => vendorService.getOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      vendorService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      toast({ title: "Order status updated" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <Badge className="bg-green-100 text-green-700 border-green-200">Delivered</Badge>;
      case 'SHIPPED': return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Shipped</Badge>;
      case 'PROCESSING': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Processing</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Order Fulfillment</h2>
        <p className="text-sm text-muted-foreground">Manage incoming orders and update their fulfillment status.</p>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-16 bg-muted/20 animate-pulse" />
                </TableRow>
              ))
            ) : orders?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders?.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs uppercase">#{order.id.slice(-8)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">Customer ID</span>
                      <span className="text-xs text-muted-foreground">{order.userId.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell className="font-bold">${order.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'PROCESSING' })}>
                          <Clock className="h-4 w-4 mr-2" /> Mark Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'SHIPPED' })}>
                          <Truck className="h-4 w-4 mr-2" /> Mark Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'DELIVERED' })}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <ExternalLink className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;
