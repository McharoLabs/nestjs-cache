import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CacheDataDto } from '../dto/cache-data.dto';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get<T extends CacheDataDto>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T extends CacheDataDto>(key: string, value: T): Promise<T> {
    if (value.ttl === undefined) {
      await this.cacheManager.set(key, value);
    } else {
      await this.cacheManager.set(key, value, value.ttl);
    }

    return value;
  }

  async delete(key: string): Promise<boolean> {
    await this.cacheManager.del(key);

    return true;
  }

  async clear(): Promise<boolean> {
    await this.cacheManager.clear();

    return true;
  }
}
