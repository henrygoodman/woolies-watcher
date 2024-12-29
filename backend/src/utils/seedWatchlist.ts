import UserRepository from '@/db/userRepository';
import WatchlistRepository from '@/db/watchlistRepository';
import { fetchProducts } from '@/services/product/productService';

/**
 * Initialize the seeding process for watched products.
 * Ensures no duplicate seeding if already seeded.
 */
export async function initSeeding() {
  const reservedEmail = 'anonymous@watcher.com';
  const reservedName = 'Anonymous User';

  try {
    const reservedUser = await UserRepository.findOrCreate(
      reservedEmail,
      reservedName
    );
    const reservedUserId = reservedUser.id!;

    const existingEntries =
      await WatchlistRepository.getWatchlist(reservedUserId);

    if (existingEntries.length > 0) {
      console.log('Seeding skipped. Watchlist already populated.');
      return;
    }

    console.log('No existing entries found. Starting seeding...');
    await seedWatchedProducts(reservedUserId);

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error during seeding initialization:', error);
    throw new Error('Failed to initialize seeding.');
  }
}

/**
 * Seed watched products for the reserved anonymous user (so we can seed some price updates).
 * @param reservedUserId - The ID of the reserved user.
 */
async function seedWatchedProducts(reservedUserId: number) {
  const queries = [
    'Beef',
    'Chicken',
    'Fish',
    'Bakery',
    'Dairy',
    'Eggs',
    'Frozen Food',
    'Snacks',
    'Beverages',
    'Meat',
    'Seafood',
    'Fruits',
    'Vegetables',
    'Pasta',
    'Rice',
    'Cereals',
    'Sauces',
    'Condiments',
    'Spices',
    'Herbs',
    'Juices',
    'Coffee',
    'Tea',
    'Biscuits',
    'Chips',
    'Crackers',
    'Cakes',
    'Desserts',
    'Yogurt',
    'Milk Alternatives',
    'Cheese',
    'Butter',
    'Oil',
    'Canned Food',
    'Pickles',
    'Jam',
    'Honey',
    'Peanut Butter',
    'Ice Cream',
    'Ready Meals',
    'Nuts',
    'Dried Fruits',
    'Baby Food',
    'Pet Food',
    'Breakfast Bars',
    'Muesli',
    'Bread',
    'Wraps',
    'Tofu',
    'Plant-based Protein',
    'Soup',
    'Baking Supplies',
    'Energy Drinks',
  ];

  for (const query of queries) {
    try {
      const productResponse = await fetchProducts(query, 1, 20);

      const products = productResponse.results;

      for (const product of products) {
        await WatchlistRepository.addToWatchlist(reservedUserId, product.id!);
      }
    } catch (error) {
      console.error(`Error fetching products for query "${query}":`, error);
    }
  }
}
