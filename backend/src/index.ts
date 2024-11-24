import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

import { fetchProductImage } from "@/utils/fetchImage";
import { getProductFromDB, saveProductToDB } from "@/db/productRepository";
import { SearchQueryParams, SearchResponse } from "@shared-types/api";
import pool from "@/db/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const parseQueryParams = (req: Request): SearchQueryParams | null => {
  const query = req.query.query as string;

  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const size = req.query.size ? parseInt(req.query.size as string, 10) : 20;

  if (!query) {
    return null;
  }

  return {
    query,
    page: page,
    size: size,
  };
};

app.get("/api/search", async (req: Request, res: Response<SearchResponse | { error: string }>) => {
  const queryParams = parseQueryParams(req);

  if (!queryParams) {
    res.status(400).json({ error: "Query parameter is required" });
    return;
  }

  const { query, page, size } = queryParams;

  try {
    const response = await axios.get(
      "https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/",
      {
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
          "x-rapidapi-host": "woolworths-products-api.p.rapidapi.com",
        },
        params: { query, page, size },
      }
    );

    const results = await Promise.all(
      response.data.results.map(async (product: any) => {
        const barcode = String(product.barcode);
        const cachedProduct = await getProductFromDB(barcode);

        if (!cachedProduct) {
          const productWithoutImage = {
            barcode: barcode,
            product_name: product.product_name,
            product_brand: product.product_brand,
            current_price: parseFloat(product.current_price),
            product_size: product.product_size,
            url: product.url,
            image_url: null,
            last_updated: new Date().toISOString(),
          };

          await saveProductToDB(productWithoutImage);

          fetchProductImage(product.url)
            .then(async (image_url) => {
              if (image_url) {
                await saveProductToDB({ ...productWithoutImage, image_url });
                console.log(`Image updated for product ${barcode}`);
              }
            })
            .catch((error) => {
              console.error(`Failed to fetch image for ${barcode}:`, error);
            });
        }

        return cachedProduct || { ...product, image_url: null };
      })
    );

    res.json({
      query,
      page,
      size,
      total_results: response.data.total_results,
      total_pages: response.data.total_pages,
      results,
    });
  } catch (error) {
    console.error("Error occurred during search request:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/api/db-test", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT 1+1 AS result");
    res.json({ success: true, result: result.rows[0] });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Failed to connect to the database" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});