export interface DBPriceUpdate {
  id: number;
  product_id: number;
  old_price: number;
  new_price: number;
  updated_at: string;
}
