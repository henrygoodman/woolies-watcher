'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { fetchUserConfigApi, updateUserConfigApi } from '@/lib/api/userApi';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [email, setEmail] = useState('');
  const [notificationTime, setNotificationTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    const loadUserConfig = async () => {
      setLoading(true);
      try {
        const config = await fetchUserConfigApi();
        setEmail(config.destinationEmail || user.email || '');
        setNotificationTime(config.notificationTime || '7am AEST');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserConfig();
  }, [user?.email]);

  const handleSave = async () => {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'User not logged in',
        variant: 'destructive',
      });
      return;
    }

    try {
      await Promise.all([
        updateUserConfigApi('destinationEmail', email),
        updateUserConfigApi('notificationTime', notificationTime),
      ]);

      toast({
        title: 'Settings Saved',
        description: 'Your settings have been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading settings...</p>
      ) : (
        <>
          {/* Email Field */}
          <div className="mb-6">
            <Label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full"
            />
          </div>

          {/* Notification Preferences Field */}
          <div className="mb-6">
            <Label
              htmlFor="notification-time"
              className="block text-sm font-medium mb-2"
            >
              Notification Time
            </Label>
            <Input
              id="notification-time"
              type="text"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              placeholder="e.g., 7am AEST"
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Specify when you want to be notified about watched items. Default
              is 7am AEST on the day of price changes.
            </p>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
