import { DBUser, DBUserSchema } from '@shared-types/db';
import { GenericRepository } from './GenericRepository';

class UserRepository extends GenericRepository<DBUser> {
  constructor() {
    super('users');
  }

  /**
   * Find or create a user in the database.
   * @param email - The user's email.
   * @param name - The user's name (optional).
   * @returns The user object.
   */
  async findOrCreate(email: string, name?: string): Promise<DBUser> {
    const existingUser = await this.findByField('email', email);
    if (existingUser) {
      return DBUserSchema.parse(existingUser);
    }

    const newUser = await this.create({
      email,
      name,
      destination_email: email, // Default destination email
    });
    return DBUserSchema.parse(newUser);
  }

  /**
   * Fetch the user's destination email.
   * @param userId - The user's ID.
   * @returns The destination email.
   */
  async getDestinationEmail(userId: number): Promise<string | null> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user.destination_email;
  }

  /**
   * Update the user's destination email.
   * @param userId - The user's ID.
   * @param destinationEmail - The new destination email.
   */
  async updateDestinationEmail(
    userId: number,
    destinationEmail: string
  ): Promise<void> {
    await this.update(userId, { destination_email: destinationEmail });
  }
}

export default new UserRepository();
