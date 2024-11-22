"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { Search } from 'lucide-react'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form"

interface SearchBarProps extends React.HTMLAttributes<HTMLFormElement> {
  onSearch: (query: string) => void
}

interface SearchFormValues {
  query: string
}

export function SearchBar({ className, onSearch, ...props }: SearchBarProps) {
  const [isSearching, setIsSearching] = React.useState(false)
  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: "",
    },
  })

  function onSubmit(data: SearchFormValues) {
    setIsSearching(true)
    onSearch(data.query)
    setTimeout(() => {
      setIsSearching(false)
    }, 1000)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "flex w-full max-w-sm items-center space-x-2",
          className
        )}
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
        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <span className="animate-spin mr-2">◌</span>
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </Button>
      </form>
    </Form>
  )
}

