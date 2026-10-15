export type CacheStore = 'memory' | 'redis';

export interface CacheRedisConfig {
  host: string;
  port: number;
  ttl: number;
  password?: string;
}

export interface CacheMemoryConfig {
  ttl: number;
}

interface BaseCacheConfig {
  appName?: string;
}

export interface RedisCacheConfig extends BaseCacheConfig {
  defaultStore: 'redis';
  redis: CacheRedisConfig;
  memory?: CacheMemoryConfig;
}

export interface MemoryCacheConfig extends BaseCacheConfig {
  defaultStore: 'memory';
  memory: CacheMemoryConfig;
  redis?: CacheRedisConfig;
}

export type CacheConfig = RedisCacheConfig | MemoryCacheConfig;
