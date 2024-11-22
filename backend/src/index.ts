import express, { Request, Response } from "express";
import axios from "axios";
import { fetchProductImage } from "./utils/fetchImage";
import dotenv from "dotenv";

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
    const response = await axios.get("https://woolworths-products-api.p.rapidapi.com/woolworths/product-search/", {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "",
        "x-rapidapi-host": "woolworths-products-api.p.rapidapi.com",
      },
      params: { query, page, size },
    });

    const results = await Promise.all(
      response.data.results.map(async (product: any) => {
        const imageUrl = await fetchProductImage(product.url);
        return { ...product, imageUrl };
      })
    );

    res.json({ ...response.data, results });
  } catch (error) {
    console.error("Error occurred during request:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
