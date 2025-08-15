import { AppDataSource } from '../../config/database'

export abstract class BaseRepository<T> {
  protected repository: any

  constructor(entityClass: new () => T) {
    this.repository = AppDataSource.getRepository(entityClass)
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findOne(where: any): Promise<T | null> {
    return this.repository.findOne({ where })
  }

  async findMany(options?: any): Promise<T[]> {
    return this.repository.find(options)
  }

  async create(data: any): Promise<T> {
    const entity = this.repository.create(data)
    return this.repository.save(entity)
  }

  async update(id: string, data: any): Promise<T | null> {
    await this.repository.update(id, data)
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id)
    return result.affected !== undefined && result.affected > 0
  }

  async exists(where: any): Promise<boolean> {
    const count = await this.repository.count({ where })
    return count > 0
  }

  async count(where?: any): Promise<number> {
    return this.repository.count({ where })
  }
}