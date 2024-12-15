import { Product } from '@shared-types/api';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card className="w-full bg-card text-card-foreground border border-border rounded-lg shadow-md overflow-hidden flex flex-col">
      {/* Clickable Image Container */}
      <a
        href={product.url}
        target="_blank"
        rel="noreferrer"
        className="relative w-full bg-white flex items-center justify-center p-4"
      >
        <div className="relative h-40 w-full">
          <Image
            src={product.image_url || '/images/product_placeholder.jpeg'}
            alt={product.product_name}
            layout="fill"
            objectFit="contain"
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </a>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between py-2">
        {/* Title and Quantity */}
        <div className="flex flex-col gap-1 min-h-[4.5rem]">
          <CardHeader className="flex flex-col gap-1">
            <CardTitle className="text-primary text-base font-semibold line-clamp-2">
              {product.product_name}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {product.product_size}
            </CardDescription>
          </CardHeader>
        </div>

        {/* Price, Brand, and Link */}
        <div className="flex flex-col items-start gap-2">
          <CardContent className="flex flex-col">
            <p className="text-accent font-bold">
              ${product.current_price.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-sm">
              {product.product_brand}
            </p>
          </CardContent>
          <CardFooter>
            <a
              href={product.url}
              target="_blank"
              className="text-primary font-semibold hover:underline hover:text-primary-foreground"
              rel="noreferrer"
            >
              View Product
            </a>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
};
