import { BaseRepository } from '../../repositories/base/BaseRepository'

export abstract class BaseService<T> {
  protected repository: BaseRepository<T>

  constructor(repository: BaseRepository<T>) {
    this.repository = repository
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id)
  }

  async getAll(): Promise<T[]> {
    return this.repository.findMany()
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data)
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return this.repository.update(id, data)
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id)
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists({ id } as any)
  }

  protected validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid ID provided')
    }
  }

  protected validateRequiredFields(data: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Required field '${field}' is missing`)
      }
    }
  }
} 