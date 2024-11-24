export interface SearchQueryParams {
    query: string;
    page: number;
    size: number;
  }
  
  export interface Product {
    barcode: string;
    product_name: string;
    product_brand: string;
    current_price: number;
    product_size: string;
    url: string;
    image_url: string | null;
    last_updated: string;
  }
  
  export interface SearchResponse {
    query: string;
    page: number;
    size: number;
    total_results: number;
    total_pages: number;
    results: Product[];
  }
  