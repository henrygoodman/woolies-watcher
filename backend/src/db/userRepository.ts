import { DBUser, DBUserSchema } from '@shared-types/db';
import { GenericRepository } from './GenericRepository';

class UserRepository extends GenericRepository<DBUser> {
  constructor() {
    super('users', DBUserSchema);
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

    const newUser: DBUser = {
      email,
      name: name || null,
      destination_email: email,
      enable_emails: true,
      theme_dark: false,
    };

    const createdUser = await this.create(newUser);
    return DBUserSchema.parse(createdUser);
  }
}

export default new UserRepository();
