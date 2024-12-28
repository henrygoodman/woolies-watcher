'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  fetchUserDestinationEmailApi,
  updateUserDestinationEmailApi,
} from '@/lib/api/userApi';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [notificationTime, setNotificationTime] = useState('8am AEST');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    const loadDestinationEmail = async () => {
      setLoading(true);
      try {
        const destinationEmail = await fetchUserDestinationEmailApi();
        setEmail(destinationEmail || user.email || '');
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

    loadDestinationEmail();
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

    if (emailError) {
      toast({
        title: 'Error',
        description: 'Please correct the email address before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateUserDestinationEmailApi(email);

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

  const validateEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (e: any) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  if (loading) return <LoadingIndicator />;

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
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              className={`w-full ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && (
              <p className="text-sm text-red-500 mt-2">{emailError}</p>
            )}
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
              disabled // Make the field non-editable
              className="w-full bg-muted cursor-not-allowed"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Notifications are currently locked to 8am AEST.
            </p>
          </div>

          {/* Save Button */}
          <div className="mt-4">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={!!emailError} // Disable save button if email is invalid
            >
              Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
