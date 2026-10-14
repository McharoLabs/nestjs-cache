import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CacheDataDto } from '../../dto/cache-data.dto';
import { CacheRepository } from '../../repository/cache.repository';
import type { CacheService } from '../../services/cache.service';

class TestCacheDataDto extends CacheDataDto {
  public constructor(
    public value: string,
    ttl?: number,
  ) {
    super(ttl);
  }
}

class TestCacheRepository extends CacheRepository<TestCacheDataDto> {
  public constructor(cacheService: CacheService) {
    super();

    Object.defineProperty(this, 'cacheService', {
      configurable: true,
      value: cacheService,
    });
  }

  protected getKey(id: string): string {
    return `test:${id}`;
  }
}

describe('CacheRepository', () => {
  let repository: TestCacheRepository;

  const cacheService = {
    get: jest.fn<(key: string) => Promise<TestCacheDataDto | undefined>>(),
    set: jest.fn<
      <T extends CacheDataDto>(key: string, value: T) => Promise<T>
    >(),
    delete: jest.fn<(key: string) => Promise<boolean>>(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    repository = new TestCacheRepository(
      cacheService as unknown as CacheService,
    );
  });

  it('should save data using the generated key', async () => {
    const data = new TestCacheDataDto('example');
    cacheService.set.mockResolvedValue(data);

    const result = await repository.save('123', data);

    expect(cacheService.set).toHaveBeenCalledWith('test:123', data);
    expect(result).toBe(data);
  });

  it('should find data by ID', async () => {
    const data = new TestCacheDataDto('example');
    cacheService.get.mockResolvedValue(data);

    const result = await repository.findById('123');

    expect(cacheService.get).toHaveBeenCalledWith('test:123');
    expect(result).toBe(data);
  });

  it('should return undefined when data is not found', async () => {
    cacheService.get.mockResolvedValue(undefined);

    const result = await repository.findById('missing');

    expect(result).toBeUndefined();
  });

  it('should update existing data and preserve createdAt', async () => {
    const createdAt = new Date('2025-01-01T00:00:00.000Z');
    const existing = new TestCacheDataDto('old value', 30_000);
    existing.createdAt = createdAt;
    existing.updatedAt = createdAt;

    cacheService.get.mockResolvedValue(existing);

    const updated = new TestCacheDataDto('new value');
    const result = await repository.update('123', updated);

    expect(result).toBe(updated);
    expect(updated.createdAt).toBe(createdAt);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      createdAt.getTime(),
    );
    expect(updated.ttl).toBe(30_000);
    expect(cacheService.set).toHaveBeenCalledWith('test:123', updated);
  });

  it('should return undefined when updating a missing entry', async () => {
    cacheService.get.mockResolvedValue(undefined);

    const result = await repository.update(
      'missing',
      new TestCacheDataDto('new value'),
    );

    expect(result).toBeUndefined();
    expect(cacheService.set).not.toHaveBeenCalled();
  });

  it('should find multiple IDs', async () => {
    const first = new TestCacheDataDto('first');
    const second = new TestCacheDataDto('second');

    cacheService.get.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    const result = await repository.findByIds(['1', '2']);

    expect(result).toEqual([first, second]);
    expect(cacheService.get).toHaveBeenNthCalledWith(1, 'test:1');
    expect(cacheService.get).toHaveBeenNthCalledWith(2, 'test:2');
  });

  it('should delete data by ID', async () => {
    cacheService.delete.mockResolvedValue(true);

    const result = await repository.delete('123');

    expect(cacheService.delete).toHaveBeenCalledWith('test:123');
    expect(result).toBe(true);
  });
});
