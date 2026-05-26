import React from 'react';
import { User, Mail, Shield, ShoppingBag, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Profile: React.FC = () => {
  const user = {
    fullName: 'Dev User',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    primaryEmailAddress: { emailAddress: 'dev@vendora.com' },
    publicMetadata: { role: 'VENDOR' }
  };

  return (
    <div className="container py-12 max-w-4xl space-y-8">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-background shadow-xl">
          <img src={user.imageUrl} alt={user.fullName || ''} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> {user.primaryEmailAddress?.emailAddress}
          </p>
          <div className="flex gap-2 pt-2">
            <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Buyer
            </div>
            {user.publicMetadata.role === 'VENDOR' && (
              <div className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                Vendor
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Account</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3">
                <User className="h-4 w-4" /> Personal Info
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Shield className="h-4 w-4" /> Security
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3">
                <ShoppingBag className="h-4 w-4" /> Preferences
              </Button>
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex items-center justify-center p-12 text-center">
            <div className="space-y-2">
              <p className="text-lg font-semibold">User Settings</p>
              <p className="text-sm text-muted-foreground">User management is temporarily disabled in development mode.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
