// /components/HeroSection.jsx

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
import { Search } from 'lucide-react';

const categories = [
  { label: 'Beef Mince', value: 'beef-mince' },
  { label: 'Whey Protein', value: 'whey-protein' },
  { label: 'Almond Milk', value: 'almond-milk' },
  { label: 'Organic Eggs', value: 'organic-eggs' },
  { label: 'Whole Grain Bread', value: 'whole-grain-bread' },
];

export const HeroSection = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearch = (query: string) => {
    if (query) {
      router.push(`/search?search=${encodeURIComponent(query)}`);
    }
  };

  const handleGetStarted = () => {
    handleSearch(selectedCategory);
  };

  return (
    <section className="w-full bg-background py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto p-8 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl md:text-5xl font-extrabold text-primary mb-6">
            Woolworths Product Tracker
          </h2>
          <p className="text-lg md:text-2xl text-foreground mb-8">
            Find products, add to your watchlist, and receive daily price
            updates. Never miss a deal!
          </p>

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
