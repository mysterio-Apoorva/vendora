import React from 'react';
import { 
  Percent, 
  Save, 
  History,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CommissionManagement: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Commission Management</h2>
        <p className="text-sm text-muted-foreground">Configure platform fees and vendor commission rates.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" /> Default Rate
            </CardTitle>
            <CardDescription>Global commission rate for all new vendors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Commission Percentage (%)</Label>
              <div className="flex gap-2">
                <Input id="rate" type="number" defaultValue="5" />
                <Button variant="outline" size="icon"><Save className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg flex gap-3">
              <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This rate will be applied to all vendors unless they have a custom rate assigned.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Custom Vendor Rates
            </CardTitle>
            <CardDescription>Manage individual commission rates for top-performing vendors.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Rate</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold">Elite Electronics</TableCell>
                  <TableCell>Electronics</TableCell>
                  <TableCell>
                    <Badge variant="outline">3.5%</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit Rate</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold">Fashion Forward</TableCell>
                  <TableCell>Apparel</TableCell>
                  <TableCell>
                    <Badge variant="outline">4.0%</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit Rate</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommissionManagement;
