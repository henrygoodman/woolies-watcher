import { DBProduct } from '@shared-types/db';

/**
 * Generate the HTML content for the watchlist email with improved categorization and a contact link.
 */
export const generateWatchlistEmail = (
  watchlist: DBProduct[],
  contactEmail: string
): string => {
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Your Daily Watchlist</h1>
        <p>Here are the latest updates from your watchlist:</p>
        <ul>
          ${watchlist
            .map(
              (product) => `
              <li>
                <strong>${product.product_name}</strong> (${product.product_brand || '-'})<br />
                Price: $${Number(product.current_price).toFixed(2)}<br />
                <a href="${product.url}" target="_blank">View Product</a>
              </li>
            `
            )
            .join('')}
        </ul>
        <div class="footer">
          <p>Need help or have questions? <a href="mailto:${contactEmail}">Contact us</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
