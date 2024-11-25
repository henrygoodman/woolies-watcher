import axios from 'axios';
import * as cheerio from 'cheerio'; // Ensure proper import

export async function fetchProductImage(
  productUrl: string
): Promise<string | null> {
  try {
    const { data: html } = await axios.get(productUrl);

    if (!html) {
      console.error(`Failed to fetch HTML content from: ${productUrl}`);
      return null;
    }

    const $ = cheerio.load(html);
    const imageUrl = $('img.main-image-v2.u-noOutline').attr('src');

    if (!imageUrl) {
      console.error(`No image URL found for the product page: ${productUrl}`);
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error(`Error fetching product image from ${productUrl}:`, error);
    return null;
  }
}
