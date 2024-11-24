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

import { Product, SearchQueryParams, SearchResponse } from "@shared-types/api";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (searchQuery: string, page: number) => {
    setLoading(true);
    setError(null);

    const params: SearchQueryParams = {
      query: searchQuery,
      page,
      size: 20,
    };

    try {
      const response = await fetch(
        `/api/search?query=${params.query}&page=${params.page}&size=${params.size}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data: SearchResponse = await response.json();

      setProducts(data.results);
      setCurrentPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
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

  useEffect(() => {
    if (!products.length) return;
  
    const pollForUpdates = async () => {
      try {
        const response = await fetch(`/api/search?query=${query}&page=${currentPage}`);
        if (!response.ok) {
          console.error(`Polling failed: ${response.status}`);
          return;
        }
  
        const data: SearchResponse = await response.json();
  
        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            const updatedProduct = data.results.find((p) => p.barcode === product.barcode);

            console.log("Here", data.results, updatedProduct, product)
            // Only update if the image_url is different
            if (updatedProduct && updatedProduct.image_url !== product.image_url) {
              console.log("Updated", updatedProduct)
              return { ...product, image_url: updatedProduct.image_url };
            }
  
            return product;
          })
        );
      } catch (err) {
        console.error("Error polling for updates:", err);
      }
    };
  
    const interval = setInterval(pollForUpdates, 5000);
  
    return () => clearInterval(interval);
  }, [products, query, currentPage]);  

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-4">Search Groceries</h1>
      <SearchBar onSearch={handleSearch} />

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && products.length === 0 && query && (
        <p className="text-gray-500">No products found for "{query}".</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-5xl">
        {products.map((product) => (
          <Card key={product.barcode} className="w-full">
            <CardHeader>
              <img
                src={product.image_url || "https://placehold.co/200"}
                alt={product.product_name}
                className="w-full h-48 object-contain rounded-t-xl"
              />
              <CardTitle>{product.product_name}</CardTitle>
              <CardDescription>{product.product_size}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 font-bold">
                ${product.current_price.toFixed(2)}
              </p>
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

      {products.length > 0 && (
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
      )}
    </main>
  );
}