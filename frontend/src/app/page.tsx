"use client"

import { SearchBar } from "@/components/ui/search-bar"

export default function Home() {
  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Search Groceries</h1>
      <SearchBar onSearch={handleSearch} />
    </main>
  )
}

