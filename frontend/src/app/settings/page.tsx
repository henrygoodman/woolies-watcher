'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { fetchUserApi, updateUserApi } from '@/lib/api/userApi';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [initialEmail, setInitialEmail] = useState('');
  const [initialEnableEmails, setInitialEnableEmails] = useState(false);

  const [email, setEmail] = useState('');
  const [enableEmails, setEnableEmails] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    const loadSettings = async () => {
      setLoading(true);
      try {
        const fetchedUser = await fetchUserApi();
        setInitialEmail(fetchedUser.email);
        setInitialEnableEmails(fetchedUser.enable_emails);

        setEmail(fetchedUser.email);
        setEnableEmails(fetchedUser.enable_emails);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load settings',
          variant: 'destructive',
        });
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user?.email]);

  useEffect(() => {
    setIsDirty(email !== initialEmail || enableEmails !== initialEnableEmails);
  }, [email, enableEmails, initialEmail, initialEnableEmails]);

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
      await updateUserApi({
        enable_emails: enableEmails,
      });

      toast({
        title: 'Settings Saved',
        description: 'Your settings have been successfully updated.',
        duration: 2000,
      });

      setInitialEmail(email);
      setInitialEnableEmails(enableEmails);
      setIsDirty(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading settings...</p>
      ) : (
        <>
          {/* Email Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Email</h2>
            <div className="mb-4">
              <Label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full bg-muted cursor-not-allowed"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Currently, we can only send emails to your authenticated email
                address.
              </p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <Label
                htmlFor="enable-emails"
                className="block text-sm font-medium"
              >
                Enable Update Emails
              </Label>
              <Switch
                id="enable-emails"
                checked={enableEmails}
                onCheckedChange={setEnableEmails}
                aria-label="Toggle email updates"
              />
            </div>
          </div>

          <hr></hr>

          {/* Appearance Section */}
          <div className="mt-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <p className="text-sm">Theme</p>
              <ThemeToggle />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <Button onClick={handleSave} className="w-full" disabled={!isDirty}>
              Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
