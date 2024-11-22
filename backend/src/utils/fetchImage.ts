import axios from "axios";
import { load } from "cheerio";

export async function fetchProductImage(productUrl: string): Promise<string | null> {
  try {
    const { data: html } = await axios.get(productUrl);
    const $ = load(html);
    const imageUrl = $("img.main-image-v2.u-noOutline").attr("src");
    return imageUrl || null;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching product image:", error.message);
    } else {
      console.error("Unknown error occurred.");
    }
    return null;
  }
}