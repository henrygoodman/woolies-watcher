'use client';

import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { fetchProductDetailsApi } from '@/lib/api/productApi';
import { DBProduct } from '@shared-types/db';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@/components/HeartIcon';
import { PriceChart } from '@/components/PriceChart';

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

  useEffect(() => {
    if (product?.product_name) {
      document.title = `${product.product_name} - Woolies Watcher`;
    }
  }, [product]);

  if (loading) return <LoadingIndicator />;
  if (error || !product) return <ErrorMessage message={error || 'Not found'} />;

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image */}
        <div className="relative w-full lg:w-1/3 bg-white p-4 rounded-xl shadow-md">
          {/* Heart Icon Positioned on Top of Image */}
          <HeartIcon product={product} />

          <div className="relative w-full h-80 flex items-center justify-center">
            <Image
              src={product.image_url || '/images/product_placeholder.jpeg'}
              alt={product.product_name}
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary leading-tight mb-4">
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
            className="text-primary hover:underline font-medium"
          >
            View on Woolworths
          </Link>
        </div>
      </div>

      {/* Placeholder Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriceChart productId={product.id!} />
        <div className="p-4 border rounded-md shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Number of Watchers</h3>
          <div className="h-32 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
