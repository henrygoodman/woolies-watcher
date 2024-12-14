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
    <Card className="w-full">
      <CardHeader>
        <div className="w-full h-48 relative object-contain rounded-t-xl overflow-hidden">
          <Image
            src={product.image_url || '/images/product_placeholder.jpeg'}
            alt={product.product_name}
            layout="fill"
            objectFit="contain"
          />
        </div>
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
  );
};
