import axios from "axios";
import dotenv from "dotenv";
import express, { Request, Response } from "express";

import { fetchProductImage } from "@/utils/fetchImage";
import { getProductFromDB, saveProductToDB } from "@/db/productRepository";
import pool from "@/db/db";

dotenv.config();

const app = express();
const PORT = 5000;

app.get("/api/search", async (req: Request, res: Response): Promise<void> => {
  console.log("Received search request");

  const query = req.query.query as string;
  const page = parseInt(req.query.page as string) || 1;
  const size = 20;

  if (!query) {
    console.error("Query parameter is missing");
    res.status(400).json({ error: "Query parameter is required" });
    return;
  }

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
        let cachedProduct = await getProductFromDB(product.barcode);

        if (!cachedProduct) {
          const image_url = await fetchProductImage(product.url);

          cachedProduct = {
            barcode: product.barcode,
            product_name: product.product_name,
            product_brand: product.product_brand,
            current_price: parseFloat(product.current_price),
            product_size: product.product_size,
            url: product.url,
            image_url,
            last_updated: new Date().toISOString(),
          };

          await saveProductToDB(cachedProduct);
        }

        return cachedProduct;
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

app.get("/api/db-test", async (req, res) => {
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
