import { DBProduct } from '@shared-types/db';

/**
 * Generate the HTML content for the watchlist email with improved categorization and a contact link.
 */
export const generateWatchlistEmail = (
  watchlist: (DBProduct & { old_price?: number })[]
): string => {
  // Separate products with and without price updates
  const updatedProducts = watchlist
    .filter((product) => product.old_price !== undefined)
    .sort((a, b) => {
      // Sort by price drop first, then by price increase
      const aChange = a.old_price! - a.current_price!;
      const bChange = b.old_price! - b.current_price!;
      return bChange - aChange; // Higher drops (negative values) come first
    });

  const regularProducts = watchlist.filter(
    (product) => product.old_price === undefined
  );

  const hasUpdates = updatedProducts.length > 0;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Watchlist</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          font-size: 24px;
          color: #007bff;
        }
        h2 {
          font-size: 20px;
          margin-top: 20px;
          color: #555;
        }
        ul {
          list-style: none;
          padding: 0;
        }
        li {
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
        }
        li:last-child {
          border-bottom: none;
        }
        a {
          color: #007bff;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          text-align: center;
          color: #666;
        }
        .footer a {
          color: #007bff;
        }
        .price {
          display: inline-block;
          margin: 0 5px;
        }
        .price-old {
          color: #333; /* Default for old price */
          text-decoration: line-through;
        }
        .price-new.decreased {
          color: green;
        }
        .price-new.increased {
          color: red;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your Daily Watchlist</h1>
        <p>Here are the latest updates from your watchlist:</p>

        <!-- Section for products with price updates -->
        ${
          hasUpdates
            ? `
            <h2>Recently Updated Products</h2>
            <ul>
              ${updatedProducts
                .map((product) => {
                  const isIncreased =
                    product.old_price! < product.current_price!;
                  return `
                  <li>
                    <strong>${product.product_name}</strong>${
                      product.product_brand ? ` (${product.product_brand})` : ''
                    }<br />
                    <span class="price price-old">$${Number(
                      product.old_price
                    ).toFixed(2)}</span>
                    <span class="price price-new ${
                      isIncreased ? 'increased' : 'decreased'
                    }">$${Number(product.current_price).toFixed(2)}</span><br />
                    <a href="${product.url}" target="_blank">View Product</a>
                  </li>
                `;
                })
                .join('')}
            </ul>
          `
            : `
            <h2>No Recent Price Updates</h2>
            <p>There were no price changes in your watchlist products over the past 24 hours.</p>
          `
        }

        <!-- Section for all products -->
        <h2>${
          hasUpdates
            ? 'All Other Products in Your Watchlist'
            : 'All Products in Your Watchlist'
        }</h2>
        <ul>
          ${regularProducts
            .map(
              (product) => `
              <li>
                <strong>${product.product_name}</strong>${
                  product.product_brand ? ` (${product.product_brand})` : ''
                }<br />
                Price: $${Number(product.current_price).toFixed(2)}<br />
                <a href="${product.url}" target="_blank">View Product</a>
              </li>
            `
            )
            .join('')}
        </ul>

        <div class="footer">
          <p>Need help or have questions? <a href="mailto:contact@henrygoodman.dev">Contact us</a>.</p>
          <p>To unsubscribe, please visit <a href="https://woolieswatcher.com/settings" target="_blank">settings page</a> and toggle the "Enable Email Updates" option.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
