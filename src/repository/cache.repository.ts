import { Inject } from '@nestjs/common';
import { CacheDataDto } from '../dto/cache-data.dto';
import { CacheService } from '../services/cache.service';

export abstract class CacheRepository<
  T extends CacheDataDto,
  ID extends string | number = string,
> {
  @Inject(CacheService)
  protected readonly cacheService: CacheService;

  protected abstract getKey(id: ID): string;

  async save(id: ID, data: T): Promise<T> {
    const key = this.getKey(id);
    await this.cacheService.set<T>(key, data);
    return data;
  }

  async findById(id: ID): Promise<T | undefined> {
    const key = this.getKey(id);
    return this.cacheService.get<T>(key);
  }

  async update(id: ID, data: T): Promise<T | undefined> {
    const existing = await this.findById(id);

    if (!existing) {
      return undefined;
    }

    data.createdAt = existing.createdAt;
    data.updatedAt = new Date();

    if (data.ttl === undefined && existing.ttl !== undefined) {
      data.ttl = existing.ttl;
    }

    const key = this.getKey(id);

    await this.cacheService.set<T>(key, data);
    return data;
  }

  async findByIds(ids: ID[]): Promise<(T | undefined)[]> {
    return Promise.all(ids.map((id) => this.findById(id)));
  }

  async delete(id: ID): Promise<boolean> {
    const key = this.getKey(id);
    return this.cacheService.delete(key);
  }
}
