export interface BaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  findByField<K extends keyof T>(field: K, value: T[K]): Promise<T | null>;
  /* Could add a findByFields generic method, but it feels messy */
  findFieldById<K extends keyof T>(id: number, field: K): Promise<T[K]>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<boolean>;
  deleteCompoundKey(conditions: Partial<T>): Promise<boolean>;
}
