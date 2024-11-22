"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/ui/search-bar";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface Product {
  barcode: string;
  product_name: string;
  product_brand: string;
  current_price: number;
  product_size: string;
  url: string;
  imageUrl: string | null;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (searchQuery: string, page: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?query=${searchQuery}&page=${page}`);
      const data = await response.json();

      console.log("Data", data)

      setProducts(data.results);
      setCurrentPage(data.current_page);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    fetchProducts(searchQuery, 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchProducts(query, currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchProducts(query, currentPage - 1);
    }
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-4">Search Groceries</h1>
      <SearchBar onSearch={handleSearch} />

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-5xl">
        {products.map((product) => (
          <Card key={product.barcode} className="w-full">
            <CardHeader>
              <img
                src={product.imageUrl || "https://placehold.co/200"}
                alt={product.product_name}
                className="w-full h-48 object-contain rounded-t-xl"
              />
              <CardTitle>{product.product_name}</CardTitle>
              <CardDescription>{product.product_size}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 font-bold">${product.current_price}</p>
              <p className="text-gray-600">{product.product_brand}</p>
            </CardContent>
            <CardFooter>
              <a
                href={product.url}
                target="_blank"
                className="text-blue-500 underline"
                rel="noreferrer"
              >
                View Product
              </a>
            </CardFooter>
          </Card>        
        ))}
      </div>

      <div className="flex mt-8 gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
