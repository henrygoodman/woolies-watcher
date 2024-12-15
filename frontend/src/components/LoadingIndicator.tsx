import { Spinner } from '@/components/ui/spinner';

export const LoadingIndicator: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 mt-4">
    <Spinner className="w-10 h-10 animate-spin" />
  </div>
);
