import { RequestHandler } from 'express';
import axios from 'axios';
import { fetchProductImage } from '@/utils/fetchImage';
import { findProductByFields, saveProductToDB } from '@/db/productRepository';
import { parseQueryParams } from '@/utils/parseQueryParams';
import { DBProduct } from '@shared-types/db';
import { ProductSearchResponse } from '@shared-types/api';

const isStaleProduct = (lastUpdated: string): boolean => {
  const cutoff = new Date();
  cutoff.setHours(3, 0, 0, 0); // 3 AM today
  return new Date(lastUpdated) < cutoff;
};

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

        let cachedProduct = await findProductByFields(barcode, product_name);

        if (cachedProduct && isStaleProduct(cachedProduct.last_updated)) {
          // Update only the price field if stale
          cachedProduct.current_price = parseFloat(product.current_price);
          cachedProduct.last_updated = new Date().toISOString();
          await saveProductToDB(cachedProduct);
        }

        const productToSave: DBProduct = {
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

        if (!productToSave.image_url) {
          setImmediate(async () => {
            try {
              const image_url = await fetchProductImage(product.url);
              productToSave.image_url = image_url || '/images/placeholder.jpeg';
              await saveProductToDB(productToSave);
            } catch (error) {
              console.error(
                `Failed to fetch image for ${product_name}:`,
                error
              );
            }
          });
        }

        return productToSave;
      })
    );

    res.json({
      query,
      page,
      size,
      total_results: response.data.total_results,
      total_pages: response.data.total_pages,
      results,
    } as ProductSearchResponse);
  } catch (error) {
    console.error('Error occurred during search request:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};

export const handleSearchProductByName: RequestHandler = async (req, res) => {
  const { productName } = req.params;

  if (!productName || typeof productName !== 'string') {
    res.status(400).json({ error: 'Product name is required' });
    return;
  }

  try {
    let cachedProduct = await findProductByFields(null, productName);

    if (cachedProduct && !isStaleProduct(cachedProduct.last_updated)) {
      res.json(cachedProduct);
      return;
    }

    const response = await axios.get(
      'https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          'x-rapidapi-host': 'woolworths-products-api.p.rapidapi.com',
        },
        params: { query: productName, page: 1, size: 1 },
      }
    );

    const results = response.data.results;
    if (!results || results.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = results[0];
    const barcode = product.barcode ? String(product.barcode) : null;

    const productToSave: DBProduct = {
      id: cachedProduct?.id,
      barcode: barcode,
      product_name: product.product_name,
      product_brand: product.product_brand,
      current_price: parseFloat(product.current_price),
      product_size: product.product_size,
      url: product.url,
      image_url: cachedProduct?.image_url || null,
      last_updated: new Date().toISOString(),
    };

    const savedProduct = await saveProductToDB(productToSave);

    if (!productToSave.image_url) {
      setImmediate(async () => {
        try {
          const image_url = await fetchProductImage(product.url);
          savedProduct.image_url = image_url || '/images/placeholder.jpeg';
          await saveProductToDB(savedProduct);
        } catch (error) {
          console.error(
            `Image fetch failed for ${product.product_name}:`,
            error
          );
        }
      });
    }

    res.json(savedProduct);
  } catch (error) {
    console.error('Error fetching product by name:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
