import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface CustomError extends Error {
  title?: string;
}

type ErrorMessageProps = {
  error: Error | string;
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred. Please try again later.';

  if (typeof error === 'string') {
    message = error;
  } else {
    const customError = error as CustomError;
    title = customError.title || title;
    message = customError.message || message;
  }

  return (
    <div className="flex items-center p-4 border border-red-300 rounded-lg bg-red-100 text-red-800">
      <AlertCircle className="h-6 w-6 mr-3 text-red-500" />
      <div>
        <h2 className="font-semibold text-lg">{title}</h2>
        <p>
          {message.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};
