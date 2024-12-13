import { Request, Response, RequestHandler } from 'express';
import axios from 'axios';
import { fetchProductImage } from '@/utils/fetchImage';
import { findProductByFields, saveProductToDB } from '@/db/productRepository';
import { parseQueryParams } from '@/utils/parseQueryParams';
import { Product } from '@shared-types/api';

interface SearchResponse {
  query: string;
  page: number;
  size: number;
  total_results: number;
  total_pages: number;
  results: Product[];
}

export const handleSearchProducts: RequestHandler = async (req, res) => {
  const queryParams = parseQueryParams(req);

  if (!queryParams) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  const { query, page, size } = queryParams;

  try {
    const response = await axios.get(
      'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
        params: { query, page, size },
      }
    );

    const results = await Promise.all(
      response.data.results.map(async (product: any) => {
        const barcode = product.barcode ? String(product.barcode) : null;
        const product_name = product.product_name;

        const cachedProduct = await findProductByFields(barcode, product_name);

        const productToSave: Product = {
          id: cachedProduct?.id,
          barcode: barcode,
          product_name,
          product_brand: product.product_brand,
          current_price: parseFloat(product.current_price),
          product_size: product.product_size,
          url: product.url,
          image_url: cachedProduct?.image_url || null,
          last_updated: new Date().toISOString(),
        };

        await saveProductToDB(productToSave);

        // If the product lacks an image URL, fetch and update it in the background
        if (!productToSave.image_url) {
          setImmediate(async () => {
            const startTime = Date.now();
            try {
              const image_url = await fetchProductImage(product.url);
              const endTime = Date.now();
              const timeTaken = endTime - startTime;

              if (image_url) {
                productToSave.image_url = image_url;
              } else {
                productToSave.image_url = 'https://placehold.co/200';
              }

              await saveProductToDB(productToSave);

              console.log(
                `Image fetch completed (${product_name}) in ${timeTaken}ms`
              );
            } catch (error) {
              console.error(
                `Failed to fetch image for product ${product_name}:`,
                error
              );

              productToSave.image_url = 'https://placehold.co/200';
              await saveProductToDB(productToSave);
            }
          });
        }

        return productToSave;
      })
    );

    // Immediately return the results (image URLs may still be null)
    res.json({
      query,
      page,
      size,
      total_results: response.data.total_results,
      total_pages: response.data.total_pages,
      results,
    } as SearchResponse);
  } catch (error) {
    console.error('Error occurred during search request:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
