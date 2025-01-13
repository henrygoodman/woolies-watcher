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
import { DollarSign, Search, Mail, Heart, Info } from 'lucide-react';

const categories = [
  { label: 'Beef Mince', value: 'Beef Mince' },
  { label: 'Whey Protein', value: 'Whey Protein' },
  { label: 'Chicken Breast Fillets', value: 'Chicken Breast Fillets' },
  { label: 'Greek Yoghurt', value: 'Greek Yoghurt' },
  { label: 'Peanut Butter', value: 'Peanut Butter' },
];

export const HeroSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleGetStarted = () => {
    handleSearch(selectedCategory);
  };

  const steps = [
    {
      label: (
        <>
          View{' '}
          <span
            className="text-primary cursor-pointer hover:underline"
            onClick={() => router.push('/discounts')}
          >
            current deals
          </span>
        </>
      ),
      icon: <DollarSign className="mt-1 mr-4 text-primary" size={20} />,
    },
    {
      label: 'Search for items',
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

  return (
    <section className="mx-auto bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="bg-card rounded-xl shadow-xl p-8">
          {/* Title Section */}
          <h2 className="text-2xl md:text-4xl font-extrabold text-primary mb-8 text-center">
            Woolworths Item Tracker
          </h2>

          {/* Divider */}
          <hr className="border-t-2 border-primary my-6 w-1/2 mx-auto" />

          {/* Steps Section */}
          <div className="mx-auto">
            <ol className="list-decimal list-outside text-left mb-8 space-y-4 pl-1">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  {step.icon}
                  <span className="text-lg md:text-xl text-foreground">
                    <strong>{step.label}</strong>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Dropdown and Button */}
          <div className="mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
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

            <button
              onClick={handleGetStarted}
              className={`flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md shadow-md hover:bg-primary-dark transition-colors duration-300 ${
                !selectedCategory
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              disabled={!selectedCategory}
            >
              <Search className="mr-2" size={20} />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
