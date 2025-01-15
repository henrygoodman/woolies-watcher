'use client';

import { useState, useEffect } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { fetchProductApi } from '@/lib/api/productApi';
import { DBProduct } from '@shared-types/db';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HeartIcon } from '@/components/HeartIcon';
import { PriceChart } from '@/components/PriceChart';
import { Eye } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchCount, setWatchCount] = useState<number>(0);

  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        const productData = await fetchProductApi(Number(id));
        setProduct(productData);
        setWatchCount(productData.watch_count || 0);
      } catch (err) {
        setError('Error loading product details: ' + err);
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

  const handleWatchCountChange = (isInWatchlist: boolean) => {
    setWatchCount((prev) => prev + (isInWatchlist ? 1 : -1));
  };

  if (loading) return <LoadingIndicator />;
  if (error || !product) return <ErrorMessage error={error || 'Not found'} />;

  return (
    <div className="container max-w-7xl mx-auto p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Product Image */}
        <div className="relative w-full lg:w-1/3 bg-white p-4 rounded-xl shadow-md">
          <HeartIcon product={product} onToggle={handleWatchCountChange} />

          <div className="relative w-full h-80 flex items-center justify-center p-2 bg-white">
            <img
              src={product.image_url || '/images/product_placeholder.jpeg'}
              alt={product.product_name}
              className="rounded-md object-contain"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
              loading="lazy"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary leading-tight mb-4">
            {product.product_name}
          </h1>
          <p className="text-muted-foreground mb-2">
            Brand: <strong>{product.product_brand || '-'}</strong>
          </p>
          <p className="text-muted-foreground mb-2">
            Size: <strong>{product.product_size || '-'}</strong>
          </p>
          <p className="text-primary text-2xl font-semibold mb-4">
            ${product.current_price.toFixed(2)}
          </p>

          {/* Watcher Info */}
          <div className="mt-6 mb-6 flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="text-primary font-semibold text-lg">
              {watchCount}
            </span>
          </div>

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

      {/* Price Chart */}
      <div className="mt-8">
        <PriceChart
          currentPrice={product.current_price}
          productId={product.id!}
        />
      </div>
    </div>
  );
}
