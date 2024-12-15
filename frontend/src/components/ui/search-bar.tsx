'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';

interface SearchBarProps extends React.HTMLAttributes<HTMLFormElement> {
  onSearch: (query: string) => void;
  value?: string;
}

interface SearchFormValues {
  query: string;
}

export function SearchBar({
  className,
  onSearch,
  value = '',
  ...props
}: SearchBarProps) {
  const [isSearching, setIsSearching] = React.useState(false);

  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: value,
    },
  });

  React.useEffect(() => {
    form.reset({ query: value });
  }, [value, form]);

  const onSubmit = (data: SearchFormValues) => {
    setIsSearching(true);
    onSearch(data.query.trim());
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex w-full max-w-sm items-center space-x-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isSearching}
          className="flex items-center"
        >
          {isSearching ? (
            <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
      </form>
    </Form>
  );
}
