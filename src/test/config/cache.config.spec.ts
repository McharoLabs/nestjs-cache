import { describe, expect, it } from '@jest/globals';
import { createCacheConfig } from '../../config/cache.config';
import type { CacheConfig } from '../../types/cache.types';


describe('createCacheConfig', () => {
  const config: CacheConfig = {
    appName: 'test-app',
    defaultStore: 'memory',
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'test-password',
    },
    memory: {
      ttl: 60_000,
    },
  };

  it('should preserve the default store', () => {
    const result = createCacheConfig(config);

    expect(result.defaultStore).toBe('memory');
  });

  it('should provide memory and Redis store factories', () => {
    const result = createCacheConfig(config);

    expect(typeof result.stores.memory).toBe('function');
    expect(typeof result.stores.redis).toBe('function');
  });

  it('should create a memory store', () => {
    const result = createCacheConfig(config);
    const stores = result.stores.memory();

    expect(stores).toHaveLength(1);
    expect(stores[0]).toBeDefined();
  });

  it('should create a Redis store', () => {
    const result = createCacheConfig(config);
    const stores = result.stores.redis();

    expect(stores).toHaveLength(1);
    expect(stores[0]).toBeDefined();
  });

  it('should create a Redis store without a password', () => {
    const configWithoutPassword: CacheConfig = {
      ...config,
      redis: {
        host: 'localhost',
        port: 6379,
      },
    };

    const result = createCacheConfig(configWithoutPassword);

    expect(result.stores.redis()).toHaveLength(1);
  });
});
