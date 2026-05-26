import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2,
  Mail,
  ExternalLink
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
import { adminService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const VendorApproval: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingVendors, isLoading } = useQuery({
    queryKey: ['pending-vendors'],
    queryFn: () => adminService.getPendingVendors(),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-vendors'] });
      toast({ title: "Vendor approved successfully" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Vendor Approval</h2>
        <p className="text-sm text-muted-foreground">Review and approve new vendor applications.</p>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Info</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Date Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map(i => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 bg-muted/20 animate-pulse" />
                </TableRow>
              ))
            ) : pendingVendors?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No pending vendor applications.
                </TableCell>
              </TableRow>
            ) : (
              pendingVendors?.map((vendor: any) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" /> {vendor.businessName}
                      </span>
                      <span className="text-xs text-muted-foreground">{vendor.description || 'No description provided'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> {vendor.user.firstName} {vendor.user.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {vendor.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>May 24, 2026</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending Review
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <ExternalLink className="h-4 w-4" /> View Docs
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="gap-1"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => approveMutation.mutate(vendor.id)}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                    </div>
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

export default VendorApproval;
