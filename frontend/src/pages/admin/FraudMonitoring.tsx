import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  ShieldAlert, 
  UserX, 
  Flag,
  Search,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService } from '@/services';

const FraudMonitoring: React.FC = () => {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['fraud-alerts'],
    queryFn: () => adminService.getFraudAlerts(),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Fraud Monitoring</h2>
          <p className="text-sm text-muted-foreground">Monitor suspicious activities and protect the platform.</p>
        </div>
        <div className="flex gap-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-xs font-bold uppercase text-red-600 tracking-wider">High Risk</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase text-amber-600 tracking-wider">Medium Risk</p>
              <p className="text-xl font-bold">45</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter alerts..." className="pl-9" />
        </div>
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Risk Level</TableHead>
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
            ) : alerts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No active fraud alerts.
                </TableCell>
              </TableRow>
            ) : (
              alerts?.map((alert: any) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{alert.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-sm">{alert.targetName}</span>
                      <span className="text-muted-foreground">ID: {alert.targetId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={alert.risk === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                      {alert.risk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Unresolved</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <CheckCircle className="h-4 w-4" /> Resolve
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                        <UserX className="h-4 w-4" /> Ban User
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

export default FraudMonitoring;
