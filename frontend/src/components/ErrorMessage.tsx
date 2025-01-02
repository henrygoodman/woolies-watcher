import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex items-center p-4 border border-red-300 rounded-lg bg-red-100 text-red-800">
    <AlertCircle className="h-6 w-6 mr-3 text-red-500" />
    <div>
      <h2 className="font-semibold text-lg">Something went wrong</h2>
      <p>{message}</p>
    </div>
  </div>
);
