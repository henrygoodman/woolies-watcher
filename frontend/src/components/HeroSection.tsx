'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Mail, Heart, Info } from 'lucide-react';

const categories = [
  { label: 'Beef Mince', value: 'Beef Mince' },
  { label: 'Whey Protein', value: 'Whey Protein' },
  { label: 'Chicken Breast Fillets', value: 'Chicken Breast Fillets' },
  { label: 'Greek Yoghurt', value: 'Greek Yoghurt' },
  { label: 'Peanut Butter', value: 'Peanut Butter' },
];

const steps = [
  {
    label: 'Search for products',
    icon: <Search className="mt-1 mr-4 text-primary" size={20} />,
  },
  {
    label: 'Add to your watchlist',
    icon: <Heart className="mt-1 mr-4 text-primary" size={20} />,
  },
  {
    label: (
      <>
        Get notified when prices change
        <div className="relative group inline-block ml-2">
          <Info
            className="text-secondary cursor-pointer"
            size={18}
            aria-label="Info about notifications"
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-secondary text-secondary-foreground text-sm rounded-md px-3 py-2 shadow-md w-48 text-center">
            Emails are sent at 8am AEST each day
          </div>
        </div>
      </>
    ),
    icon: <Mail className="mt-1 mr-4 text-primary" size={20} />,
  },
];

export const HeroSection = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleGetStarted = () => {
    handleSearch(selectedCategory);
  };

  return (
    <section className="w-full bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto p-8 bg-card rounded-xl shadow-xl">
          {/* Hero Title */}
          <h2 className="text-2xl md:text-5xl font-extrabold text-primary mb-4 text-center">
            Woolworths Product Tracker
          </h2>

          {/* Divider */}
          <hr className="border-t-2 border-primary my-8 w-96 mx-auto" />

          {/* Instructional Steps */}
          <ol className="list-decimal list-outside text-left mb-8 space-y-4 pl-6">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start">
                {step.icon}
                <span className="text-lg md:text-2xl text-foreground">
                  <strong>{step.label}</strong>
                </span>
              </li>
            ))}
          </ol>

          {/* Dropdown and Button Container */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Dropdown for Categories */}
            <Select
              value={selectedCategory}
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="w-64 h-12">
                <SelectValue placeholder="Choose a search term" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Start Watching Button */}
            <button
              onClick={handleGetStarted}
              className={`flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-md hover:bg-primary-dark transition-colors duration-300 ${
                !selectedCategory
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              disabled={!selectedCategory}
            >
              <Search className="mr-2" size={20} /> {/* Lucide Search Icon */}
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
