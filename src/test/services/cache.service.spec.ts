import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Cache } from '@nestjs/cache-manager';
import { CacheDataDto } from '../../dto/cache-data.dto';
import { CacheService } from '../../services/cache.service';

class TestCacheDataDto extends CacheDataDto {
  public constructor(
    public readonly value: string,
    ttl?: number,
  ) {
    super(ttl);
  }
}

describe('CacheService', () => {
  let service: CacheService;

  const cacheManager = {
    get: jest.fn<<T>(key: string) => Promise<T | undefined>>(),
    set: jest.fn<
      (key: string, value: unknown, ttl?: number) => Promise<void>
    >(),
    del: jest.fn<(key: string) => Promise<void>>(),
    clear: jest.fn<() => Promise<void>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    service = new CacheService(cacheManager as unknown as Cache);
  });

  it('should retrieve a cached value', async () => {
    const data = new TestCacheDataDto('cached value');
    cacheManager.get.mockResolvedValue(data);

    const result = await service.get<TestCacheDataDto>('test-key');

    expect(result).toBe(data);
    expect(cacheManager.get).toHaveBeenCalledWith('test-key');
  });

  it('should return undefined when the key does not exist', async () => {
    cacheManager.get.mockResolvedValue(undefined);

    const result = await service.get<TestCacheDataDto>('missing-key');

    expect(result).toBeUndefined();
  });

  it('should save a value without an explicit TTL', async () => {
    const data = new TestCacheDataDto('test value');

    const result = await service.set('test-key', data);

    expect(cacheManager.set).toHaveBeenCalledWith('test-key', data);
    expect(result).toBe(data);
  });

  it('should save a value with its TTL', async () => {
    const data = new TestCacheDataDto('test value', 30_000);

    const result = await service.set('test-key', data);

    expect(cacheManager.set).toHaveBeenCalledWith('test-key', data, 30_000);
    expect(result).toBe(data);
  });

  it('should delete a cached value', async () => {
    const result = await service.delete('test-key');

    expect(cacheManager.del).toHaveBeenCalledWith('test-key');
    expect(result).toBe(true);
  });

  it('should clear the cache', async () => {
    const result = await service.clear();

    expect(cacheManager.clear).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should propagate errors when retrieving a value fails', async () => {
    const error = new Error('Cache retrieval failed');
    cacheManager.get.mockRejectedValue(error);

    await expect(service.get<TestCacheDataDto>('test-key')).rejects.toThrow(
      'Cache retrieval failed',
    );
  });
});
