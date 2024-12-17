'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DBProduct } from '@shared-types/db';
import Image from 'next/image';
import Link from 'next/link';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorMessage } from '@/components/ErrorMessage';
import { fetchProductDetailsApi } from '@/lib/api/productApi';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        const productData = await fetchProductDetailsApi(Number(id));
        setProduct(productData);
      } catch (err) {
        setError('Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProductDetails();
  }, [id]);

  if (loading) return <LoadingIndicator />;
  if (error || !product) return <ErrorMessage message={error || 'Not found'} />;

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image */}
        <div className="w-full lg:w-1/3">
          <Image
            src={product.image_url || '/images/product_placeholder.jpeg'}
            alt={product.product_name}
            width={400}
            height={400}
            className="rounded-lg object-contain bg-white"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary mb-4">
            {product.product_name}
          </h1>
          <p className="text-muted-foreground mb-2">
            Brand: <strong>{product.product_brand}</strong>
          </p>
          <p className="text-muted-foreground mb-2">
            Size: <strong>{product.product_size}</strong>
          </p>
          <p className="text-accent text-2xl font-semibold mb-4">
            ${product.current_price.toFixed(2)}
          </p>

          {/* External Product Link */}
          <Link
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            View on Woolworths
          </Link>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Additional Information</h2>

        {/* Placeholder Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Historical Price</h3>
            <div className="h-32 bg-gray-200 flex items-center justify-center">
              <span className="text-muted-foreground">Coming Soon</span>
            </div>
          </div>

          <div className="p-4 border rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Number of Watchers</h3>
            <div className="h-32 bg-gray-200 flex items-center justify-center">
              <span className="text-muted-foreground">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
