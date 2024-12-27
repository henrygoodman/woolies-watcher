import { BaseRepository } from './BaseRepository';
import pool from './pool';
import { ZodSchema } from 'zod';

export class GenericRepository<T> implements BaseRepository<T> {
  private tableName: string;
  private schema?: ZodSchema<Partial<T>>;

  constructor(tableName: string, schema?: ZodSchema<Partial<T>>) {
    this.tableName = tableName;
    this.schema = schema;
  }

  async create(data: Partial<T>): Promise<T> {
    if (this.schema) {
      data = this.schema.parse(data);
    }

    const keys = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders}) RETURNING *;`;
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async findById(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1 LIMIT 1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName};`;
    const { rows } = await pool.query(query);
    return rows;
  }

  async findByField<K extends keyof T>(
    field: K,
    value: T[K]
  ): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${String(field)} = $1 LIMIT 1;`;
    const { rows } = await pool.query(query, [value]);
    return rows[0] || null;
  }

  async findFieldById<K extends keyof T>(id: number, field: K): Promise<T[K]> {
    const fieldName = String(field);
    const query = `SELECT ${fieldName} FROM ${this.tableName} WHERE id = $1 LIMIT 1;`;
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      throw new Error(`Record with ID ${id} not found`);
    }
    return rows[0][fieldName];
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *;`;

    const { rows } = await pool.query(query, [id, ...values]);
    return rows[0];
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1;`;
    const { rowCount } = await pool.query(query, [id]);
    return rowCount! > 0;
  }

  async deleteCompoundKey(conditions: Partial<T>): Promise<boolean> {
    if (!conditions || Object.keys(conditions).length === 0) {
      throw new Error('Conditions are required for deleteCompoundKey');
    }

    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys
      .map((key, i) => `${key} = $${i + 1}`)
      .join(' AND ');

    const query = `DELETE FROM ${this.tableName} WHERE ${whereClause};`;
    const { rowCount } = await pool.query(query, values);

    return rowCount! > 0;
  }
}
