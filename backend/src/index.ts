import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
const PORT = 5000;

const RAPIDAPI_KEY = "66059ebb9emshb8b96747be67c8bp1985f4jsn4f5377e0a4eb";
const RAPIDAPI_HOST = "woolworths-products-api.p.rapidapi.com";

app.get(
  "/api/search",
  async (req: Request, res: Response): Promise<void> => {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string) || 1;
    const size = 20; // Hardcoded to 20 results per page

    if (!query) {
      res.status(400).json({ error: "Query parameter is required" });
      return;
    }

    try {
      const response = await axios.get(
        `https://${RAPIDAPI_HOST}/woolworths/product-search/`,
        {
          headers: {
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": RAPIDAPI_HOST,
            Accept: "application/json",
          },
          params: { query, page, size },
        }
      );

      // Pass through the response from the API
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching data from RapidAPI:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
