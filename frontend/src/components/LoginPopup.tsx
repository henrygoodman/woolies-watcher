'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

export const LoginPopup: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleGoogleLoginSuccess = (response: CredentialResponse) => {
    console.log('Login Successful:', response.credential);
    setOpen(false);
  };

  const handleGoogleLoginError = () => {
    console.error('Login Failed');
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-white rounded">Sign In</button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <p className="text-sm text-gray-600">
              Sign in with your Google account below:
            </p>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
