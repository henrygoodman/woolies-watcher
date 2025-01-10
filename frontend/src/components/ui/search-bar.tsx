'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

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
  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: value,
    },
  });

  const queryValue = form.watch('query').trim();

  const onEnterSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (queryValue) {
        onSearch(queryValue);
      }
    }
  };

  const handleSearchClick = () => {
    if (queryValue) {
      onSearch(queryValue);
    }
  };

  return (
    <Form {...form}>
      <form
        className={cn('relative flex w-full max-w-md items-center', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search items..."
                    className="w-full pr-10 h-10 text-xl rounded-lg"
                    {...field}
                    onKeyDown={onEnterSubmit}
                  />
                  {/* Search Button Inside Input */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSearchClick}
                    disabled={!queryValue}
                    className={cn(
                      'absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7',
                      queryValue ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <Search className="h-4 w-4 mr-0" />
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
