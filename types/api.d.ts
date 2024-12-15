export interface Product {
  id?: number;
  barcode: string | null;
  product_name: string;
  product_brand: string;
  current_price: number;
  product_size: string;
  url: string;
  image_url: string | null;
  last_updated: string;
}

export type ProductIdentifier = Pick<
  Product,
  'id' | 'barcode' | 'product_name'
>;

export interface User {
  name: string;
  email: string;
}
